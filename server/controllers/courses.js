const { Course, Video, Document, User, Enrollment } = require('../models');
const { uploadToCloudinary } = require('../config/cloudinary');

// ─── GET ALL COURSES ──────────────────────────────────────────────────────────
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            include: [
                { model: User, as: 'teacher', attributes: ['id', 'username', 'avatar'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET SINGLE COURSE ────────────────────────────────────────────────────────
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            include: [
                { model: User, as: 'teacher', attributes: ['id', 'username', 'avatar'] },
                { model: Video, as: 'videos', order: [['orderIndex', 'ASC']] },
                { model: Document, as: 'documents' }
            ]
        });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── CREATE COURSE ────────────────────────────────────────────────────────────
const createCourse = async (req, res) => {
    try {
        const { title, description, subject } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        let thumbnailUrl = '';
        if (req.file) {
            thumbnailUrl = await uploadToCloudinary(req.file.buffer, 'thumbnails', 'image');
        }

        const course = await Course.create({
            title,
            description: description || '',
            subject: subject || 'General',
            thumbnailUrl,
            teacherId: req.user.id
        });

        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── UPDATE COURSE ────────────────────────────────────────────────────────────
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.teacherId !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const { title, description, subject } = req.body;
        await course.update({ title, description, subject });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── DELETE COURSE ────────────────────────────────────────────────────────────
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.teacherId !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        await course.destroy(); // cascades to videos, documents, enrollments
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── ENROLL IN COURSE ─────────────────────────────────────────────────────────
const enrollCourse = async (req, res) => {
    try {
        const studentId = req.user.id;
        const courseId = parseInt(req.params.id);

        const [enrollment, created] = await Enrollment.findOrCreate({
            where: { studentId, courseId },
            defaults: { studentId, courseId, status: 'active' }
        });

        if (!created) return res.status(409).json({ message: 'Already enrolled' });
        res.status(201).json({ message: 'Enrolled successfully', enrollment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET MY ENROLLMENTS ───────────────────────────────────────────────────────
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { studentId: req.user.id },
            include: [{ model: Course, as: 'course', include: [{ model: User, as: 'teacher', attributes: ['username'] }] }]
        });
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    getMyEnrollments
};
