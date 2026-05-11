const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/download');

// GET /api/download/formats?url=<youtube_url>
// Returns available quality formats for a given video URL
router.get('/formats', downloadController.getFormats);

// GET /api/download/stream?url=<youtube_url>&itag=<itag>&title=<title>
// Streams the video as a file download
router.get('/stream', downloadController.streamDownload);

module.exports = router;
