import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || "";

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Determine URL based on search
                // Note: The API we built returns all videos. We can filter on client for now or update API.
                // For simplicity, let's filter on client side if API doesn't support search yet.
                const res = await axios.get('http://localhost:5000/api/videos');
                let data = res.data;

                if (searchQuery) {
                    const lowerQ = searchQuery.toLowerCase();
                    data = data.filter(v =>
                        v.title.toLowerCase().includes(lowerQ) ||
                        v.uploader?.username?.toLowerCase().includes(lowerQ)
                    );
                }

                setVideos(data);
            } catch (err) {
                console.error("Failed to fetch videos", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-red-600" size={48} />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Categories / Chips would go here */}

            {videos.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">No videos found</h2>
                    <p className="text-zinc-500">Try searching for something else or upload a new video.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
