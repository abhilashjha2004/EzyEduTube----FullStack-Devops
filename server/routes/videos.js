const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const videoController = require('../controllers/videos');
const { uploadVideoFields } = require('../config/cloudinary');

// Use Cloudinary-aware multer (memory storage → manual upload)
// uploadVideoFields handles: video, thumbnail, resources

// --- ROUTES ---

// GET ALL VIDEOS
router.get('/', videoController.getAllVideos);

// GET SINGLE VIDEO
router.get('/:id', videoController.getVideoById);

// UPLOAD VIDEO (Local OR External)
router.post('/upload', authMiddleware, uploadVideoFields, videoController.uploadVideo);

// DELETE VIDEO (Admin Only)
router.delete('/:id', authMiddleware, isAdmin, videoController.deleteVideoAdmin);

// DELETE VIDEO (User owning the video)
router.delete('/my-video/:id', authMiddleware, videoController.deleteVideoUser);

// POST COMMENT
router.post('/:id/comments', videoController.postComment);

// LIKE / UNLIKE
router.post('/:id/like', videoController.likeVideo);

// SUBSCRIBE / UNSUBSCRIBE
router.post('/:id/subscribe', videoController.subscribeVideo);

// VIEW INCREMENT
router.post('/:id/view', videoController.incrementView);

// SHARE COUNT
router.post('/:id/share', videoController.shareVideo);

module.exports = router;
