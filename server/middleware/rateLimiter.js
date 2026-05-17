const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_eduhub_2026';

// In-memory store for tracking upload attempts
// Key: 'user_<userId>' or 'ip_<ip>'
// Value: Array of attempt timestamps (numbers)
const uploadStore = new Map();

const uploadLimiter = (req, res, next) => {
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const now = Date.now();
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // 1. Identify User (decode JWT from Authorization header)
    let userId = null;
    let username = 'guest';

    if (req.user) {
        userId = req.user.id;
        username = req.user.username || `User #${req.user.id}`;
    } else {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
                username = `User #${decoded.id}`;
            } catch (err) {
                // Ignore decoding errors, fallback to guest
            }
        }
    }

    const key = userId ? `user_${userId}` : `ip_${ip}`;
    const limit = userId ? 20 : 10;

    // Retrieve or initialize attempts list
    if (!uploadStore.has(key)) {
        uploadStore.set(key, []);
    }

    let attempts = uploadStore.get(key);
    // Filter attempts to only keep those within the 15-minute window
    attempts = attempts.filter(time => now - time < windowMs);

    const remaining = Math.max(0, limit - attempts.length);

    console.log(`[RATE LIMIT] User: ${username} | IP: ${ip} | Remaining: ${remaining}/${limit}`);

    if (attempts.length >= limit) {
        return res.status(429).json({
            message: "Too many upload requests from this IP, please try again after 15 minutes."
        });
    }

    // Record the current attempt
    attempts.push(now);
    uploadStore.set(key, attempts);

    // Override res.send to detect if the response is 400 (failed moderation) or 401.
    // If so, restore the rate-limit quota so that failed uploads/rejections do not consume it!
    const originalSend = res.send;
    res.send = function (body) {
        if (res.statusCode === 400 || res.statusCode === 401) {
            let currentAttempts = uploadStore.get(key) || [];
            const index = currentAttempts.indexOf(now);
            if (index !== -1) {
                currentAttempts.splice(index, 1);
                uploadStore.set(key, currentAttempts);
                console.log(`[RATE LIMIT QUOTA RELEASE] Restored upload quota for ${username} (IP: ${ip}) due to failed request (Status: ${res.statusCode}).`);
            }
        }
        return originalSend.apply(res, arguments);
    };

    next();
};

module.exports = { uploadLimiter };
