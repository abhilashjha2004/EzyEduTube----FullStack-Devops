const mongoose = require('mongoose');

const videoViewSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
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

videoViewSchema.index({ videoId: 1, userId: 1, viewedAt: -1 });
videoViewSchema.index({ videoId: 1, ipAddress: 1, viewedAt: -1 });

module.exports = mongoose.model('VideoView', videoViewSchema);
