import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, Users, Sparkles, ArrowRight, X } from 'lucide-react';

const FEATURES = [
    { icon: <Play size={20} className="text-orange-400" />, title: 'Watch & Learn', desc: 'Thousands of free educational videos' },
    { icon: <Users size={20} className="text-violet-400" />, title: 'Community', desc: 'Like, subscribe, comment & share' },
    { icon: <Sparkles size={20} className="text-blue-400" />, title: 'Upload Content', desc: 'Share your own knowledge with the world' },
];

const Welcome = () => {
    const navigate = useNavigate();

    const goHome = () => {
        localStorage.setItem('ezyedutube_visited', '1');
        navigate('/');
    };

    const goRegister = () => {
        localStorage.setItem('ezyedutube_visited', '1');
        navigate('/register');
    };

    const goLogin = () => {
        localStorage.setItem('ezyedutube_visited', '1');
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">

            {/* Blurred bg blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/20 blur-3xl" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-700/20 blur-3xl" />
                <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-3xl" />
            </div>

            {/* Skip button */}
            <button
                onClick={goHome}
                className="absolute top-6 right-6 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-full border border-zinc-700 hover:border-zinc-500 backdrop-blur-sm"
            >
                <X size={14} /> Skip for now
            </button>

            {/* Main card */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-lg mx-4"
            >
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30">
                            <BookOpen size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">EzyEduTube</h1>
                            <p className="text-xs text-orange-400 font-semibold tracking-widest uppercase">Learn Without Limits</p>
                        </div>
                    </motion.div>
                </div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Your free education platform 🎓
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Browse thousands of educational videos completely free.
                        Create an account to like, subscribe, upload your own content and more.
                    </p>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col gap-2.5 mb-8"
                >
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55 + i * 0.1 }}
                            className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">{f.icon}</div>
                            <div>
                                <p className="text-sm font-semibold text-white">{f.title}</p>
                                <p className="text-xs text-zinc-400">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                >
                    <button
                        onClick={goRegister}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 transition shadow-xl shadow-orange-500/25 text-base"
                    >
                        Get Started — It's Free <ArrowRight size={18} />
                    </button>

                    <button
                        onClick={goLogin}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white transition text-sm backdrop-blur-sm"
                    >
                        Already have an account? <span className="text-orange-400 font-bold">Sign in</span>
                    </button>

                    <button
                        onClick={goHome}
                        className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition py-1"
                    >
                        Continue browsing without an account →
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Welcome;
