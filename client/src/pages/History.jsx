import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, Clock, PlayCircle, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const History = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('ezyedutube_history') || '[]');
        setHistory(stored);
    }, []);

    const clearHistory = () => { localStorage.removeItem('ezyedutube_history'); setHistory([]); };
    const removeItem = (id) => {
        const updated = history.filter(h => h.id !== id);
        localStorage.setItem('ezyedutube_history', JSON.stringify(updated));
        setHistory(updated);
    };

    return (
        <div className="max-w-3xl mx-auto page-enter space-y-6">

            {/* Header card */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-violet-200 dark:shadow-violet-900/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <HistoryIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold">Watch History</h1>
                            <p className="text-violet-100 text-sm">{history.length} video{history.length !== 1 ? 's' : ''} watched</p>
                        </div>
                    </div>
                    {history.length > 0 && (
                        <button onClick={clearHistory}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-semibold transition backdrop-blur-sm border border-white/20">
                            <Trash2 size={14} /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            {history.length === 0 ? (
                <div className="text-center py-24 space-y-4">
                    <div className="text-7xl">📺</div>
                    <h2 className="text-xl font-bold text-zinc-500">No watch history yet</h2>
                    <p className="text-zinc-400 text-sm">Videos you watch will appear here automatically.</p>
                    <Link to="/" className="inline-block mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold hover:opacity-90 transition shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                        Browse Videos
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item, i) => (
                        <div key={item.id}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all group card-hover">
                            {/* Number badge */}
                            <div className="flex-shrink-0 w-6 text-center text-xs font-bold text-zinc-300 dark:text-zinc-600">
                                {i + 1}
                            </div>
                            {/* Thumbnail */}
                            <Link to={`/resource/${item.id}`} className="flex-shrink-0">
                                <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                                    {item.thumbnail
                                        ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        : <div className="w-full h-full flex items-center justify-center"><PlayCircle size={24} className="text-zinc-400" /></div>
                                    }
                                </div>
                            </Link>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <Link to={`/resource/${item.id}`}>
                                    <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-2 group-hover:text-violet-600 transition-colors">{item.title}</h3>
                                </Link>
                                <p className="text-sm text-zinc-500 mt-1">{item.uploader || 'Unknown'}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                                    <Clock size={11} />
                                    <span>Watched {formatDistanceToNow(new Date(item.watchedAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                            {/* Remove */}
                            <button onClick={() => removeItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-300 hover:text-red-500 transition flex-shrink-0">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
