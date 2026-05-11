const { Op } = require('sequelize');
const { Notification, Video, Comment, User } = require('../models');

// ─── Helper: upsert a notification ───────────────────────────────────────────
async function seedOnce({ recipientId, type, title, message, link }) {
    const [notif, created] = await Notification.findOrCreate({
        where: { recipientId, type, link },
        defaults: { recipientId, type, title, message, link, read: false }
    });
    return { notif, created };
}

// ─── GET USER NOTIFICATIONS ───────────────────────────────────────────────────
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const uid = parseInt(userId);
        if (isNaN(uid)) return res.status(400).json({ message: 'Invalid user ID' });

        // 1. Welcome notification (once per user)
        await seedOnce({
            recipientId: uid,
            type: 'welcome',
            title: '👋 Welcome to EzyEduTube!',
            message: 'Start exploring thousands of educational resources curated for you.',
            link: '/welcome'
        });

        // 2. Recent videos uploaded by others
        const recentVideos = await Video.findAll({
            where: { uploaderId: { [Op.ne]: uid } },
            order: [['createdAt', 'DESC']],
            limit: 5,
            include: [{ model: User, as: 'uploader', attributes: ['username'] }]
        });

        for (const video of recentVideos) {
            await seedOnce({
                recipientId: uid,
                type: 'new_video',
                title: `📹 New upload: ${video.title.slice(0, 50)}`,
                message: `${video.uploader?.username || 'Someone'} just shared a new educational resource.`,
                link: `/resource/${video.id}`
            });
        }

        // 3. Comments on your videos
        const myVideos = await Video.findAll({
            where: { uploaderId: uid },
            attributes: ['id', 'title']
        });

        for (const video of myVideos) {
            const recentComments = await Comment.findAll({
                where: { videoId: video.id },
                order: [['createdAt', 'DESC']],
                limit: 3,
                include: [{ model: User, as: 'user', attributes: ['username'] }]
            });

            for (const comment of recentComments) {
                await seedOnce({
                    recipientId: uid,
                    type: 'comment',
                    title: `💬 New comment on "${video.title.slice(0, 40)}"`,
                    message: `${comment.user?.username || 'Someone'}: "${comment.content.slice(0, 60)}"`,
                    link: `/resource/${video.id}?comment=${comment.id}`
                });
            }
        }

        // Return latest 20
        const notifications = await Notification.findAll({
            where: { recipientId: uid },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        const unreadCount = await Notification.count({
            where: { recipientId: uid, read: false }
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
        await Notification.update(
            { read: true },
            { where: { recipientId: req.params.userId, read: false } }
        );
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── MARK SINGLE AS READ ──────────────────────────────────────────────────────
const markSingleAsRead = async (req, res) => {
    try {
        await Notification.update({ read: true }, { where: { id: req.params.id } });
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
