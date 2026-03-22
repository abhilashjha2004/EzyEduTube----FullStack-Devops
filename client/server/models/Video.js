const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    videoUrl: {
        type: String, // Can be local path or external URL
    },
    sourceType: {
        type: String,
        enum: ['upload', 'external'],
        default: 'upload'
    },
    thumbnailUrl: {
        type: String
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resources: [{
        title: String,
        url: String,
        type: { type: String, enum: ['pdf', 'link'], default: 'pdf' }
    }],
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Video', VideoSchema);
