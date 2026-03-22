import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Eye, EyeOff, User, Lock, ArrowRight, Check } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const PERKS = [
    'Like & save your favourite videos',
    'Subscribe to educators',
    'Upload your own content',
    'Comment & join discussions',
];

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await register(username, password);
            localStorage.setItem('ezyedutube_visited', '1');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Username may already be taken.');
        } finally { setLoading(false); }
    };

    const handleGoogle = () => {
        localStorage.setItem('ezyedutube_visited', '1');
        window.location.href = `${API}/api/auth/google`;
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-8">

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-7">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow">
                            <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="font-black text-zinc-900 dark:text-white text-lg leading-none">EzyEduTube</p>
                            <p className="text-xs text-zinc-400">Free forever</p>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Create your account</h1>
                    <p className="text-sm text-zinc-500 mb-5">
                        Already have an account?{' '}
                        <Link to="/login" className="text-orange-500 font-semibold hover:underline">Sign in</Link>
                    </p>

                    {/* Perks */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
                        {PERKS.map(p => (
                            <div key={p} className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                                <Check size={12} className="text-green-500 flex-shrink-0" /> {p}
                            </div>
                        ))}
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-sm hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition shadow-sm mb-5"
                    >
                        <GoogleIcon /> Sign up with Google
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                        <span className="text-xs text-zinc-400 font-medium">or create username</span>
                        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                    </div>

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                <input type="text" placeholder="choose_a_username"
                                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                    value={username} onChange={e => setUsername(e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                <input type={showPass ? 'text' : 'password'} placeholder="min. 6 characters"
                                    className="w-full pl-9 pr-10 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                    value={password} onChange={e => setPassword(e.target.value)} required />
                                <button type="button" onClick={() => setShowPass(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {password.length > 0 && (
                                <div className="mt-2 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${password.length < 6 ? 'w-1/4 bg-red-400' :
                                            password.length < 10 ? 'w-1/2 bg-yellow-400' :
                                                'w-full bg-green-400'
                                        }`} />
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 shadow-lg shadow-orange-500/20 transition disabled:opacity-60 text-sm"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><ArrowRight size={16} /> Create Free Account</>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-zinc-400 mt-6">
                        <Link to="/" className="hover:text-orange-400 transition">← Browse without registering</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
