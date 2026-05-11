const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Storage Profiles ───────────────────────────────────────────────────────

const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ezyedutube/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm']
    }
});

const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ezyedutube/thumbnails',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    }
});

const documentStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ezyedutube/documents',
        resource_type: 'raw',
        allowed_formats: ['pdf', 'docx', 'pptx', 'txt', 'zip']
    }
});

// ─── Multer Upload Middleware ────────────────────────────────────────────────

const uploadVideo = multer({ storage: videoStorage });
const uploadImage = multer({ storage: imageStorage });
const uploadDocument = multer({ storage: documentStorage });

/**
 * Combined uploader for the video upload endpoint.
 * Handles: video + thumbnail + resource documents in one request.
 */
const uploadVideoFields = multer({
    storage: multer.memoryStorage() // We'll manually push to Cloudinary
}).fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'resources', maxCount: 5 }
]);

// ─── Helper: Upload a buffer to Cloudinary ──────────────────────────────────

/**
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder
 * @param {'video'|'image'|'raw'} resourceType
 * @returns {Promise<string>} Cloudinary secure URL
 */
const uploadToCloudinary = (buffer, folder, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `ezyedutube/${folder}`, resource_type: resourceType },
            (err, result) => {
                if (err) return reject(err);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

module.exports = {
    cloudinary,
    uploadVideo,
    uploadImage,
    uploadDocument,
    uploadVideoFields,
    uploadToCloudinary
};
