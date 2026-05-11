const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resources');

// GET all resources
router.get('/', resourceController.getAllResources);

// POST a new resource
router.post('/', resourceController.createResource);

// GET a specific resource
router.get('/:id', resourceController.getResourceById);

module.exports = router;
