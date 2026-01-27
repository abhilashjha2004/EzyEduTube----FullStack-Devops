import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, FileText, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Upload = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploadMode, setUploadMode] = useState('video'); // 'video' or 'link'

    // Video Mode
    const [videoFile, setVideoFile] = useState(null);

    // Link Mode
    const [externalLink, setExternalLink] = useState("");

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [resources, setResources] = useState([]);
    const [error, setError] = useState("");

    const handleFileChange = (e, setter) => {
        if (e.target.files[0]) setter(e.target.files[0]);
    };

    const handleResourceChange = (e) => {
        const files = Array.from(e.target.files);
        setResources(prev => [...prev, ...files]);
    };

    const removeResource = (index) => {
        setResources(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title) return setError("Title is required");

        if (uploadMode === 'video' && !videoFile) return setError("Please select a video file.");
        if (uploadMode === 'link' && !externalLink) return setError("Please enter a valid link.");

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('isExternal', uploadMode === 'link');

        if (uploadMode === 'video') {
            formData.append('video', videoFile);
        } else {
            formData.append('externalLink', externalLink);
        }

        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
        if (user) formData.append('userId', user._id);

        resources.forEach(file => {
            formData.append('resources', file);
        });

        try {
            setLoading(true);
            await axios.post('http://localhost:5000/api/videos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 animation-fade-in">
            <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white flex items-center gap-2">
                <UploadIcon className="text-red-600" />
                Upload Content
            </h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Title & Desc */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50 dark:border-zinc-700 focus:ring-2 focus:ring-red-500 outline-none transition"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="e.g. Introduction to Data Science"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50 dark:border-zinc-700 h-32 focus:ring-2 focus:ring-red-500 outline-none transition"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your content..."
                        />
                    </div>
                </div>

                {/* Content Type Toggle */}
                <div>
                    <label className="block text-sm font-medium mb-3">Content Source</label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
                        <button
                            type="button"
                            onClick={() => setUploadMode('video')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${uploadMode === 'video' ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-zinc-500'
                                }`}
                        >
                            Upload Video
                        </button>
                        <button
                            type="button"
                            onClick={() => setUploadMode('link')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${uploadMode === 'link' ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-zinc-500'
                                }`}
                        >
                            External Link
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {uploadMode === 'video' ? (
                        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition relative group">
                            <UploadIcon className="mx-auto h-8 w-8 text-red-500 mb-2 transition-transform group-hover:-translate-y-1" />
                            <label className="block text-sm font-medium cursor-pointer">
                                <span className="text-red-500 font-bold hover:underline">Choose Video File</span>
                                <input type="file" accept="video/*" hidden onChange={e => handleFileChange(e, setVideoFile)} />
                            </label>
                            {videoFile ? (
                                <p className="text-xs mt-2 text-green-600 font-medium truncate bg-green-100 dark:bg-green-900/30 py-1 px-2 rounded">{videoFile.name}</p>
                            ) : (
                                <p className="text-xs text-zinc-400 mt-2">MP4, WebM up to 500MB</p>
                            )}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                            <LinkIcon className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                            <label className="block text-sm font-medium mb-1">External Educational Link</label>
                            <input
                                type="url"
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full p-2 bg-transparent border-b border-zinc-300 dark:border-zinc-600 focus:border-blue-500 outline-none text-center text-sm"
                                value={externalLink}
                                onChange={e => setExternalLink(e.target.value)}
                            />
                            <p className="text-xs text-zinc-400 mt-2 text-center">YouTube, Vimeo, Coursera only.</p>
                        </div>
                    )}

                    {/* Thumbnail Upload */}
                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition relative group">
                        <ImageIcon className="mx-auto h-8 w-8 text-purple-500 mb-2 transition-transform group-hover:-translate-y-1" />
                        <label className="block text-sm font-medium cursor-pointer">
                            <span className="text-purple-500 font-bold hover:underline">Upload Thumbnail</span>
                            <input type="file" accept="image/*" hidden onChange={e => handleFileChange(e, setThumbnailFile)} />
                        </label>
                        {thumbnailFile ? (
                            <p className="text-xs mt-2 text-green-600 font-medium truncate bg-green-100 dark:bg-green-900/30 py-1 px-2 rounded">{thumbnailFile.name}</p>
                        ) : (
                            <p className="text-xs text-zinc-400 mt-2">JPG, PNG (Optional)</p>
                        )}
                    </div>
                </div>

                {/* Resources */}
                <div>
                    <label className="block text-sm font-medium mb-2">Practice Material (PDFs)</label>
                    <div className="flex items-center gap-4 mb-4">
                        <label className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer text-sm font-medium hover:opacity-80 transition flex items-center gap-2">
                            <FileText size={16} />
                            Attach Files
                            <input type="file" multiple accept=".pdf,.doc,.docx" hidden onChange={handleResourceChange} />
                        </label>
                    </div>
                    <div className="space-y-2">
                        {resources.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-orange-500" />
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <button type="button" onClick={() => removeResource(i)} className="text-zinc-400 hover:text-red-500">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Publishing...' : 'Publish to EDU-HUB'}
                    </button>
                    <p className="text-center text-xs text-zinc-400 mt-4">By publishing, you verify this content is educational and relevant.</p>
                </div>

            </form>
        </div>
    );
};

export default Upload;
