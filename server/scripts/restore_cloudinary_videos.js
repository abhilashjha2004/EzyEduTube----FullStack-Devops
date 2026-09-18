const path = require('path');
const fs = require('fs');
const connectDB = require('../config/database');
const { User, Course, Video } = require('../models');

async function restoreVideos() {
    try {
        console.log('🚀 Starting safe idempotent Cloudinary video recovery script...');

        // 1. Connect to MongoDB Atlas
        await connectDB();

        // 2. Read recovered_videos.json
        const mappingPath = path.join(__dirname, '..', 'recovered_videos.json');
        if (!fs.existsSync(mappingPath)) {
            throw new Error(`Mapping file not found at: ${mappingPath}`);
        }
        const recoveredVideos = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
        console.log(`📄 Loaded ${recoveredVideos.length} approved educational video definitions.`);

        // 3. Locate teacher/uploader user
        let teacherUser = await User.findOne({ username: 'audit_user_2851' });
        if (!teacherUser) {
            teacherUser = await User.findOne();
        }
        if (!teacherUser) {
            throw new Error('No user found in database to assign as course teacher/uploader.');
        }
        console.log(`👤 Using user as educator: "${teacherUser.username}" (${teacherUser._id})`);

        // 4. Find or create Course: "Recovered EzyEduTube Content" (Idempotent)
        const courseTitle = 'Recovered EzyEduTube Content';
        let course = await Course.findOne({ title: courseTitle });
        if (!course) {
            console.log(`📚 Creating new course container: "${courseTitle}"...`);
            course = await Course.create({
                title: courseTitle,
                description: 'Recovered educational content from the original EzyEduTube Cloudinary media library after migration from the unavailable legacy database.',
                subject: 'Computer Science',
                thumbnailUrl: 'https://res.cloudinary.com/dseo7ljtx/image/upload/v1778753461/ezyedutube/thumbnails/btv30jr6uenla1pu1gcq.png',
                teacherId: teacherUser._id
            });
            console.log(`✅ Created course: "${course.title}" (ID: ${course._id})`);
        } else {
            console.log(`ℹ️ Course "${courseTitle}" already exists (ID: ${course._id}). Preserving.`);
        }

        // 5. Safely insert videos idempotently (keying on unique videoUrl)
        let insertedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < recoveredVideos.length; i++) {
            const v = recoveredVideos[i];

            // Check if video document already exists
            const existingVideo = await Video.findOne({ videoUrl: v.videoUrl });
            if (existingVideo) {
                console.log(`⏭️  Video already exists: "${existingVideo.title}" (${existingVideo._id}). Skipping.`);
                skippedCount++;
                continue;
            }

            // Create new video document
            const created = await Video.create({
                title: v.title,
                description: v.description,
                videoUrl: v.videoUrl,
                thumbnailUrl: v.thumbnailUrl || '',
                duration: v.duration || 0,
                views: 0,
                sourceType: 'upload',
                subject: v.subject || 'Computer Science',
                orderIndex: i + 1,
                status: 'approved',
                isEducational: true,
                moderationScore: 100,
                reviewedByAI: true,
                approvedAt: new Date(),
                uploaderId: teacherUser._id,
                courseId: course._id,
                likes: []
            });

            console.log(`✅ Inserted video #${i + 1}: "${created.title}" (ID: ${created._id})`);
            insertedCount++;
        }

        console.log('\n================ RESTORE SUMMARY ================');
        console.log(`Course:               "${course.title}" (${course._id})`);
        console.log(`Videos Inserted:      ${insertedCount}`);
        console.log(`Videos Skipped/Exist: ${skippedCount}`);
        console.log(`Total Target Videos:  ${recoveredVideos.length}`);
        console.log('=================================================\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error during video restoration:', err.message);
        process.exit(1);
    }
}

restoreVideos();
