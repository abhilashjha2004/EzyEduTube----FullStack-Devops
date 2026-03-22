import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trash2, ShieldAlert, MonitorPlay } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
    const { logout, adminUser } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${API}/videos`);
            setVideos(res.data);
        } catch (err) {
            console.error('Failed to load videos', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this video?')) return;
        try {
            await axios.delete(`${API}/videos/${id}`);
            setVideos(videos.filter(v => v._id !== id));
        } catch (err) {
            alert('Failed to delete video. Check console.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Topbar */}
            <div className="bg-zinc-950 text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="text-red-500" />
                    <span className="font-bold text-lg tracking-wide">EzyEduTube <span className="text-zinc-500 font-normal">Admin</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-400">Logged in as <strong className="text-white">{adminUser?.username}</strong></span>
                    <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-red-600 rounded-lg text-sm font-medium transition">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-8 px-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                            <MonitorPlay className="text-red-500" /> Content Management
                        </h1>
                        <p className="text-zinc-500 mt-1">Review and moderate all educational videos.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200">
                        <span className="text-2xl font-bold text-zinc-800">{videos.length}</span>
                        <span className="text-sm text-zinc-500 ml-2">Total Videos</span>
                    </div>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-zinc-200 rounded-xl w-full"></div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
                            <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-500 uppercase font-semibold text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Video Details</th>
                                    <th className="px-6 py-4">Uploader</th>
                                    <th className="px-6 py-4">Metrics</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {videos.map(video => (
                                    <tr key={video._id} className="hover:bg-zinc-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-10 bg-zinc-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={video.thumbnailUrl || 'https://via.placeholder.com/150'} alt="thumb" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col max-w-[250px] overflow-hidden text-ellipsis">
                                                    <a href={`http://localhost:5174/resource/${video._id}`} target="_blank" rel="noreferrer" className="font-semibold text-zinc-900 hover:text-red-600 truncate">
                                                        {video.title}
                                                    </a>
                                                    <span className="text-xs text-zinc-500 mt-0.5">{video.sourceType === 'external' ? 'External Link' : 'Direct Upload'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-700">{video.uploader?.username || 'Unknown'}</span>
                                                <span className="text-xs text-zinc-400">{video.uploader?._id || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">
                                            {video.views || 0} views<br/>
                                            {video.likes?.length || 0} likes
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs text-wrap">
                                            {new Date(video.createdAt).toLocaleDateString()}<br/>
                                            {new Date(video.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(video._id)}
                                                className="p-2 opacity-0 group-hover:opacity-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition"
                                                title="Delete Video permanently"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {videos.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 bg-zinc-50">
                                            No videos found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
