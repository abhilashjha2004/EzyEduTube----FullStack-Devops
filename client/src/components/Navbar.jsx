import React, { useState, useEffect } from 'react';
import { Search, Upload, Sun, Moon, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

const Navbar = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [focused, setFocused] = useState(false);
    const [darkMode, setDarkMode] = useState(() =>
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
        else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    }, [darkMode]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg shadow-sm">
            <div className="flex h-16 items-center px-4 gap-3">

                {/* Hamburger */}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-orange-50 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-500 hover:text-orange-500">
                    <Menu size={22} />
                </motion.button>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md shadow-red-200 dark:shadow-red-900/40">
                            <span className="text-white font-black text-sm">E</span>
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-extrabold text-base bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                                EzyEduTube
                            </span>
                            <p className="text-[9px] text-zinc-400 -mt-0.5 tracking-widest uppercase leading-none">Learn Anything</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Search */}
                <div className="flex-1 max-w-2xl mx-auto">
                    <div className={`relative transition-all duration-200 ${focused ? 'scale-[1.01]' : ''}`}>
                        <Search className={`absolute left-3.5 top-2.5 h-4 w-4 transition-colors ${focused ? 'text-orange-500' : 'text-zinc-400'}`} />
                        <input
                            placeholder="Search resources, topics, educators..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            className={`w-full h-10 rounded-full pl-10 pr-4 text-sm transition-all outline-none
                                bg-zinc-100 dark:bg-zinc-800 border-2
                                ${focused
                                    ? 'border-orange-400 dark:border-orange-500 bg-white dark:bg-zinc-900 shadow-md shadow-orange-100 dark:shadow-orange-900/20'
                                    : 'border-transparent hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
                                }
                                placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100`}
                        />
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1 ml-auto flex-shrink-0">

                    {/* Dark mode */}
                    <motion.button whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setDarkMode(p => !p)}
                        className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                        title={darkMode ? 'Light mode' : 'Dark mode'}>
                        {darkMode
                            ? <Sun className="h-4 w-4 text-yellow-400" />
                            : <Moon className="h-4 w-4 text-indigo-500" />}
                    </motion.button>

                    {user ? (
                        <div className="flex items-center">
                            {user.role === 'admin' && (
                                <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="hidden sm:block mr-2 px-3 py-1.5 rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold shadow-md hover:bg-zinc-700 dark:hover:bg-zinc-300 transition">
                                        Admin Panel
                                    </motion.button>
                                </a>
                            )}
                            {/* Notifications */}
                            <NotificationPanel />
                            <Link to="/upload">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-400 text-white text-sm font-bold transition shadow-md shadow-red-200 dark:shadow-red-900/30 hover:opacity-90 ml-1">
                                    <Upload size={14} />
                                    Upload
                                </motion.button>
                            </Link>

                            {/* Avatar */}
                            <Link to="/profile">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-md ml-1"
                                    title="Profile">
                                    {user.username?.[0]?.toUpperCase()}
                                </motion.div>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 ml-1">
                            <Link to="/login">
                                <button className="px-4 py-1.5 rounded-full text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-700 hover:border-orange-400 hover:text-orange-500 transition text-zinc-600 dark:text-zinc-300">
                                    Login
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-red-500 to-orange-400 text-white hover:opacity-90 transition shadow-md">
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
