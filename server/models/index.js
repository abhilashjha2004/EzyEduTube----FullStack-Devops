const mongoose = require('mongoose');
const User = require('./User');
const Course = require('./Course');
const Video = require('./Video');
const Document = require('./Document');
const Enrollment = require('./Enrollment');
const Progress = require('./Progress');
const Comment = require('./Comment');
const Notification = require('./Notification');
const VideoView = require('./VideoView');

module.exports = {
    mongoose,
    User,
    Course,
    Video,
    Document,
    Enrollment,
    Progress,
    Comment,
    Notification,
    VideoView
};
