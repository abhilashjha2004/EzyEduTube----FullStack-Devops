const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduhub')
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`- ${u.username}`));
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
