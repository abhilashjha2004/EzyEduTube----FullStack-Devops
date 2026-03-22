import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Video, Upload, Settings, Menu, X, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Video, label: 'My Learning', path: '/library' },
        ...(user ? [{ icon: Upload, label: 'Upload', path: '/upload' }] : []),
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 z-50 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 font-bold text-xl text-red-600">
                        <BookOpen size={28} />
                        <span>EDU-HUB</span>
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                        <X size={20} className="text-zinc-600 dark:text-zinc-300" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    {user && (
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left mt-8"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    )}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
