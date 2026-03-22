const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const User = require('../models/User');
const axios = require('axios');
const cheerio = require('cheerio');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// --- VALIDATION HELPERS ---

// 1. Domain Whitelist
const ALLOWED_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'wikipedia.org'];

const isEducationalLink = (url) => {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return ALLOWED_DOMAINS.some(d => domain.includes(d));
    } catch (e) {
        return false;
    }
};

// 2. Keyword Check (Title/Desc)
const EDU_KEYWORDS = [
    'tutorial', 'education', 'learn', 'study', 'lecture', 'course', 'class', 'lesson',
    'exam', 'preparation', 'guide', 'project', 'analysis', 'mathematics', 'science',
    'coding', 'programming', 'development', 'history', 'geography', 'physics', 'chemistry',
    'biology', 'algebra', 'calculus', 'english', 'literature', 'research', 'experiment',
    'demo', 'topic', 'chapter', 'syllabus', 'introduction', 'basics', 'advanced', 'review'
];

const isContentEducational = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();
    return EDU_KEYWORDS.some(keyword => text.includes(keyword));
};

// 3. Deep YouTube Verification (The "Real" Content Check)
const checkYouTubeCategory = async (url) => {
    try {
        console.log("Analyzing YouTube Metadata for:", url);
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(data);

        // Extract Metadata
        const genre = $('meta[itemprop="genre"]').attr('content'); // Often "Education"
        const categoryMatch = data.match(/"category":"(.*?)"/);
        const category = categoryMatch ? categoryMatch[1] : null;

        const foundCategory = genre || category || 'Unknown';
        console.log(`YouTube Category Found: ${foundCategory}`);

        // Strict List of Allowed Categories
        const EDU_CATEGORIES = [
            'Education',
            'Science & Technology',
            'Howto & Style',
            'News & Politics',
            'Nonprofits & Activism'
        ];

        return EDU_CATEGORIES.includes(foundCategory);
    } catch (err) {
        console.error("YouTube Scrape Error:", err.message);
        // Fail Safe: If we can't verify it, we block it to be strict.
        return false;
    }
};

// --- ROUTES ---

// GET ALL VIDEOS
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find().populate('uploader', 'username avatar').sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET SINGLE VIDEO
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('uploader', 'username avatar');
        if (!video) return res.status(404).json({ message: "Video not found" });

        video.views += 1;
        await video.save();

        const comments = await Comment.find({ video: req.params.id }).populate('user', 'username avatar').sort({ createdAt: -1 });

        res.json({ video, comments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPLOAD VIDEO (Local OR External)
router.post('/upload', authMiddleware, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'resources', maxCount: 5 }
]), async (req, res) => {
    try {
        const uploaderId = req.user.id;

        const isExternal = req.body.isExternal === 'true';
        const videoFile = req.files['video'] ? req.files['video'][0] : null;
        let videoUrl = "";
        let sourceType = 'upload';

        if (isExternal) {
            const externalLink = req.body.externalLink;
            if (!externalLink) return res.status(400).json({ message: "External link is required" });

            // A. Domain Check
            if (!isEducationalLink(externalLink)) {
                return res.status(400).json({ message: "Blocked: We only support links from major educational platforms (YouTube, Coursera, etc)." });
            }

            // B. Deep Content Check (YouTube)
            if (externalLink.includes('youtube.com') || externalLink.includes('youtu.be')) {
                const isEdu = await checkYouTubeCategory(externalLink);
                if (!isEdu) {
                    return res.status(400).json({ message: "Content Blocked: This video is categorized as Entertainment/Music on YouTube. EDU-HUB only accepts Educational content." });
                }
            }

            videoUrl = externalLink;
            sourceType = 'external';
        } else {
            // Local Upload
            if (!videoFile) return res.status(400).json({ message: "Video file is required" });

            // AI CONTENT ANALYSIS
            const AIClassifier = require('../services/AIClassifier');
            const result = await AIClassifier.analyzeContent(videoFile.path, req.body.title, req.body.description);

            if (!result.allowed) {
                // Delete the uploaded file immediately
                if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
                if (req.files['thumbnail']) fs.unlinkSync(req.files['thumbnail'][0].path);

                return res.status(400).json({
                    message: `Upload Rejected by AI Guard: ${result.reason}. Content appears non-educational.`
                });
            }

            // Upload to Cloudinary securely AFTER AI Approval
            try {
                const videoUpload = await cloudinary.uploader.upload(videoFile.path, { resource_type: 'video', folder: 'ezyedutube_videos' });
                videoUrl = videoUpload.secure_url;
                if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
            } catch (err) {
                if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
                return res.status(500).json({ message: "Failed to upload video to cloud." });
            }
        }

        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        let thumbnailUrl = "";
        
        if (thumbnailFile) {
            try {
                const thumbUpload = await cloudinary.uploader.upload(thumbnailFile.path, { resource_type: 'image', folder: 'ezyedutube_thumbnails' });
                thumbnailUrl = thumbUpload.secure_url;
                if (fs.existsSync(thumbnailFile.path)) fs.unlinkSync(thumbnailFile.path);
            } catch (err) {
                if (fs.existsSync(thumbnailFile.path)) fs.unlinkSync(thumbnailFile.path);
            }
        }

        // Process resources
        let resources = [];
        if (req.files['resources']) {
            for (const file of req.files['resources']) {
                try {
                    const resUpload = await cloudinary.uploader.upload(file.path, { resource_type: 'raw', folder: 'ezyedutube_resources' });
                    resources.push({
                        title: file.originalname,
                        url: resUpload.secure_url,
                        type: 'doc'
                    });
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                } catch (err) {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                }
            }
        }

        const newVideo = new Video({
            title: req.body.title,
            description: req.body.description,
            videoUrl,
            sourceType,
            thumbnailUrl,
            uploader: uploaderId,
            resources,
            duration: parseInt(req.body.duration) || 0,
            subject: req.body.subject || 'General',
        });

        await newVideo.save();
        res.status(201).json(newVideo);
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE VIDEO (Admin Only)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) return res.status(404).json({ message: "Video not found" });

        await Video.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ video: req.params.id });

        res.json({ message: "Video deleted by admin" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE VIDEO (User owning the video)
router.delete('/my-video/:id', authMiddleware, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) return res.status(404).json({ message: "Video not found" });

        if (video.uploader.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete" });
        }

        await Video.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ video: req.params.id });

        res.json({ message: "Video deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// POST COMMENT
router.post('/:id/comments', async (req, res) => {
    try {
        const { userId, content } = req.body;
        const newComment = new Comment({
            content,
            user: userId,
            video: req.params.id
        });
        await newComment.save();
        await newComment.populate('user', 'username avatar');
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── LIKE / UNLIKE ────────────────────────────────────────────────────────────
// POST /api/videos/:id/like   body: { userId }
router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(401).json({ message: 'Login required' });

        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const idx = video.likes.indexOf(userId);
        if (idx === -1) {
            video.likes.push(userId);   // like
        } else {
            video.likes.splice(idx, 1); // unlike
        }
        await video.save();

        res.json({ likes: video.likes.length, liked: idx === -1 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── SUBSCRIBE / UNSUBSCRIBE ──────────────────────────────────────────────────
// POST /api/videos/:id/subscribe  body: { userId }
// Subscribes the current user (userId) to the uploader of video :id
router.post('/:id/subscribe', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(401).json({ message: 'Login required' });

        const video = await Video.findById(req.params.id).populate('uploader', '_id subscribers');
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const uploaderId = video.uploader._id.toString();
        if (uploaderId === userId) {
            return res.status(400).json({ message: 'Cannot subscribe to yourself' });
        }

        const uploader = await User.findById(uploaderId);
        const subscriber = await User.findById(userId);
        if (!uploader || !subscriber) return res.status(404).json({ message: 'User not found' });

        const alreadySubbed = uploader.subscribers.map(s => s.toString()).includes(userId);

        if (alreadySubbed) {
            // Unsubscribe
            uploader.subscribers = uploader.subscribers.filter(s => s.toString() !== userId);
            subscriber.subscribedTo = subscriber.subscribedTo.filter(s => s.toString() !== uploaderId);
        } else {
            // Subscribe
            uploader.subscribers.push(userId);
            subscriber.subscribedTo.push(uploaderId);
        }

        await Promise.all([uploader.save(), subscriber.save()]);

        res.json({
            subscribers: uploader.subscribers.length,
            subscribed: !alreadySubbed
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── VIEW INCREMENT ───────────────────────────────────────────────────────────
// POST /api/videos/:id/view  (no body needed)
router.post('/:id/view', async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.json({ views: video.views });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── SHARE COUNT ──────────────────────────────────────────────────────────────
// POST /api/videos/:id/share  (tracks share events)
router.post('/:id/share', async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { $inc: { shares: 1 } },
            { new: true }
        );
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.json({ shares: video.shares });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

