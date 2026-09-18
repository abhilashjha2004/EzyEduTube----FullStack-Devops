const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        default: ''
    },
    duration: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    sourceType: {
        type: String,
        enum: ['upload', 'external'],
        default: 'upload'
    },
    subject: {
        type: String,
        default: 'General'
    },
    orderIndex: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isEducational: {
        type: Boolean,
        default: false
    },
    moderationScore: {
        type: Number,
        default: 0
    },
    visualConfidence: {
        type: Number,
        default: 0
    },
    transcriptConfidence: {
        type: Number,
        default: 0
    },
    moderationReason: {
        type: String,
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    reviewedByAI: {
        type: Boolean,
        default: false
    },
    uploaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.id;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.id;
            return ret;
        }
    }
});

// Virtual aliases for compatibility
videoSchema.virtual('uploader', {
    ref: 'User',
    localField: 'uploaderId',
    foreignField: '_id',
    justOne: true
});

videoSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});

videoSchema.virtual('likedBy', {
    ref: 'User',
    localField: 'likes',
    foreignField: '_id'
});

module.exports = mongoose.model('Video', videoSchema);