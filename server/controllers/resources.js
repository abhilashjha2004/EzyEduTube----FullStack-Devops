const db = require('../db_adapter');

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
        const newResource = db.resources.create({
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            contentUrl: req.body.contentUrl,
            thumbnail: req.body.thumbnail,
            uploader: req.body.uploader || 'Anonymous'
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
