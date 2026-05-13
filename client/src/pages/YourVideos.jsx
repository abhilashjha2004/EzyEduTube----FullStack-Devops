import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Upload, Eye, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const YourVideos = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyVideos = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos`);
                const mine = res.data.filter(v => v.uploader?._id === user?._id || v.uploader === user?._id);
                setVideos(mine);
            } catch (err) {
                console.error('Failed to load your videos', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchMyVideos();
    }, [user]);

    if (!user) return (
        <div className="text-center py-24">
            <h2 className="text-xl font-semibold text-zinc-500">Login to see your videos</h2>
            <Link to="/login" className="inline-block mt-4 px-5 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition">
                Login
            </Link>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <Video size={22} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Your Videos</h1>
                        <p className="text-sm text-zinc-500">{videos.length} video{videos.length !== 1 ? 's' : ''} uploaded</p>
                    </div>
                </div>
                <Link to="/upload">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition shadow">
                        <Upload size={15} />
                        Upload New
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse aspect-video" />
                    ))}
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-24 space-y-3">
                    <Video size={48} className="mx-auto text-zinc-300 dark:text-zinc-600" />
                    <h2 className="text-xl font-semibold text-zinc-500">No videos yet</h2>
                    <p className="text-zinc-400 text-sm">Share your knowledge with the world!</p>
                    <Link to="/upload" className="inline-block mt-4 px-5 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition">
                        Upload Your First Video
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map(video => (
                        <Link key={video._id} to={`/resource/${video._id}`} className="group flex flex-col gap-3">
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                                <img
                                    src={video.thumbnailUrl || '/api/placeholder/400/225'}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-red-500 transition-colors">{video.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                                    <span className="flex items-center gap-1"><Eye size={11} />{video.views || 0} views</span>
                                    <span className="flex items-center gap-1"><Clock size={11} />{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default YourVideos;
