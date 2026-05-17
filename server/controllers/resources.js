const db = require('../db_adapter');
const AIClassifier = require('../services/AIClassifier');
const MetadataFetcher = require('../services/MetadataFetcher');
const YouTubeValidator = require('../services/YouTubeValidator');

const getAllResources = async (req, res) => {
    try {
        const resources = db.resources.find().sort();
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createResource = async (req, res) => {
    try {
        let { title, description, type, contentUrl, thumbnail, uploader } = req.body;
        
        let platform = 'Unknown Link';
        if (contentUrl) {
            try {
                const parsed = new URL(contentUrl);
                platform = parsed.hostname.replace('www.', '');
            } catch (e) {}
        }
        
        let tags = '';

        if (contentUrl) {
            if (contentUrl.includes('youtube.com') || contentUrl.includes('youtu.be')) {
                const validation = await YouTubeValidator.validate(contentUrl);
                if (!validation.isValid) {
                    return res.status(400).json({ message: `Content Blocked by YouTube Validator: ${validation.reason}` });
                }
                if (validation.data) {
                    title = title || validation.data.title;
                    description = description || validation.data.description;
                    tags = validation.data.tags.join(', ');
                }
            } else {
                const metadata = await MetadataFetcher.fetch(contentUrl);
                title = title || metadata.title;
                description = description || metadata.description;
                if (metadata.tags && metadata.tags.length > 0) {
                    tags = metadata.tags.join(', ');
                }
            }
        }

        const aiResult = await AIClassifier.analyzeVideoAsync({
            videoId: 'temp_res',
            videoUrl: contentUrl,
            title: title || '',
            description: description || '',
            tags,
            isExternal: true,
            contentType: type || 'Resource Link',
            platform
        });

        if (!aiResult.allowed) {
            console.log("[DB INSERT BLOCKED]");
            return res.status(400).json({
                success: false,
                message: "This resource is not educational and cannot be uploaded.",
                reason: aiResult.reason
            });
        }

        const newResource = db.resources.create({
            title,
            description,
            type,
            contentUrl,
            thumbnail,
            uploader: uploader || 'Anonymous'
        });
        res.status(201).json(newResource);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getResourceById = async (req, res) => {
    try {
        const resource = db.resources.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllResources,
    createResource,
    getResourceById
};
