const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['video', 'documentation'],
        required: true
    },
    contentUrl: {
        type: String, // URL to video or text content/file
        required: true
    },
    thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/300x200?text=Education+Hub'
    },
    uploader: {
        type: String, // Mock username for now
        default: 'Anonymous'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resource', resourceSchema);
