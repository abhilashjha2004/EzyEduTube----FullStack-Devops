const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const courseController = require('../controllers/courses');

// Multer memory storage for optional thumbnail upload
const upload = multer({ storage: multer.memoryStorage() });

// GET ALL COURSES
router.get('/', courseController.getAllCourses);

// GET SINGLE COURSE (with videos + documents)
router.get('/:id', courseController.getCourseById);

// CREATE COURSE (teacher or admin)
router.post('/', authMiddleware, upload.single('thumbnail'), courseController.createCourse);

// UPDATE COURSE
router.put('/:id', authMiddleware, courseController.updateCourse);

// DELETE COURSE (owner or admin)
router.delete('/:id', authMiddleware, courseController.deleteCourse);

// ENROLL in a course
router.post('/:id/enroll', authMiddleware, courseController.enrollCourse);

// GET MY ENROLLMENTS
router.get('/my/enrollments', authMiddleware, courseController.getMyEnrollments);

module.exports = router;
