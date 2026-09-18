const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary environment variables are missing in server/.env');
    console.error('CLOUDINARY_CLOUD_NAME exists:', !!cloudName);
    console.error('CLOUDINARY_API_KEY exists:', !!apiKey);
    console.error('CLOUDINARY_API_SECRET exists:', !!apiSecret);
    process.exit(1);
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
});

console.log('✅ Cloudinary initialized successfully for cloud:', cloudName);

async function scanInventory() {
    try {
        console.log('🔍 Querying Cloudinary for video assets...');
        
        // 1. Query videos inside ezyedutube/videos
        let videoResources = [];
        try {
            const res = await cloudinary.api.resources({
                resource_type: 'video',
                type: 'upload',
                prefix: 'ezyedutube/videos',
                max_results: 500
            });
            videoResources = res.resources || [];
        } catch (err) {
            console.warn('⚠️ Query with prefix "ezyedutube/videos" note:', err.message);
        }

        // Also check if any videos exist with prefix "ezyedutube" in case they were placed at another subfolder
        if (videoResources.length === 0) {
            console.log('ℹ️ No videos under "ezyedutube/videos", scanning entire "ezyedutube" prefix...');
            try {
                const resGeneral = await cloudinary.api.resources({
                    resource_type: 'video',
                    type: 'upload',
                    prefix: 'ezyedutube',
                    max_results: 500
                });
                videoResources = resGeneral.resources || [];
            } catch (err) {
                console.warn('⚠️ General ezyedutube prefix query note:', err.message);
            }
        }

        // If still 0, check root / all uploaded videos
        if (videoResources.length === 0) {
            console.log('ℹ️ No videos with "ezyedutube" prefix, scanning all uploaded videos...');
            try {
                const resAll = await cloudinary.api.resources({
                    resource_type: 'video',
                    type: 'upload',
                    max_results: 100
                });
                videoResources = resAll.resources || [];
            } catch (err) {
                console.warn('⚠️ All video query note:', err.message);
            }
        }

        console.log(`📹 Found ${videoResources.length} video asset(s).`);

        // Fetch detailed metadata (like duration) for each video
        const detailedVideos = [];
        for (const item of videoResources) {
            let duration = 0;
            try {
                const details = await cloudinary.api.resource(item.public_id, { resource_type: 'video', image_metadata: true });
                duration = Math.round(details.duration || 0);
            } catch (detailErr) {
                console.warn(`Could not fetch details for ${item.public_id}:`, detailErr.message);
            }

            const parts = item.public_id.split('/');
            const filename = parts[parts.length - 1];
            const folder = parts.slice(0, parts.length - 1).join('/');

            detailedVideos.push({
                public_id: item.public_id,
                secure_url: item.secure_url,
                filename: filename,
                duration: duration,
                format: item.format,
                bytes: item.bytes,
                width: item.width || 0,
                height: item.height || 0,
                created_at: item.created_at,
                folder: folder || 'root'
            });
        }

        // 2. Query thumbnails inside ezyedutube/thumbnails
        console.log('🖼️ Querying Cloudinary for thumbnail assets...');
        let thumbnailResources = [];
        try {
            const thumbRes = await cloudinary.api.resources({
                resource_type: 'image',
                type: 'upload',
                prefix: 'ezyedutube/thumbnails',
                max_results: 500
            });
            thumbnailResources = thumbRes.resources || [];
        } catch (err) {
            console.warn('⚠️ Query with prefix "ezyedutube/thumbnails" note:', err.message);
        }

        if (thumbnailResources.length === 0) {
            try {
                const thumbGeneral = await cloudinary.api.resources({
                    resource_type: 'image',
                    type: 'upload',
                    prefix: 'ezyedutube',
                    max_results: 500
                });
                thumbnailResources = thumbGeneral.resources || [];
            } catch (err) {
                console.warn('⚠️ General thumbnail query note:', err.message);
            }
        }

        console.log(`🖼️ Found ${thumbnailResources.length} thumbnail/image asset(s).`);

        const formattedThumbnails = thumbnailResources.map(item => {
            const parts = item.public_id.split('/');
            const filename = parts[parts.length - 1];
            const folder = parts.slice(0, parts.length - 1).join('/');
            return {
                public_id: item.public_id,
                secure_url: item.secure_url,
                filename: filename,
                format: item.format,
                bytes: item.bytes,
                width: item.width || 0,
                height: item.height || 0,
                created_at: item.created_at,
                folder: folder || 'root'
            };
        });

        // 3. Build Inventory (WITHOUT ANY SECRETS)
        const inventory = {
            cloud_name: cloudName,
            total_videos: detailedVideos.length,
            total_thumbnails: formattedThumbnails.length,
            scanned_at: new Date().toISOString(),
            videos: detailedVideos,
            thumbnails: formattedThumbnails
        };

        const outputPath = path.join(__dirname, '..', 'cloudinary_video_inventory.json');
        fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2), 'utf-8');
        console.log(`💾 Inventory successfully saved to: ${outputPath}`);

        // Print safe console summary
        console.log('\n================ INVENTORY SUMMARY ================');
        console.log(`Total Videos Found:     ${detailedVideos.length}`);
        console.log(`Total Thumbnails Found: ${formattedThumbnails.length}`);
        console.log('Videos:');
        detailedVideos.forEach((v, idx) => {
            console.log(`  [${idx + 1}] Public ID: ${v.public_id} | Format: ${v.format} | Duration: ${v.duration}s | Folder: ${v.folder}`);
        });
        console.log('Thumbnails:');
        formattedThumbnails.forEach((t, idx) => {
            console.log(`  [${idx + 1}] Public ID: ${t.public_id} | Format: ${t.format} | Folder: ${t.folder}`);
        });
        console.log('===================================================\n');

    } catch (err) {
        console.error('❌ Error scanning Cloudinary inventory:', err.message);
        process.exit(1);
    }
}

scanInventory();
