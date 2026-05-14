const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const videoController = require('../controllers/videos');
const { uploadVideoFields, generateSignature } = require('../config/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');

// --- ROUTES ---

// GET ALL VIDEOS
router.get('/', videoController.getAllVideos);

// GET SINGLE VIDEO
router.get('/:id', videoController.getVideoById);

// GET UPLOAD SIGNATURE
router.get('/upload-signature', authMiddleware, (req, res) => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = generateSignature({ timestamp, folder: 'ezyedutube/videos' });
    res.json({ timestamp, signature, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
});

// GET UPLOAD SIGNATURE FOR RESOURCES
router.get('/upload-signature/:folder', authMiddleware, (req, res) => {
    const folder = req.params.folder === 'documents' ? 'ezyedutube/documents' : 'ezyedutube/thumbnails';
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = generateSignature({ timestamp, folder });
    res.json({ timestamp, signature, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
});

// UPLOAD VIDEO (Handles direct cloudinary URLs and final backend processing)
// We still pass uploadVideoFields just in case local fallback is used or thumbnails/resources are sent
router.post('/upload', uploadLimiter, authMiddleware, uploadVideoFields, videoController.uploadVideo);

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
