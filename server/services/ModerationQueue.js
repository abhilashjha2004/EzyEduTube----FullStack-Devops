const AIClassifier = require('./AIClassifier');
const Video = require('../models/Video');

class ModerationQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    add(videoData) {
        this.queue.push(videoData);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const currentTask = this.queue.shift();

        console.log(`[ModerationQueue] Started processing video ID: ${currentTask.videoId}`);

        try {
            const aiResult = await AIClassifier.analyzeVideoAsync(currentTask);
            
            // Update Database with Results
            await Video.update({
                status: aiResult.allowed ? 'approved' : 'rejected',
                isEducational: aiResult.allowed,
                moderationScore: aiResult.score,
                visualConfidence: aiResult.visualConfidence || 0,
                transcriptConfidence: aiResult.transcriptConfidence || 0,
                moderationReason: aiResult.reason,
                reviewedByAI: true,
                approvedAt: aiResult.allowed ? new Date() : null
            }, {
                where: { id: currentTask.videoId }
            });

            console.log(`[ModerationQueue] Finished video ID: ${currentTask.videoId}. Status: ${aiResult.allowed ? 'approved' : 'rejected'}`);
        } catch (error) {
            console.error(`[ModerationQueue] Failed processing video ID: ${currentTask.videoId}`, error);
            // On failure, reject to be safe, or leave pending? 
            // We will leave it rejected with an error reason
            await Video.update({
                status: 'rejected',
                moderationReason: 'AI Moderation failed due to an internal error. Please contact support.',
                reviewedByAI: false
            }, {
                where: { id: currentTask.videoId }
            });
        }

        // Process next item
        this.processQueue();
    }
}

module.exports = new ModerationQueue();
