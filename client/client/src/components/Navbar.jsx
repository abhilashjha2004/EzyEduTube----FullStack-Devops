import React, { useState } from 'react';
import { Search, Upload, User, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/?search=${search}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed-header">
            <div className="flex h-16 items-center px-4">
                <div className="mr-4 flex items-center gap-4">
                    <button onClick={toggleSidebar} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full md:hidden">
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="flex items-center space-x-2">
                        <motion.span
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            className="font-bold sm:inline-block text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer"
                        >
                            EDU-HUB
                        </motion.span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                placeholder="Search resources..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 md:w-[300px] lg:w-[400px]"
                            />
                        </div>
                    </div>
                    <nav className="flex items-center space-x-2">
                        {user ? (
                            <>
                                <Link to="/upload">
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                    </motion.button>
                                </Link>
                                <Link to="/profile">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 w-9">
                                        <User className="h-4 w-4" />
                                    </motion.button>
                                </Link>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={logout} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-destructive hover:text-destructive-foreground h-9 w-9" title="Logout">
                                    <LogOut className="h-4 w-4" />
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                        Login
                                    </motion.button>
                                </Link>
                                <Link to="/register">
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow">
                                        Sign Up
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </nav>
    );
};


export default Navbar;
