const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const Tesseract = require('tesseract.js');
const natural = require('natural');

ffmpeg.setFfmpegPath(ffmpegPath);

class AIClassifier {
    constructor() {
        this.hfApiKey = process.env.HF_API_KEY;
        this.classifier = new natural.BayesClassifier();
        this.isTrained = false;
        this.trainModel();
    }

    trainModel() {
        // NLP Training Data
        const eduData = [
            'tutorial', 'lecture', 'mathematics', 'calculus', 'algebra', 'science', 'physics',
            'biology', 'chemistry', 'programming', 'python', 'javascript', 'react', 'nodejs',
            'history', 'geography', 'literature', 'exam', 'study', 'course', 'lesson', 'guide',
            'dsa', 'coding', 'sql', 'placement', 'preparation', 'development', 'interview', 'educational', 'os', 'dbms', 'machine learning'
        ];

        const garbageData = [
            'gameplay', 'fortnite', 'minecraft', 'gta', 'pubg', 'kill', 'win', 'prank', 'funny',
            'comedy', 'laugh', 'meme', 'vlog', 'daily', 'challenge', 'movie', 'trailer', 'song',
            'music', 'dance', 'tiktok', 'reel', 'shorts', 'entertainment', 'gossip', 'reaction', 'roast'
        ];

        eduData.forEach(text => this.classifier.addDocument(text, 'educational'));
        garbageData.forEach(text => this.classifier.addDocument(text, 'entertainment'));

        this.classifier.train();
        this.isTrained = true;
        console.log("[AIClassifier] NLP Model Trained.");
    }

    // 1. Download segment of remote video or use direct URL for FFmpeg
    // FFmpeg can read directly from URLs!
    
    // Extract 3 Frames
    async extractFrames(videoUrl, tempDir) {
        return new Promise((resolve, reject) => {
            const screenshots = [];
            const filename = `frame_${Date.now()}`;

            ffmpeg(videoUrl)
                .on('end', () => resolve(screenshots))
                .on('error', (err) => {
                    console.error('[AIClassifier] FFmpeg Frame Extraction Error:', err);
                    resolve([]); // Fail gracefully
                })
                .on('filenames', (filenames) => {
                    filenames.forEach(f => screenshots.push(path.join(tempDir, f)));
                })
                .screenshots({
                    count: 3,
                    folder: tempDir,
                    filename: `${filename}-%i.png`,
                    size: '640x360'
                });
        });
    }

    // Extract Audio (first 30 seconds)
    async extractAudio(videoUrl, tempDir) {
        return new Promise((resolve) => {
            const audioPath = path.join(tempDir, `audio_${Date.now()}.mp3`);
            ffmpeg(videoUrl)
                .setDuration(30) // Only first 30 seconds for lightweight analysis
                .noVideo()
                .audioCodec('libmp3lame')
                .on('end', () => resolve(audioPath))
                .on('error', (err) => {
                    console.error('[AIClassifier] FFmpeg Audio Extraction Error:', err);
                    resolve(null);
                })
                .save(audioPath);
        });
    }

    // OCR scanning
    async scanImageOCR(imagePath) {
        try {
            const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
            return text.toLowerCase();
        } catch (err) {
            console.warn("[AIClassifier] OCR Failed on frame.");
            return "";
        }
    }

    // Hugging Face Image Classification (detect NSFW / Gameplay)
    async classifyImageHF(imagePath) {
        if (!this.hfApiKey) return null;
        try {
            const imageBuffer = fs.readFileSync(imagePath);
            // We use a free efficientnet or resnet model or a specialized content moderation model on HF
            // 'Falconsai/nsfw_image_detection' is a good lightweight model for safety
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection",
                imageBuffer,
                {
                    headers: { Authorization: `Bearer ${this.hfApiKey}`, 'Content-Type': 'application/octet-stream' }
                }
            );
            return response.data; // Array of labels/scores
        } catch (error) {
            console.warn("[AIClassifier] HF Image Classification failed:", error.response?.data || error.message);
            return null;
        }
    }

    // Hugging Face Audio Transcription (Whisper)
    async transcribeAudioHF(audioPath) {
        if (!this.hfApiKey) return "";
        try {
            const audioBuffer = fs.readFileSync(audioPath);
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/openai/whisper-tiny", // Tiny model for speed
                audioBuffer,
                {
                    headers: { Authorization: `Bearer ${this.hfApiKey}`, 'Content-Type': 'audio/mp3' }
                }
            );
            return response.data.text || "";
        } catch (error) {
            console.warn("[AIClassifier] HF Audio Transcription failed:", error.response?.data || error.message);
            return "";
        }
    }

    // Combined Analysis (Async Job)
    async analyzeVideoAsync(task) {
        const { videoId, videoUrl, title, description, tags, isExternal } = task;
        
        console.log(`[AIClassifier] Starting full async analysis for video: ${title}`);
        
        let ocrTextCombined = "";
        let transcript = "";
        let visualConfidence = 100; // Assume good until proven bad
        let isNSFW = false;

        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'moderation-'));

        try {
            // For external YouTube links, we can't easily extract frames via URL in fluent-ffmpeg unless it's a raw video URL.
            // But if it's external, YouTubeValidator already validated it. We will still do NLP on metadata.
            if (!isExternal && videoUrl) {
                // 1. Extract Frames
                const frames = await this.extractFrames(videoUrl, tempDir);
                
                for (const frame of frames) {
                    // 2. Run OCR
                    const text = await this.scanImageOCR(frame);
                    ocrTextCombined += text + " ";

                    // 3. Run HF Visual Moderation (if API key provided)
                    const visualLabels = await this.classifyImageHF(frame);
                    if (visualLabels && Array.isArray(visualLabels)) {
                        // Look for 'nsfw' label
                        const nsfwLabel = visualLabels.find(l => l.label === 'nsfw');
                        if (nsfwLabel && nsfwLabel.score > 0.6) {
                            isNSFW = true;
                            visualConfidence = 0;
                        }
                    }
                }

                // 4. Extract Audio & Transcribe
                const audioPath = await this.extractAudio(videoUrl, tempDir);
                if (audioPath) {
                    transcript = await this.transcribeAudioHF(audioPath);
                }
            }

            // 5. NLP Combined Scoring
            const combinedText = `${title} ${description} ${tags} ${ocrTextCombined} ${transcript}`.toLowerCase();
            
            // Hard keyword check
            const BLOCKED_WORDS = ['remix', 'song', 'gameplay', 'vlog', 'roast', 'meme', 'prank', 'shorts', 'dance', 'movie clip'];
            const hasBlocked = BLOCKED_WORDS.some(w => combinedText.includes(w));
            if (hasBlocked) {
                return { allowed: false, score: 10, reason: "Detected strictly prohibited entertainment keywords." };
            }

            if (isNSFW) {
                return { allowed: false, score: 0, visualConfidence: 0, reason: "Visual analysis detected explicit or prohibited content." };
            }

            // NLP Classification
            const nlpClass = this.classifier.classify(combinedText);
            
            let finalScore = 50;
            let transcriptConfidence = 50;

            if (nlpClass === 'educational') {
                finalScore += 30; // base edu boost
                transcriptConfidence = 80;
            } else {
                finalScore -= 20; // base entertainment penalty
                transcriptConfidence = 20;
            }

            // If we have transcript/OCR and it matches edu words
            const EDU_WORDS = ['tutorial', 'lecture', 'coding', 'dsa', 'dbms', 'java', 'react', 'machine learning', 'science', 'math'];
            const matchedEduWords = EDU_WORDS.filter(w => combinedText.includes(w));
            if (matchedEduWords.length > 2) {
                finalScore += 20;
            }

            // Cap scores
            finalScore = Math.min(100, Math.max(0, finalScore));

            console.log(`[AIClassifier] Analysis done. Score: ${finalScore}, NLP: ${nlpClass}`);

            if (finalScore < 75) {
                return { 
                    allowed: false, 
                    score: finalScore, 
                    visualConfidence, 
                    transcriptConfidence, 
                    reason: `Failed confidence threshold (Score: ${finalScore}). Content appears non-educational.` 
                };
            }

            return { 
                allowed: true, 
                score: finalScore, 
                visualConfidence, 
                transcriptConfidence, 
                reason: "Approved as educational." 
            };

        } catch (error) {
            console.error('[AIClassifier] Error during analysis:', error);
            throw error;
        } finally {
            // Cleanup temp dir
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
}

module.exports = new AIClassifier();
