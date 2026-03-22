const express = require('express');
const router = express.Router();
const ytdl = require('@distube/ytdl-core');

// GET /api/download/formats?url=<youtube_url>
// Returns available quality formats for a given video URL
router.get('/formats', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'url is required' });

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(url);

        // Pick distinct quality labels with both video+audio (muxed) formats first
        const formats = info.formats
            .filter(f => f.hasVideo && f.hasAudio && f.qualityLabel)
            .reduce((acc, f) => {
                if (!acc.find(x => x.qualityLabel === f.qualityLabel)) {
                    acc.push({
                        itag: f.itag,
                        qualityLabel: f.qualityLabel,
                        container: f.container,
                        fps: f.fps,
                        filesize: f.contentLength
                            ? `~${(f.contentLength / 1024 / 1024).toFixed(1)} MB`
                            : null,
                    });
                }
                return acc;
            }, [])
            // Sort by resolution descending
            .sort((a, b) => parseInt(b.qualityLabel) - parseInt(a.qualityLabel));

        // If no muxed formats found, fall back to video-only formats
        const fallback = formats.length === 0
            ? info.formats
                .filter(f => f.hasVideo && f.qualityLabel)
                .reduce((acc, f) => {
                    if (!acc.find(x => x.qualityLabel === f.qualityLabel)) {
                        acc.push({
                            itag: f.itag,
                            qualityLabel: f.qualityLabel,
                            container: f.container,
                            fps: f.fps,
                            filesize: null,
                        });
                    }
                    return acc;
                }, [])
                .sort((a, b) => parseInt(b.qualityLabel) - parseInt(a.qualityLabel))
            : [];

        const title = info.videoDetails.title;
        res.json({ title, formats: formats.length ? formats : fallback });
    } catch (err) {
        console.error('Download formats error:', err.message);
        res.status(500).json({ error: 'Failed to fetch video formats' });
    }
});

// GET /api/download/stream?url=<youtube_url>&itag=<itag>&title=<title>
// Streams the video as a file download
router.get('/stream', async (req, res) => {
    try {
        const { url, itag, title } = req.query;
        if (!url || !itag) return res.status(400).json({ error: 'url and itag are required' });

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(url);
        const format = info.formats.find(f => f.itag === parseInt(itag));
        if (!format) return res.status(404).json({ error: 'Format not found' });

        const safeTitle = (title || info.videoDetails.title)
            .replace(/[^a-z0-9 \-_]/gi, '')
            .trim()
            .substring(0, 80) || 'video';

        const ext = format.container || 'mp4';
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);
        res.setHeader('Content-Type', `video/${ext}`);
        if (format.contentLength) {
            res.setHeader('Content-Length', format.contentLength);
        }

        ytdl(url, { format }).pipe(res);
    } catch (err) {
        console.error('Download stream error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
        }
    }
});

module.exports = router;
