const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// ── Regular Register ─────────────────────────────────────────────────────────
router.post('/register', authController.register);

// ── Regular Login ─────────────────────────────────────────────────────────────
router.post('/login', authController.login);

// ── GET USER BY ID (public) ──────────────────────────────────────────────────
router.get('/user/:id', authController.getUserById);

// ── Google OAuth ─────────────────────────────────────────────────────────────
// Step 1: redirect to Google
router.get('/google', authController.googleOAuthStart);

// Step 2: Google redirects back here
router.get('/google/callback', authController.googleOAuthCallback);

module.exports = router;
