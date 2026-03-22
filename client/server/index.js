const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const helmet = require('helmet');
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
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

// app.use('/api/resources', resourceRoutes); // Deprecating old resources
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

app.get('/', (req, res) => {
    res.send('Edu-Tube API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
