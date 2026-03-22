const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_eduhub_2026';

// ── Passport Google Strategy (only when credentials are configured) ───────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                // Find or create user by Google ID
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    // Check if username already taken (edge case)
                    let username = profile.displayName.replace(/\s+/g, '_').toLowerCase();
                    const existing = await User.findOne({ username });
                    if (existing) username = username + '_' + Date.now().toString().slice(-4);

                    user = await User.create({
                        username,
                        googleId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                        email: profile.emails?.[0]?.value || '',
                        password: Math.random().toString(36),   // random — login only via Google
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));

    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (id, done) => {
        try { done(null, await User.findById(id)); }
        catch (e) { done(e, null); }
    });
}


// ── Regular Register ─────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: 'Username already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed });
        
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ user: { _id: user._id, username: user.username, avatar: user.avatar, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Regular Login ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid username or password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Invalid username or password' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ user: { _id: user._id, username: user.username, avatar: user.avatar, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── GET USER BY ID (public) ──────────────────────────────────────────────────
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Google OAuth ─────────────────────────────────────────────────────────────
const googleConfigured = () =>
    !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// Step 1: redirect to Google
router.get('/google', (req, res, next) => {
    if (!googleConfigured()) {
        return res.status(503).json({
            message: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env'
        });
    }
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

// Step 2: Google redirects back here
router.get('/google/callback', (req, res, next) => {
    if (!googleConfigured()) {
        return res.redirect(`${CLIENT_URL}/login?error=google_not_configured`);
    }
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${CLIENT_URL}/login?error=google`
    })(req, res, (err) => {
        if (err) return res.redirect(`${CLIENT_URL}/login?error=google`);
        const user = req.user;
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        const payload = JSON.stringify({
            user: {
                _id: user._id,
                username: user.username,
                avatar: user.avatar || '',
                email: user.email || '',
                role: user.role
            },
            token
        });
        res.redirect(`${CLIENT_URL}/auth/callback?user=${encodeURIComponent(payload)}`);
    });
});

module.exports = router;

