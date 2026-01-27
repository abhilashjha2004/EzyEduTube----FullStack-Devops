const express = require('express');
const router = express.Router();
const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Check if user exists
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: "Username taken" });

        const user = new User({
            username,
            password
        });
        await user.save();

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const { password: _, ...userInfo } = user._doc;
        res.json(userInfo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
