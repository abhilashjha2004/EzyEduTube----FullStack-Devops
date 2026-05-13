import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, BookOpen, MessageSquare, Video, Star, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── icon + colour per notification type ───────────────────────
const TYPE_META = {
    new_video: { Icon: Video, colour: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    comment: { Icon: MessageSquare, colour: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    like: { Icon: Star, colour: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    welcome: { Icon: BookOpen, colour: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    system: { Icon: Wifi, colour: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
};

// ─── Pretty relative time ──────────────────────────────────────
function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

const NotificationPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    // ── Fetch ──────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/${user._id}`);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial load + polling every 60 s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // ── Toggle panel ──────────────────────────────────────────
    const handleToggle = () => {
        setOpen(prev => !prev);
        if (!open) fetchNotifications(); // refresh on open
    };

    // ── Mark all read ─────────────────────────────────────────
    const markAllRead = async () => {
        if (!user?._id || unreadCount === 0) return;
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/notifications/${user._id}/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    // ── Click a single notification ───────────────────────────
    const handleClick = async (notif) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/notifications/single/${notif._id}/read`);
        } catch { /* silent */ }
        setNotifications(prev =>
            prev.map(n => n._id === notif._id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - (notif.read ? 0 : 1)));
        if (notif.link) { setOpen(false); navigate(notif.link); }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={panelRef}>
            {/* ── Bell Button ─────────────────────────────── */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggle}
                className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-violet-50 dark:hover:bg-violet-900/20 transition relative"
                title="Notifications"
            >
                <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -15, 15, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Bell className="h-4 w-4 text-violet-500" />
                </motion.div>
                {/* Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center"
                        >
                            <span className="text-white text-[9px] font-bold leading-none px-0.5">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* ── Dropdown Panel ──────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute right-0 top-12 w-80 sm:w-96 z-[9000]
                                   bg-white dark:bg-zinc-900
                                   border border-zinc-200 dark:border-zinc-700
                                   rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-violet-500" />
                                <span className="font-bold text-sm text-zinc-900 dark:text-white">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="text-xs font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={markAllRead}
                                        className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition px-2 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={12} />
                                        <span>Mark all read</span>
                                    </motion.button>
                                )}
                                <button onClick={() => setOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition">
                                    <X size={14} className="text-zinc-400" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                            {loading && notifications.length === 0 ? (
                                <div className="py-12 flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-500 rounded-full animate-spin" />
                                    <p className="text-xs text-zinc-400">Loading notifications…</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-14 flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                        <Bell className="h-7 w-7 text-violet-300" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">All caught up!</p>
                                        <p className="text-xs text-zinc-400 mt-0.5">No notifications yet</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                                    {notifications.map((notif, i) => {
                                        const meta = TYPE_META[notif.type] || TYPE_META.system;
                                        const { Icon } = meta;
                                        return (
                                            <motion.button
                                                key={notif._id}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                onClick={() => handleClick(notif)}
                                                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60
                                                    ${!notif.read ? 'bg-violet-50/40 dark:bg-violet-900/10' : ''}`}
                                            >
                                                {/* Icon bubble */}
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                                                    <Icon size={17} className={meta.colour} />
                                                </div>

                                                {/* Text */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {notif.message && (
                                                        <p className="text-xs text-zinc-400 mt-0.5 truncate">{notif.message}</p>
                                                    )}
                                                    <p className="text-[10px] text-zinc-300 dark:text-zinc-500 mt-1">{timeAgo(notif.createdAt)}</p>
                                                </div>

                                                {/* Unread dot */}
                                                {!notif.read && (
                                                    <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 text-center">
                                <span className="text-xs text-zinc-400">Showing latest {notifications.length} notifications</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationPanel;
