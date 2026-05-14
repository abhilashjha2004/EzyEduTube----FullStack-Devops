const axios = require('axios');

class YouTubeValidator {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY;
    }

    extractVideoId(url) {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname.includes('youtube.com')) {
                return parsedUrl.searchParams.get('v');
            } else if (parsedUrl.hostname.includes('youtu.be')) {
                return parsedUrl.pathname.slice(1);
            }
            return null;
        } catch {
            return null;
        }
    }

    async validate(url) {
        if (!this.apiKey) {
            console.warn('⚠️ YOUTUBE_API_KEY not set. Falling back to basic validation.');
            return { isValid: true, data: null };
        }

        const videoId = this.extractVideoId(url);
        if (!videoId) {
            return { isValid: false, reason: "Invalid YouTube URL format." };
        }

        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                params: {
                    part: 'snippet,contentDetails',
                    id: videoId,
                    key: this.apiKey
                }
            });

            if (!response.data.items || response.data.items.length === 0) {
                return { isValid: false, reason: "Video not found or is private." };
            }

            const video = response.data.items[0];
            const snippet = video.snippet;
            const categoryId = snippet.categoryId;
            const durationIso = video.contentDetails.duration;
            
            // Duration check: must be >= 60 seconds (PT1M)
            const durationSeconds = this.parseDuration(durationIso);
            if (durationSeconds < 60) {
                return { isValid: false, reason: "Video is under 60 seconds (Shorts/Clips are rejected)." };
            }

            // Category check
            // 10: Music, 20: Gaming, 24: Entertainment, 23: Comedy
            // 27: Education, 28: Science & Technology
            const REJECTED_CATEGORIES = ['10', '20', '23', '24']; 
            if (REJECTED_CATEGORIES.includes(categoryId)) {
                return { isValid: false, reason: `Category ID ${categoryId} is blocked (Music/Gaming/Entertainment).` };
            }

            // Keyword check for memes/reels in title
            const titleLower = snippet.title.toLowerCase();
            const blockedKeywords = ['meme', 'reel', 'tiktok', 'funny', 'prank', 'shorts'];
            for (const word of blockedKeywords) {
                if (titleLower.includes(word)) {
                    return { isValid: false, reason: `Blocked keyword detected: ${word}.` };
                }
            }

            return {
                isValid: true,
                data: {
                    title: snippet.title,
                    description: snippet.description,
                    tags: snippet.tags || []
                }
            };
        } catch (error) {
            console.error('YouTube API Error:', error.message);
            return { isValid: true, reason: "API Error, fallback to AI validation", data: null };
        }
    }

    parseDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return 0;
        
        const hours = (parseInt(match[1]) || 0);
        const minutes = (parseInt(match[2]) || 0);
        const seconds = (parseInt(match[3]) || 0);
        
        return hours * 3600 + minutes * 60 + seconds;
    }
}

module.exports = new YouTubeValidator();
