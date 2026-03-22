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
    duration: {
        type: Number,   // seconds
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    subject: {
        type: String,
        default: 'General',
        enum: [
            'General', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
            'Programming', 'Computer Science', 'Artificial Intelligence',
            'Technology', 'Engineering', 'Data Science',
            'History', 'Geography', 'Social Studies',
            'English', 'Literature', 'Language',
            'Business', 'Economics', 'Commerce',
            'Design', 'Arts', 'Music',
            'Medical', 'Law', 'Psychology'
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Video', VideoSchema);
