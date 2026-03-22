import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home, History, Download, Settings, Video, User,
    BookOpen, ChevronLeft, ChevronRight, LogOut, X,
    Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoutModal from './LogoutModal';

const Sidebar = ({ isOpen, toggleSidebar, collapsed, toggleCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutRequest = () => setShowLogoutModal(true);
    const handleLogoutConfirm = () => { logout(); setShowLogoutModal(false); };
    const handleLogoutCancel = () => setShowLogoutModal(false);

    const mainNav = [
        { icon: Home, label: 'Home', path: '/', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { icon: History, label: 'History', path: '/history', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        { icon: Download, label: 'Downloads', path: '/downloads', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    ];

    const userNav = user ? [
        { icon: Video, label: 'Your Videos', path: '/your-videos', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
        { icon: User, label: 'You', path: '/profile', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
        { icon: Settings, label: 'Settings', path: '/settings', color: 'text-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-800' },
    ] : [
        { icon: Settings, label: 'Settings', path: '/settings', color: 'text-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-800' },
    ];

    const NavItem = ({ icon: Icon, label, path, color, bg }) => (
        <NavLink
            to={path}
            end={path === '/'}
            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
            className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all group relative
                ${isActive
                    ? `${bg} ${color} font-semibold shadow-sm`
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all
                        ${isActive ? `${bg}` : 'group-hover:bg-zinc-200/60 dark:group-hover:bg-zinc-700/60'}`}>
                        <Icon size={18} className={`${isActive ? `${color} sidebar-active-icon` : ''} transition-all`} />
                    </div>
                    {!collapsed && <span className="text-sm">{label}</span>}
                    {/* Active dot */}
                    {isActive && !collapsed && (
                        <span className={`ml-auto w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
                    )}
                    {/* Tooltip when collapsed */}
                    {collapsed && (
                        <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
                            {label}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );

    return (
        <>
            {/* Logout confirmation modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
            />

            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={toggleSidebar} />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full
                bg-white dark:bg-zinc-950
                border-r border-zinc-100 dark:border-zinc-800/80
                transition-all duration-300 z-50 flex flex-col shadow-xl
                ${collapsed ? 'w-[60px]' : 'w-60'}
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>

                {/* Header */}
                <div className={`flex items-center h-16 border-b border-zinc-100 dark:border-zinc-800 px-3 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                    {!collapsed && (
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-md shadow-red-200 dark:shadow-red-900/30">
                                <BookOpen size={16} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="font-extrabold text-base bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                                    EzyEduTube
                                </span>
                                <p className="text-[9px] text-zinc-400 -mt-0.5 tracking-widest uppercase">Learn Anything</p>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-md">
                            <BookOpen size={16} className="text-white" strokeWidth={2.5} />
                        </div>
                    )}
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                        <X size={18} className="text-zinc-500" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 mt-2 scrollbar-none">

                    {/* Discover section */}
                    {!collapsed && <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">Discover</p>}
                    {mainNav.map(item => <NavItem key={item.path} {...item} />)}

                    {/* Trending link */}
                    <NavLink to="/?sort=trending"
                        className="flex items-center gap-3 px-2 py-2.5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 transition-all group relative">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-all flex-shrink-0">
                            <Flame size={18} />
                        </div>
                        {!collapsed && <span className="text-sm">Trending</span>}
                        {collapsed && <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">Trending</span>}
                    </NavLink>

                    {user && (
                        <>
                            <div className="my-3 border-t border-zinc-100 dark:border-zinc-800" />
                            {!collapsed && <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">My Account</p>}
                            {userNav.map(item => <NavItem key={item.path} {...item} />)}
                        </>
                    )}
                    {!user && (
                        <>
                            <div className="my-3 border-t border-zinc-100 dark:border-zinc-800" />
                            <NavItem icon={Settings} label="Settings" path="/settings" color="text-zinc-500" bg="bg-zinc-50 dark:bg-zinc-800" />
                        </>
                    )}
                </div>

                {/* Bottom user card */}
                {user && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 flex-shrink-0">
                        {!collapsed ? (
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 border border-violet-100 dark:border-violet-800/40">
                                {/* Clickable profile area */}
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-80 transition"
                                    title="Go to Profile"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                                        {user.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user.username}</p>
                                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                                    </div>
                                </button>
                                {/* Logout button → opens modal */}
                                <button onClick={handleLogoutRequest} title="Logout"
                                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition flex-shrink-0">
                                    <LogOut size={15} />
                                </button>
                            </div>
                        ) : (
                            /* Collapsed: icon opens modal */
                            <button onClick={handleLogoutRequest} title="Logout"
                                className="w-full flex justify-center p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition">
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* Collapse toggle */}
                <button onClick={toggleCollapsed}
                    className="hidden md:flex absolute -right-3 top-[72px] w-6 h-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all z-10">
                    {collapsed ? <ChevronRight size={12} className="text-zinc-500" /> : <ChevronLeft size={12} className="text-zinc-500" />}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
