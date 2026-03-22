const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5000;

const helmet = require('helmet');
const path = require('path');
const passport = require('passport');
require('./config/passport');

// Middleware
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5174',
    process.env.ADMIN_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5173',
    'http://localhost:5175'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(passport.initialize());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduhub')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const resourceRoutes = require('./routes/resources');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const downloadRoutes = require('./routes/download');
const notificationRoutes = require('./routes/notifications');

// app.use('/api/resources', resourceRoutes); // Deprecating old resources
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Edu-Tube API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
