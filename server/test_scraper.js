const axios = require('axios');
const cheerio = require('cheerio');

const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll (Music)
// const testUrl = 'https://www.youtube.com/watch?v=_uQrJ0TkZlc'; // Python Tutorial (Education)

async function checkCategory(url) {
    try {
        console.log(`Checking: ${url}`);
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Method 1: Schema.org metadata
        const $ = cheerio.load(data);
        const genre = $('meta[itemprop="genre"]').attr('content');

        // Method 2: Regex for category in JSON blob
        const categoryMatch = data.match(/"category":"(.*?)"/);
        const category = categoryMatch ? categoryMatch[1] : null;

        console.log('Genre (Meta):', genre);
        console.log('Category (JSON):', category);

        const isEdu = (genre === 'Education' || category === 'Education' || category === 'Science & Technology');
        console.log('Is Educational?', isEdu);

    } catch (err) {
        console.error("Failed:", err.message);
    }
}

checkCategory(testUrl);
