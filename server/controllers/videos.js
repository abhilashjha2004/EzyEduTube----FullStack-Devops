const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const os = require('os');
const jwt = require('jsonwebtoken');
const { Video, Comment, User, Course, Document, VideoView } = require('../models');
const { uploadToCloudinary, cloudinary } = require('../config/cloudinary');
const AIClassifier = require('../services/AIClassifier');
const MetadataFetcher = require('../services/MetadataFetcher');
const YouTubeValidator = require('../services/YouTubeValidator');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_eduhub_2026';

// ─── Cloudinary availability check ────────────────────────────────────────────
const cloudinaryConfigured = () =>
    !!(process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_KEY !== 'your_api_key');

// ─── Smart upload: Cloudinary if configured, else save locally ────────────────
const saveFile = async (buffer, originalName, subfolder, resourceType = 'auto') => {
    if (cloudinaryConfigured()) {
        return await uploadToCloudinary(buffer, subfolder, resourceType);
    }
    const uploadDir = path.join(__dirname, '..', 'uploads', subfolder);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${subfolder}/${safeName}`;
};

// ─── Helper: format video to maintain dual id / _id compatibility ───────────────
const formatVideo = (video) => {
    try {
        const json = video.toObject ? video.toObject() : (video.toJSON ? video.toJSON() : video);
        const id = json._id ? json._id.toString() : (json.id ? json.id.toString() : '');
        let likesArray = [];
        if (Array.isArray(json.likes)) {
            likesArray = json.likes.map(u => (u._id ? u._id.toString() : (u.id ? u.id.toString() : u.toString())));
        }
        return {
            ...json,
            id,
            _id: id,
            likes: likesArray,
            uploader: json.uploaderId && typeof json.uploaderId === 'object' ? {
                ...json.uploaderId,
                id: json.uploaderId._id ? json.uploaderId._id.toString() : json.uploaderId.id,
                _id: json.uploaderId._id ? json.uploaderId._id.toString() : json.uploaderId.id
            } : (json.uploader || null),
            course: json.courseId && typeof json.courseId === 'object' ? {
                ...json.courseId,
                id: json.courseId._id ? json.courseId._id.toString() : json.courseId.id,
                _id: json.courseId._id ? json.courseId._id.toString() : json.courseId.id
            } : (json.course || null)
        };
    } catch (err) {
        console.error('[formatVideo Debug] Warning formatting video:', err.message);
        const id = video._id ? video._id.toString() : (video.id ? video.id.toString() : '');
        return {
            ...video,
            id,
            _id: id,
            likes: []
        };
    }
};

// ─── GET ALL VIDEOS ────────────────────────────────────────────────────────────
const getAllVideos = async (req, res) => {
    try {
        console.log(`[GET /api/videos] Request received. User authenticated: ${req.user ? 'Yes (' + req.user.id + ')' : 'No (Guest)'}`);

        const MODERATION_LAUNCH_DATE = new Date('2026-05-11T00:00:00.000Z');
        const filter = {
            $or: [
                { status: 'approved', isEducational: true },
                { status: 'approved', reviewedByAI: false },
                { status: null, createdAt: { $lt: MODERATION_LAUNCH_DATE } }
            ]
        };

        const videos = await Video.find(filter)
            .populate('uploaderId', 'id _id username avatar')
            .populate('courseId', 'id _id title')
            .sort({ createdAt: -1 })
            .lean();

        res.json(videos.map(formatVideo));
    } catch (err) {
        console.error('[GET /api/videos] Critical global error fetching videos:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// ─── GET SINGLE VIDEO ─────────────────────────────────────────────────────────
const getVideoById = async (req, res) => {
    try {
        console.log(`[GET /api/videos/${req.params.id}] Fetching video...`);
        const video = await Video.findById(req.params.id)
            .populate('uploaderId', 'id _id username avatar')
            .populate('courseId', 'id _id title')
            .lean();

        if (!video) return res.status(404).json({ message: 'Video not found' });

        const comments = await Comment.find({ videoId: video._id })
            .populate('userId', 'id _id username avatar')
            .sort({ createdAt: -1 })
            .lean();

        const formattedComments = comments.map(c => ({
            ...c,
            id: c._id.toString(),
            _id: c._id.toString(),
            user: c.userId ? {
                ...c.userId,
                id: c.userId._id ? c.userId._id.toString() : c.userId.id,
                _id: c.userId._id ? c.userId._id.toString() : c.userId.id
            } : null
        }));

        res.json({ video: formatVideo(video), comments: formattedComments });
    } catch (err) {
        console.error(`[GET /api/videos/${req.params.id}] Critical global error:`, err.message);
        res.status(500).json({ message: err.message });
    }
};

// ─── UPLOAD VIDEO ─────────────────────────────────────────────────────────────
const uploadVideo = async (req, res) => {
    try {
        const uploaderId = req.user.id;
        const isExternal = req.body.isExternal === 'true';
        let videoUrl = '';
        let sourceType = 'upload';

        let title = req.body.title || '';
        let description = req.body.description || '';
        let tags = '';

        let contentType = 'Video';
        let platform = 'Direct Upload';

        if (isExternal) {
            const externalLink = req.body.externalLink;
            if (!externalLink) return res.status(400).json({ message: 'External link is required' });

            try {
                const parsed = new URL(externalLink);
                platform = parsed.hostname.replace('www.', '');
            } catch (e) {
                platform = 'Unknown Link';
            }
            contentType = 'External Link';

            if (externalLink.includes('youtube.com') || externalLink.includes('youtu.be')) {
                const validation = await YouTubeValidator.validate(externalLink);
                if (!validation.isValid) {
                    return res.status(400).json({ message: `Content Blocked by YouTube Validator: ${validation.reason}` });
                }
                if (validation.data) {
                    title = title || validation.data.title;
                    description = description || validation.data.description;
                    tags = validation.data.tags.join(', ');
                }
            } else {
                const metadata = await MetadataFetcher.fetch(externalLink);
                title = title || metadata.title;
                description = description || metadata.description;
                if (metadata.tags && metadata.tags.length > 0) {
                    tags = tags ? `${tags}, ${metadata.tags.join(', ')}` : metadata.tags.join(', ');
                }
            }
            videoUrl = externalLink;
            sourceType = 'external';
        } else {
            if (req.body.videoUrl) {
                videoUrl = req.body.videoUrl;
            } else {
                return res.status(400).json({ message: 'Video URL is required for upload mode' });
            }
        }

        let thumbnailUrl = req.body.thumbnailUrl || '';

        console.log(`\n==================================================`);
        console.log(`[UPLOAD DEBUG] ⏳ Starting strict synchronous AI moderation...`);
        console.log(`[UPLOAD DEBUG] Title: "${title}"`);
        console.log(`[UPLOAD DEBUG] Extracted Video URL: ${videoUrl}`);
        console.log(`==================================================\n`);

        const aiResult = await AIClassifier.analyzeVideoAsync({
            videoId: 'temp',
            videoUrl,
            title,
            description,
            tags,
            isExternal,
            contentType,
            platform
        });

        console.log("[MODERATION RESULT]", aiResult);

        if (!aiResult.allowed) {
            console.log(`[UPLOAD DEBUG] ❌ Moderation Decision: REJECTED`);
            console.log(`[UPLOAD DEBUG] 📝 Rejection Reason: ${aiResult.reason}`);

            if (!isExternal && videoUrl.includes('cloudinary.com')) {
                try {
                    const urlParts = videoUrl.split('/');
                    const filenameWithExt = urlParts.pop();
                    const folder = urlParts.pop();
                    const parentFolder = urlParts.pop();
                    const filename = filenameWithExt.split('.')[0];
                    const publicId = `${parentFolder}/${folder}/${filename}`;

                    console.log(`[UPLOAD DEBUG] 🗑️ Triggering Cloudinary Cleanup for: ${publicId}`);
                    const deleteResult = await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
                    console.log(`[UPLOAD DEBUG] 🗑️ Cloudinary Delete Result:`, deleteResult);
                } catch (cleanupErr) {
                    console.error('[UPLOAD DEBUG] ❌ Failed to delete video from Cloudinary:', cleanupErr);
                }
            }

            return res.status(400).json({
                success: false,
                message: "This resource is not educational and cannot be uploaded.",
                reason: aiResult.reason
            });
        }

        console.log(`[UPLOAD DEBUG] ✅ Moderation Decision: APPROVED for: "${title}"`);
        console.log(`[UPLOAD DEBUG] 💾 Triggering DB Save...`);

        const newVideo = await Video.create({
            title,
            description,
            subject: req.body.subject || 'General',
            videoUrl,
            thumbnailUrl,
            sourceType,
            duration: parseInt(req.body.duration) || 0,
            uploaderId,
            courseId: req.body.courseId || null,
            orderIndex: 0,
            status: 'approved',
            isEducational: true,
            moderationScore: aiResult.score,
            reviewedByAI: true,
            approvedAt: new Date(),
            likes: []
        });

        console.log("[VIDEO SAVED]");

        res.status(201).json({
            success: true,
            message: "Upload successful. Video passed strict AI moderation.",
            video: formatVideo(newVideo)
        });
    } catch (err) {
        console.error('Upload Error Detailed:', err);
        res.status(500).json({ message: err.message || 'An unexpected error occurred during upload.' });
    }
};

// ─── DELETE VIDEO (Admin) ─────────────────────────────────────────────────────
const deleteVideoAdmin = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        await Comment.deleteMany({ videoId: req.params.id });
        await Video.findByIdAndDelete(req.params.id);

        res.json({ message: 'Video deleted by admin' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── DELETE VIDEO (Owner) ─────────────────────────────────────────────────────
const deleteVideoUser = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        if (video.uploaderId && video.uploaderId.toString() !== req.user.id.toString())
            return res.status(403).json({ message: 'Not authorized to delete this video' });

        await Comment.deleteMany({ videoId: req.params.id });
        await Video.findByIdAndDelete(req.params.id);

        res.json({ message: 'Video deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── POST COMMENT ─────────────────────────────────────────────────────────────
const postComment = async (req, res) => {
    try {
        const { userId, content } = req.body;
        if (!userId || !content) return res.status(400).json({ message: 'userId and content required' });

        const newComment = await Comment.create({
            content,
            userId,
            videoId: req.params.id
        });

        const populated = await Comment.findById(newComment._id)
            .populate('userId', 'id _id username avatar')
            .lean();

        res.status(201).json({
            ...populated,
            id: populated._id.toString(),
            _id: populated._id.toString(),
            user: populated.userId ? {
                ...populated.userId,
                id: populated.userId._id ? populated.userId._id.toString() : populated.userId.id,
                _id: populated.userId._id ? populated.userId._id.toString() : populated.userId.id
            } : null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── LIKE / UNLIKE ────────────────────────────────────────────────────────────
const likeVideo = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(401).json({ message: 'Login required' });

        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (!Array.isArray(video.likes)) video.likes = [];
        const index = video.likes.findIndex(id => id.toString() === userId.toString());
        const alreadyLiked = index !== -1;

        if (alreadyLiked) {
            video.likes.splice(index, 1);
        } else {
            video.likes.push(userId);
        }

        await video.save();

        res.json({
            likes: video.likes.map(id => id.toString()),
            liked: !alreadyLiked
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── SUBSCRIBE / UNSUBSCRIBE ──────────────────────────────────────────────────
const subscribeVideo = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(401).json({ message: 'Login required' });

        const video = await Video.findById(req.params.id).select('uploaderId');
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const uploaderId = video.uploaderId;
        if (uploaderId && uploaderId.toString() === userId.toString())
            return res.status(400).json({ message: 'Cannot subscribe to yourself' });

        const channel = await User.findById(uploaderId);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        if (!Array.isArray(channel.subscribers)) channel.subscribers = [];
        const subIndex = channel.subscribers.findIndex(id => id.toString() === userId.toString());
        const alreadySubbed = subIndex !== -1;

        if (alreadySubbed) {
            channel.subscribers.splice(subIndex, 1);
        } else {
            channel.subscribers.push(userId);
        }

        await channel.save();

        res.json({
            subscribers: channel.subscribers.map(id => id.toString()),
            subscribed: !alreadySubbed
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── INCREMENT VIEW ────────────────────────────────────────────────────────────
const incrementView = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const COOLDOWN_HOURS = 24;
        const cooldownTime = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000);

        const authHeader = req.headers.authorization;
        let userId = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Ignore, treat as guest
            }
        }

        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'unknown';

        let existingView = null;
        if (userId) {
            existingView = await VideoView.findOne({
                videoId: video._id,
                userId: userId,
                viewedAt: { $gt: cooldownTime }
            });
        } else {
            existingView = await VideoView.findOne({
                videoId: video._id,
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: null,
                viewedAt: { $gt: cooldownTime }
            });
        }

        if (existingView) {
            return res.json({ views: video.views });
        }

        await VideoView.create({
            videoId: video._id,
            userId: userId || null,
            ipAddress,
            userAgent
        });

        const updated = await Video.findByIdAndUpdate(
            video._id,
            { $inc: { views: 1 } },
            { new: true }
        );

        res.json({ views: updated ? updated.views : video.views + 1 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── DELETE COMMENT ────────────────────────────────────────────────────────────
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId).populate('videoId');
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.user.id.toString();
        const isCommentOwner = comment.userId && comment.userId.toString() === userId;
        const isVideoOwner = comment.videoId && comment.videoId.uploaderId && comment.videoId.uploaderId.toString() === userId;

        if (!isCommentOwner && !isVideoOwner) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId);
        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── SHARE COUNT ───────────────────────────────────────────────────────────────
const shareVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.json({ message: 'Share recorded', shares: 0 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllVideos,
    getVideoById,
    uploadVideo,
    deleteVideoAdmin,
    deleteVideoUser,
    postComment,
    likeVideo,
    subscribeVideo,
    incrementView,
    deleteComment,
    shareVideo
};
