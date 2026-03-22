import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Download, Share2, Link2, Flag, CheckCircle, X, Loader2, Film } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

/* ─────────────────────────────────────────────
   Quality badge colour helper
───────────────────────────────────────────── */
const qualityColor = (label) => {
    const p = parseInt(label);
    if (p >= 1080) return 'bg-purple-600 text-white';
    if (p >= 720) return 'bg-blue-600 text-white';
    if (p >= 480) return 'bg-green-600 text-white';
    return 'bg-zinc-500 text-white';
};

/* Format seconds → "M:SS" or "H:MM:SS" */
const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
};

/* ─────────────────────────────────────────────
   Download Modal
───────────────────────────────────────────── */
const DownloadModal = ({ video, onClose }) => {
    const [formats, setFormats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(null); // itag currently being downloaded

    useEffect(() => {
        const fetchFormats = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get('http://localhost:5000/api/download/formats', {
                    params: { url: video.videoUrl }
                });
                setFormats(res.data.formats);
            } catch (err) {
                setError('Could not fetch available qualities. This video may not support download.');
            } finally {
                setLoading(false);
            }
        };
        fetchFormats();
    }, [video.videoUrl]);

    const handleDownload = (format) => {
        setDownloading(format.itag);
        // Build download URL pointing to our server proxy
        const params = new URLSearchParams({
            url: video.videoUrl,
            itag: format.itag,
            title: video.title || 'video',
        });
        // Open as a direct anchor download from server stream
        const a = document.createElement('a');
        a.href = `http://localhost:5000/api/download/stream?${params.toString()}`;
        a.download = `${video.title || 'video'}.${format.container || 'mp4'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Log to Downloads history
        const entry = {
            id: video._id,
            title: video.title,
            quality: format.qualityLabel,
            container: format.container,
            downloadedAt: new Date().toISOString(),
        };
        const prev = JSON.parse(localStorage.getItem('ezyedutube_downloads') || '[]');
        localStorage.setItem('ezyedutube_downloads', JSON.stringify([entry, ...prev].slice(0, 100)));

        setTimeout(() => setDownloading(null), 2000);
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                            <Download size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-zinc-900 dark:text-white text-base leading-tight">Download Video</h2>
                            <p className="text-xs text-zinc-500 truncate max-w-[220px]">{video.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                        <X size={18} className="text-zinc-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-zinc-500">
                            <Loader2 size={28} className="animate-spin text-indigo-500" />
                            <span className="text-sm">Fetching available qualities…</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <Film size={36} className="mx-auto mb-3 text-zinc-400" />
                            <p className="text-sm text-red-500 font-medium mb-1">Download unavailable</p>
                            <p className="text-xs text-zinc-500">{error}</p>
                        </div>
                    )}

                    {!loading && !error && formats.length === 0 && (
                        <p className="text-center text-sm text-zinc-500 py-8">No downloadable formats found for this video.</p>
                    )}

                    {!loading && !error && formats.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs text-zinc-500 mb-4">Select a quality to download directly:</p>
                            {formats.map((fmt) => (
                                <button
                                    key={fmt.itag}
                                    onClick={() => handleDownload(fmt)}
                                    disabled={downloading === fmt.itag}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group disabled:opacity-60"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${qualityColor(fmt.qualityLabel)}`}>
                                            {fmt.qualityLabel}
                                        </span>
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                            {fmt.container?.toUpperCase() || 'MP4'}
                                            {fmt.fps && fmt.fps > 30 ? ` · ${fmt.fps}fps` : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {fmt.filesize && (
                                            <span className="text-xs text-zinc-400">{fmt.filesize}</span>
                                        )}
                                        {downloading === fmt.itag ? (
                                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                                        ) : (
                                            <Download size={16} className="text-zinc-400 group-hover:text-indigo-600 transition" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-5">
                    <p className="text-[11px] text-zinc-400 text-center">
                        Downloads are processed via EzyEduTube's server. No external platform is opened.
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   VideoCard
───────────────────────────────────────────── */
const VideoCard = ({ video }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const menuRef = useRef(null);

    // Close dot-menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const handleCopyLink = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/resource/${video._id}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
        setMenuOpen(false);
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({ title: video.title, url: `${window.location.origin}/resource/${video._id}` });
        } else {
            handleCopyLink(e);
        }
        setMenuOpen(false);
    };

    const handleMenuToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpen(prev => !prev);
    };

    const openDownload = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpen(false);
        setShowDownloadModal(true);
    };

    const menuItems = [
        { icon: Download, label: 'Download', action: openDownload },
        { icon: Share2, label: 'Share', action: handleShare },
        { icon: copied ? CheckCircle : Link2, label: copied ? 'Copied!' : 'Copy Link', action: handleCopyLink },
        { icon: Flag, label: 'Report', action: (e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); alert('Thanks for your report. We will review this content.'); } },
    ];

    return (
        <>
            {/* Download Quality Modal */}
            {showDownloadModal && (
                <DownloadModal video={video} onClose={() => setShowDownloadModal(false)} />
            )}

            <div className="group flex flex-col gap-3">
                {/* Thumbnail */}
                <Link to={`/resource/${video._id}`} className="block">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                        <img
                            src={video.thumbnailUrl || '/api/placeholder/400/225'}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                        {formatDuration(video.duration) && (
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs font-medium text-white">
                                {formatDuration(video.duration)}
                            </div>
                        )}
                    </div>
                </Link>

                {/* Info Row */}
                <div className="flex gap-3 items-start">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {video.uploader?.avatar ? (
                            <img src={video.uploader.avatar} alt={video.uploader.username} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {video.uploader?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>

                    {/* Title & Meta */}
                    <Link to={`/resource/${video._id}`} className="flex-1 min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
                            {video.title}
                        </h3>
                        <div className="text-zinc-500 text-sm mt-1">{video.uploader?.username || 'Unknown User'}</div>
                        <div className="text-zinc-500 text-sm flex items-center gap-1">
                            <span>{video.views || 0} views</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                        </div>
                    </Link>

                    {/* Three-dot Menu */}
                    <div className="relative flex-shrink-0" ref={menuRef}>
                        <button
                            onClick={handleMenuToggle}
                            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                            title="More options"
                        >
                            <MoreVertical size={18} className="text-zinc-500 dark:text-zinc-400" />
                        </button>

                        {menuOpen && (
                            <div
                                className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden"
                                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                            >
                                {menuItems.map(({ icon: Icon, label, action }) => (
                                    <button
                                        key={label}
                                        onClick={action}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
                                    >
                                        <Icon size={15} className="text-zinc-500 dark:text-zinc-400" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoCard;
