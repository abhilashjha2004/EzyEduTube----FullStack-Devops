const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const User = require('../models/User');
const mongoose = require('mongoose');

// ─── Helper: upsert a notification (create only if not already present) ──────
// `uniqueKey` is a string stored in the `link` field used to deduplicate.
// Using findOneAndUpdate + upsert avoids race conditions.
async function seedOnce({ recipient, type, title, message, link, createdAt }) {
    await Notification.findOneAndUpdate(
        { recipient, type, link },          // uniqueness: recipient + type + link
        { $setOnInsert: { recipient, type, title, message, link, read: false, createdAt: createdAt || new Date() } },
        { upsert: true, new: false }
    );
}

// ─── GET /api/notifications/:userId ─────────────────────────────────────────
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // 1. Welcome notification (exactly once per user)
        await seedOnce({
            recipient: userId,
            type: 'welcome',
            title: '👋 Welcome to EDU-HUB!',
            message: 'Start exploring thousands of educational resources curated for you.',
            link: '/welcome',
        });

        // 2. Recent videos uploaded by others — one notification per video
        const recentVideos = await Video.find({ uploader: { $ne: userId } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('uploader', 'username');

        for (const video of recentVideos) {
            await seedOnce({
                recipient: userId,
                type: 'new_video',
                title: `📹 New upload: ${video.title.slice(0, 50)}`,
                message: `${video.uploader?.username || 'Someone'} just shared a new educational resource.`,
                link: `/resource/${video._id}`,     // unique per video
                createdAt: video.createdAt,
            });
        }

        // 3. Comments on your videos — one notification per unique comment
        const myVideos = await Video.find({ uploader: userId }).select('_id title');
        for (const video of myVideos) {
            const recentComments = await Comment.find({ video: video._id })
                .sort({ createdAt: -1 })
                .limit(3)
                .populate('user', 'username');

            for (const comment of recentComments) {
                // Use comment._id as part of the link to guarantee uniqueness per comment
                await seedOnce({
                    recipient: userId,
                    type: 'comment',
                    title: `💬 New comment on "${video.title.slice(0, 40)}"`,
                    message: `${comment.user?.username || 'Someone'}: "${comment.content.slice(0, 60)}"`,
                    link: `/resource/${video._id}?comment=${comment._id}`,   // unique per comment
                    createdAt: comment.createdAt,
                });
            }
        }

        // ── Return latest 20 ─────────────────────────────────────────────────
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error('Notifications error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── PATCH /api/notifications/:userId/read-all ───────────────────────────────
router.patch('/:userId/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.params.userId, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── PATCH /api/notifications/single/:id/read ────────────────────────────────
router.patch('/single/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
