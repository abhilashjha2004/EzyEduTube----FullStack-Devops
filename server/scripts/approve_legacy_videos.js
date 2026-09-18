const Video = require('../models/Video');
const connectDB = require('../config/database');

const approveLegacyVideos = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB for legacy video approval.');

        const result = await Video.updateMany({
            $or: [
                { status: null },
                { reviewedByAI: null }
            ]
        }, {
            $set: {
                status: 'approved',
                isEducational: true,
                moderationScore: 100,
                reviewedByAI: true,
                approvedAt: new Date()
            }
        });

        console.log(`✅ Approved legacy videos count: ${result.modifiedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to approve legacy videos:', error);
        process.exit(1);
    }
};

approveLegacyVideos();
