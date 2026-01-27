const express = require('express');
const router = express.Router();
const db = require('../db_adapter');

// GET all resources
router.get('/', async (req, res) => {
    try {
        const resources = db.resources.find().sort();
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new resource
router.post('/', async (req, res) => {
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
});

// GET a specific resource
router.get('/:id', async (req, res) => {
    try {
        const resource = db.resources.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
