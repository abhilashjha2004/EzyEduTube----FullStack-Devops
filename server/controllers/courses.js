const { Course, Video, Document, User, Enrollment } = require('../models');
const { uploadToCloudinary } = require('../config/cloudinary');

// ─── GET ALL COURSES ──────────────────────────────────────────────────────────
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('teacherId', 'username avatar')
            .sort({ createdAt: -1 })
            .lean();

        const formatted = courses.map(c => ({
            ...c,
            id: c._id.toString(),
            teacher: c.teacherId ? {
                id: c.teacherId._id ? c.teacherId._id.toString() : c.teacherId,
                _id: c.teacherId._id ? c.teacherId._id.toString() : c.teacherId,
                username: c.teacherId.username,
                avatar: c.teacherId.avatar
            } : null
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET SINGLE COURSE ────────────────────────────────────────────────────────
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacherId', 'username avatar')
            .lean();

        if (!course) return res.status(404).json({ message: 'Course not found' });

        const videos = await Video.find({ courseId: course._id }).sort({ orderIndex: 1 }).lean();
        const documents = await Document.find({ courseId: course._id }).lean();

        const response = {
            ...course,
            id: course._id.toString(),
            teacher: course.teacherId ? {
                id: course.teacherId._id ? course.teacherId._id.toString() : course.teacherId,
                _id: course.teacherId._id ? course.teacherId._id.toString() : course.teacherId,
                username: course.teacherId.username,
                avatar: course.teacherId.avatar
            } : null,
            videos: videos.map(v => ({
                ...v,
                id: v._id.toString(),
                _id: v._id.toString(),
                likes: Array.isArray(v.likes) ? v.likes.map(l => l.toString()) : []
            })),
            documents: documents.map(d => ({
                ...d,
                id: d._id.toString(),
                _id: d._id.toString()
            }))
        };

        res.json(response);
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
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.teacherId.toString() !== req.user.id.toString() && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const { title, description, subject } = req.body;
        if (title !== undefined) course.title = title;
        if (description !== undefined) course.description = description;
        if (subject !== undefined) course.subject = subject;

        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── DELETE COURSE ────────────────────────────────────────────────────────────
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.teacherId.toString() !== req.user.id.toString() && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        // Cascades to videos, documents, enrollments
        await Video.deleteMany({ courseId: course._id });
        await Document.deleteMany({ courseId: course._id });
        await Enrollment.deleteMany({ courseId: course._id });
        await Course.findByIdAndDelete(course._id);

        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── ENROLL IN COURSE ─────────────────────────────────────────────────────────
const enrollCourse = async (req, res) => {
    try {
        const studentId = req.user.id;
        const courseId = req.params.id;

        const existing = await Enrollment.findOne({ studentId, courseId });
        if (existing) return res.status(409).json({ message: 'Already enrolled' });

        const enrollment = await Enrollment.create({
            studentId,
            courseId,
            status: 'active'
        });

        res.status(201).json({ message: 'Enrolled successfully', enrollment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET MY ENROLLMENTS ───────────────────────────────────────────────────────
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.user.id })
            .populate({
                path: 'courseId',
                populate: { path: 'teacherId', select: 'username' }
            })
            .lean();

        const formatted = enrollments.map(e => ({
            ...e,
            id: e._id.toString(),
            course: e.courseId ? {
                ...e.courseId,
                id: e.courseId._id.toString(),
                teacher: e.courseId.teacherId ? { username: e.courseId.teacherId.username } : null
            } : null
        }));

        res.json(formatted);
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
