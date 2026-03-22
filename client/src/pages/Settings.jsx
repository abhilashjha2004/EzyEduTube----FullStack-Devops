import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Trash2, Bell, Play, Shield, CheckCircle, Palette, Zap } from 'lucide-react';

const Settings = () => {
    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
    const [notifications, setNotifications] = useState(() => localStorage.getItem('ezyedutube_notif') !== 'false');
    const [autoplay, setAutoplay] = useState(() => localStorage.getItem('ezyedutube_autoplay') !== 'false');
    const [saved, setSaved] = useState(false);

    const applyDark = (val) => {
        setDarkMode(val);
        if (val) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
        else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    };

    const saveSettings = () => {
        localStorage.setItem('ezyedutube_notif', notifications);
        localStorage.setItem('ezyedutube_autoplay', autoplay);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const clearData = (key, label) => {
        if (window.confirm(`Clear your ${label}?`)) localStorage.removeItem(key);
    };

    const Toggle = ({ label, desc, value, onChange, color = 'bg-indigo-600' }) => (
        <div className="flex items-center justify-between py-1">
            <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</p>
                {desc && <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${value ? color : 'bg-zinc-200 dark:bg-zinc-700'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${value ? 'translate-x-6' : ''}`} />
            </button>
        </div>
    );

    const Section = ({ title, icon: Icon, gradient, children }) => (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className={`flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r ${gradient}`}>
                <Icon size={18} className="text-white" />
                <h2 className="font-bold text-white">{title}</h2>
            </div>
            <div className="px-5 py-4 space-y-4">{children}</div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-5 page-enter">

            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-700 to-zinc-900 dark:from-zinc-800 dark:to-zinc-950 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <SettingsIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold">Settings</h1>
                        <p className="text-zinc-400 text-sm">Customize your EzyEduTube experience</p>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <Section title="Appearance" icon={Palette} gradient="from-violet-600 to-purple-700">
                <Toggle label="Dark Mode" desc="Switch between light and dark theme" value={darkMode} onChange={applyDark} color="bg-violet-600" />
            </Section>

            {/* Playback */}
            <Section title="Playback" icon={Play} gradient="from-orange-500 to-red-500">
                <Toggle label="Autoplay" desc="Automatically play the next recommended video" value={autoplay} onChange={setAutoplay} color="bg-orange-500" />
            </Section>

            {/* Notifications */}
            <Section title="Notifications" icon={Bell} gradient="from-cyan-500 to-blue-600">
                <Toggle label="Activity Notifications" desc="Get notified about comments and new uploads" value={notifications} onChange={setNotifications} color="bg-cyan-600" />
            </Section>

            {/* Privacy */}
            <Section title="Privacy & Data" icon={Shield} gradient="from-emerald-500 to-teal-600">
                {[{ key: 'ezyedutube_history', label: 'Watch History' }, { key: 'ezyedutube_downloads', label: 'Download History' }].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-1">
                        <div>
                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Remove all saved {label.toLowerCase()} data</p>
                        </div>
                        <button onClick={() => clearData(key, label)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/60 transition">
                            <Trash2 size={13} /> Clear
                        </button>
                    </div>
                ))}
            </Section>

            {/* Save button */}
            <button onClick={saveSettings}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg
                    ${saved
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200 dark:shadow-emerald-900/30'
                        : 'bg-gradient-to-r from-red-500 to-orange-400 text-white hover:opacity-90 shadow-red-200 dark:shadow-red-900/30'
                    }`}>
                {saved ? <><CheckCircle size={16} /> Settings Saved!</> : <><Zap size={16} /> Save Settings</>}
            </button>
        </div>
    );
};

export default Settings;
