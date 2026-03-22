const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        // 'new_video'  – someone you follow uploaded
        // 'comment'    – someone commented on your video
        // 'welcome'    – first-time login greeting
        type: String,
        enum: ['new_video', 'comment', 'like', 'welcome', 'system'],
        default: 'system'
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },   // e.g. /resource/:id
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Unique compound index — enforces one notification per (user + type + link) at DB level.
// 'sparse: true' lets documents with empty link still coexist as long as type differs.
notificationSchema.index({ recipient: 1, type: 1, link: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Notification', notificationSchema);
