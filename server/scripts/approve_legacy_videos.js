const { Op } = require('sequelize');
const Video = require('../models/Video');
const sequelize = require('../config/database'); // Ensure db connection initializes

const approveLegacyVideos = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database for legacy video approval.');

        const [updatedRowsCount] = await Video.update({
            status: 'approved',
            isEducational: true,
            moderationScore: 100,
            reviewedByAI: true,
            approvedAt: new Date()
        }, {
            where: {
                [Op.or]: [
                    { status: null },
                    { reviewedByAI: null }
                ]
            }
        });

        console.log(`✅ Approved legacy videos: ${updatedRowsCount}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to approve legacy videos:', error);
        process.exit(1);
    }
};

approveLegacyVideos();
