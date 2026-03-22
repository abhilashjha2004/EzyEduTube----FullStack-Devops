const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: false,   // not required for Google OAuth users
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    email: {
        type: String,
        default: ''
    },
    googleId: {
        type: String,
        default: null,
        sparse: true       // allows multiple null values in unique index
    },
    avatar: {
        type: String,
        default: ''
    },
    // Users who have subscribed TO this user
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Channels this user has subscribed to
    subscribedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
