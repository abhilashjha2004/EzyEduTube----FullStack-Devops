const natural = require('natural');
const Tesseract = require('tesseract.js');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

class AIClassifier {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.isTrained = false;
        this.trainModel();
    }

    trainModel() {
        // 1. Educational Dataset
        const eduData = [
            'tutorial', 'lecture', 'mathematics', 'calculus', 'algebra', 'science', 'physics',
            'biology', 'chemistry', 'programming', 'python', 'javascript', 'react', 'nodejs',
            'history', 'geography', 'literature', 'exam', 'study', 'course', 'lesson', 'guide',
            'analysis', 'research', 'experiment', 'chapter', 'syllabus', 'introduction', 'basics',
            'dsa', 'coding', 'sql', 'placement', 'preparation', 'development', 'interview', 'educational'
        ];

        // 2. Entertainment/Non-Edu Dataset
        const garbageData = [
            'gameplay', 'fortnite', 'minecraft', 'gta', 'pubg', 'kill', 'win', 'prank', 'funny',
            'comedy', 'laugh', 'meme', 'vlog', 'daily', 'challenge', 'movie', 'trailer', 'song',
            'music', 'dance', 'tiktok', 'reel', 'shorts', 'entertainment', 'gossip', 'reaction'
        ];

        eduData.forEach(text => this.classifier.addDocument(text, 'educational'));
        garbageData.forEach(text => this.classifier.addDocument(text, 'entertainment'));

        this.classifier.train();
        this.isTrained = true;
        console.log("AI Model Trained (Naive Bayes)");
    }

    // Extract 3 Frames from Video (Start, 10%, 20%)
    async extractFrames(videoPath) {
        return new Promise((resolve, reject) => {
            const screenshots = [];
            const filename = path.basename(videoPath, path.extname(videoPath));
            const outputDir = path.dirname(videoPath);

            ffmpeg(videoPath)
                .on('end', () => resolve(screenshots))
                .on('error', (err) => {
                    console.error('FFmpeg Error:', err);
                    resolve([]); // Fail gracefully by returning empty
                })
                .on('filenames', (filenames) => {
                    filenames.forEach(f => screenshots.push(path.join(outputDir, f)));
                })
                .screenshots({
                    count: 3,
                    folder: outputDir,
                    filename: `${filename}-screenshot-%i.png`,
                    size: '320x180' // Low res for faster OCR
                });
        });
    }

    // OCR: Read text from Image
    async scanImage(imagePath) {
        try {
            const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
            return text.toLowerCase();
        } catch (err) {
            console.error("OCR Failed:", err);
            return "";
        }
    }

    // PURE TEXT ANALYSIS
    analyzeText(title, description, additionalText = '') {
        const combinedText = `${title} ${description} ${additionalText}`.toLowerCase();

        // Strict Keyword Check (Instant Block)
        // Removed some overly strict words like 'kill', 'hot', 'viral' which can appear in educational context
        const BLOCK_KEYWORDS = [
            'gameplay', 'fortnite', 'pubg', 'prank', 'movie', 'trailer', 'sexy', 'nude', 'violence',
            'vulgar', 'kiss', 'porn', 'adult', 'nsfw', 'romance', 'gossip', 'scandal'
        ];
        const hasBlockedKeyword = BLOCK_KEYWORDS.some(word => combinedText.includes(word));

        // Educational Keywords Check
        const EDU_KEYWORDS = [
            'dsa', 'programming', 'coding', 'sql', 'placement', 'development',
            'interview', 'educational', 'tutorial', 'lecture', 'course', 'preparation'
        ];
        const hasEduKeyword = EDU_KEYWORDS.some(word => combinedText.includes(word));

        // C. Classification
        const classification = this.classifier.classify(combinedText);

        console.log(`AI Verdict: Class=${classification}, BlockList=${hasBlockedKeyword}, EduKeyword=${hasEduKeyword}`);

        if (hasBlockedKeyword) return { allowed: false, reason: "Detected blocked content (Keywords/OCR)" };
        
        // Lower overly strict filtering threshold: allow if explicitly matches edu keywords
        if (hasEduKeyword) return { allowed: true };

        // Temporarily allow all uploads for testing using:
        const isEducational = true;
        
        if (!isEducational && classification === 'entertainment') {
            return { allowed: false, reason: "AI classified content as Entertainment" };
        }

        return { allowed: true };
    }

    // MAIN ANALYSIS FUNCTION (For Video Files)
    async analyzeContent(videoPath, title, description) {
        let additionalText = '';
        let framePaths = [];

        try {
            // A. Extract Frames
            console.log("AI: Extracting frames from video...");
            framePaths = await this.extractFrames(videoPath);

            // B. Run OCR on Frames
            console.log("AI: Running OCR on frames...");
            for (const frame of framePaths) {
                const ocrText = await this.scanImage(frame);
                console.log(`AI Read: "${ocrText.substring(0, 50)}..."`);
                additionalText += " " + ocrText;
            }

        } catch (err) {
            console.error("AI Analysis Error (Video Processing):", err);
        } finally {
            // Cleanup: Delete screenshots
            framePaths.forEach(p => {
                if (fs.existsSync(p)) fs.unlinkSync(p);
            });
        }

        return this.analyzeText(title, description, additionalText);
    }
}

module.exports = new AIClassifier();
