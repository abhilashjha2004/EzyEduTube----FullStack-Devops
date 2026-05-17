const axios = require('axios');
const cheerio = require('cheerio');

class MetadataFetcher {
    async fetch(url) {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0 Safari/537.36' },
                timeout: 5000 // Prevent hanging
            });
            const $ = cheerio.load(data);
            
            let title = $('title').text() || $('meta[property="og:title"]').attr('content') || $('meta[name="title"]').attr('content') || '';
            let description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
            
            // Extract some text from the body to help with AI classification if description is weak
            let bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 500);

            return {
                title: title.trim(),
                description: description.trim(),
                tags: [bodyText] // use tags array to pass body text
            };
        } catch (error) {
            console.error('[MetadataFetcher] Error fetching url:', error.message);
            return { title: '', description: '', tags: [] };
        }
    }
}

module.exports = new MetadataFetcher();
