import React, { useState, useEffect } from 'react';
import { Download as DlIcon, Trash2, Film, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Downloads = () => {
    const [downloads, setDownloads] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('ezyedutube_downloads') || '[]');
        setDownloads(stored);
    }, []);

    const removeItem = (id, dt) => {
        const updated = downloads.filter(d => !(d.id === id && d.downloadedAt === dt));
        localStorage.setItem('ezyedutube_downloads', JSON.stringify(updated));
        setDownloads(updated);
    };

    const clearAll = () => { localStorage.removeItem('ezyedutube_downloads'); setDownloads([]); };

    const qualityBadge = (label = '') => {
        const p = parseInt(label);
        if (p >= 1080) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
        if (p >= 720) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        if (p >= 480) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    };

    return (
        <div className="max-w-3xl mx-auto page-enter space-y-6">

            {/* Header card */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-cyan-200 dark:shadow-cyan-900/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <DlIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold">Downloads</h1>
                            <p className="text-cyan-100 text-sm">{downloads.length} download{downloads.length !== 1 ? 's' : ''} saved</p>
                        </div>
                    </div>
                    {downloads.length > 0 && (
                        <button onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-semibold transition backdrop-blur-sm border border-white/20">
                            <Trash2 size={14} /> Clear All
                        </button>
                    )}
                </div>

                {/* Stats row */}
                {downloads.length > 0 && (
                    <div className="flex gap-4 mt-5 pt-4 border-t border-white/20">
                        {['1080p', '720p', '480p'].map(q => {
                            const count = downloads.filter(d => d.quality === q).length;
                            return count > 0 ? (
                                <div key={q} className="text-center">
                                    <p className="text-xl font-extrabold">{count}</p>
                                    <p className="text-xs text-white/70">{q}</p>
                                </div>
                            ) : null;
                        })}
                    </div>
                )}
            </div>

            {/* List */}
            {downloads.length === 0 ? (
                <div className="text-center py-24 space-y-4">
                    <div className="text-7xl">📥</div>
                    <h2 className="text-xl font-bold text-zinc-500">No downloads yet</h2>
                    <p className="text-zinc-400 text-sm">Use the ⋮ menu on any video to download it at your preferred quality.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {downloads.map((item, i) => (
                        <div key={`${item.id}-${item.downloadedAt}`}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:shadow-lg hover:border-cyan-200 dark:hover:border-cyan-800 transition-all group card-hover">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md flex-shrink-0">
                                <Film size={20} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-zinc-900 dark:text-white truncate">{item.title || 'Unknown Video'}</p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {item.quality && (
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${qualityBadge(item.quality)}`}>
                                            {item.quality}
                                        </span>
                                    )}
                                    {item.container && (
                                        <span className="text-xs text-zinc-400 font-medium uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                            {item.container}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                                        <Clock size={11} />
                                        {formatDistanceToNow(new Date(item.downloadedAt), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <CheckCircle2 size={18} className="text-emerald-500" />
                                <button onClick={() => removeItem(item.id, item.downloadedAt)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-300 hover:text-red-500 transition">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Downloads;
