import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Download, Send, ThumbsUp, Eye, User, Trash2 } from 'lucide-react';

const ResourceDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/videos/${id}`);
                setVideoData(res.data.video);
                setComments(res.data.comments);
            } catch (err) {
                console.error("Failed to load video", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const res = await axios.post(`http://localhost:5000/api/videos/${id}/comments`, {
                userId: user._id,
                content: comment
            });
            setComments(prev => [res.data, ...prev]);
            setComment("");
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this content?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/videos/${id}`, {
                data: { userId: user._id }
            });
            navigate('/');
        } catch (err) {
            alert("Failed to delete video");
        }
    };

    if (loading) return <div className="text-center mt-20">Loading...</div>;
    if (!videoData) return <div className="text-center mt-20">Video not found</div>;

    const isOwner = user && videoData.uploader && user._id === videoData.uploader._id;

    // Helper to determine video source
    const VideoPlayer = () => {
        if (videoData.sourceType === 'external') {
            // Basic Embed handling
            let embedUrl = videoData.videoUrl;
            if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
                const videoId = embedUrl.split('v=')[1] || embedUrl.split('/').pop();
                embedUrl = `https://www.youtube.com/embed/${videoId?.split('&')[0]}`;
            }
            return (
                <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={videoData.title}
                />
            );
        }
        return (
            <video
                src={videoData.videoUrl}
                controls
                className="w-full h-full"
                poster={videoData.thumbnailUrl}
            >
                Your browser does not support the video tag.
            </video>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content (Player + Info) */}
            <div className="lg:col-span-2 space-y-6">

                {/* Video Player */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <VideoPlayer />
                </div>

                {/* Video Info */}
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <h1 className="text-2xl font-bold leading-tight">{videoData.title}</h1>
                        {isOwner && (
                            <button onClick={handleDelete} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition" title="Delete Video">
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Eye size={18} />
                                <span>{videoData.views} views</span>
                            </div>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(videoData.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                                <ThumbsUp size={18} />
                                <span>Like</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Uploader & Desc */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                        {videoData.uploader?.avatar ? (
                            <img src={videoData.uploader.avatar} alt="User" className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {videoData.uploader?.username?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{videoData.uploader?.username || 'Unknown'}</p>
                            <p className="text-xs text-zinc-500">Instructor</p>
                        </div>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {videoData.description}
                    </p>
                </div>

                {/* Comments Section */}
                <div className="pt-6">
                    <h3 className="text-xl font-bold mb-4">{comments.length} Comments</h3>

                    {user ? (
                        <form onSubmit={handleComment} className="flex gap-4 mb-8">
                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className="w-full border-b border-zinc-200 dark:border-zinc-700 bg-transparent py-2 focus:border-black dark:focus:border-white focus:outline-none transition"
                                    placeholder="Add a comment on this topic..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        disabled={!comment.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Post Question
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <p className="mb-8 text-zinc-500">Please login to ask questions.</p>
                    )}

                    <div className="space-y-6">
                        {comments.map((c) => (
                            <div key={c._id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {c.user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{c.user?.username || 'User'}</span>
                                        <span className="text-xs text-zinc-500">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
                                    </div>
                                    <p className="text-zinc-800 dark:text-zinc-200 text-sm">{c.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar (Resources & Related) */}
            <div className="space-y-6">
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-red-600" />
                        Resources & Practice
                    </h3>

                    {videoData.resources?.length > 0 ? (
                        <div className="space-y-3">
                            {videoData.resources.map((res, i) => (
                                <a
                                    key={i}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition group"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText size={18} className="text-zinc-500" />
                                        <span className="text-sm truncate font-medium">{res.title}</span>
                                    </div>
                                    <Download size={16} className="text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500">No resources attached to this video.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceDetail;
