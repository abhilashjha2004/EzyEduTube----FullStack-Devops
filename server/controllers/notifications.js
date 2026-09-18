const { Notification, Video, Comment, User } = require('../models');

// ─── Helper: upsert a notification ───────────────────────────────────────────
async function seedOnce({ recipientId, type, title, message, link }) {
    const existing = await Notification.findOne({ recipientId, type, link });
    if (existing) return { notif: existing, created: false };
    const notif = await Notification.create({
        recipientId,
        type,
        title,
        message,
        link,
        read: false
    });
    return { notif, created: true };
}

// ─── GET USER NOTIFICATIONS ───────────────────────────────────────────────────
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

        // 1. Welcome notification (once per user)
        await seedOnce({
            recipientId: userId,
            type: 'welcome',
            title: '👋 Welcome to EzyEduTube!',
            message: 'Start exploring thousands of educational resources curated for you.',
            link: '/welcome'
        });

        // 2. Recent videos uploaded by others
        const recentVideos = await Video.find({ uploaderId: { $ne: userId } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('uploaderId', 'username');

        for (const video of recentVideos) {
            const uploaderName = video.uploaderId?.username || 'Someone';
            await seedOnce({
                recipientId: userId,
                type: 'new_video',
                title: `📹 New upload: ${video.title.slice(0, 50)}`,
                message: `${uploaderName} just shared a new educational resource.`,
                link: `/resource/${video._id}`
            });
        }

        // 3. Comments on your videos
        const myVideos = await Video.find({ uploaderId: userId }).select('_id title');

        for (const video of myVideos) {
            const recentComments = await Comment.find({ videoId: video._id })
                .sort({ createdAt: -1 })
                .limit(3)
                .populate('userId', 'username');

            for (const comment of recentComments) {
                const commenterName = comment.userId?.username || 'Someone';
                await seedOnce({
                    recipientId: userId,
                    type: 'comment',
                    title: `💬 New comment on "${video.title.slice(0, 40)}"`,
                    message: `${commenterName}: "${comment.content.slice(0, 60)}"`,
                    link: `/resource/${video._id}?comment=${comment._id}`
                });
            }
        }

        // Return latest 20
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({
            recipientId: userId,
            read: false
        });

        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error('Notifications error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.params.userId, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── MARK SINGLE AS READ ──────────────────────────────────────────────────────
const markSingleAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { $set: { read: true } });
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getUserNotifications,
    markAllAsRead,
    markSingleAsRead
};
