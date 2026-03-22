import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Play, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LogoutModal from '../components/LogoutModal';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [myResources, setMyResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchMyResources = async () => {
            // In prod: GET /api/user/:id/resources
            // Rapid prototype: Fetch all and filter
            try {
                const res = await axios.get('http://localhost:5000/api/resources');
                const mine = res.data.filter(r => r.uploader === user.username);
                setMyResources(mine);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyResources();
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto">
            <LogoutModal
                isOpen={showLogoutModal}
                onConfirm={() => { logout(); setShowLogoutModal(false); }}
                onCancel={() => setShowLogoutModal(false)}
            />
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 mb-12 p-6 border rounded-xl bg-card shadow-sm relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-background shadow-lg">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold">{user.username}</h1>
                    <p className="text-muted-foreground">Member since {new Date().getFullYear()}</p>
                    <p className="mt-4 text-sm max-w-lg mx-auto md:mx-0">
                        {user.bio || "Welcome to my education profile. Check out my contributions below."}
                    </p>
                </div>
                <div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowLogoutModal(true)} className="px-4 py-2 border rounded-md hover:bg-destructive hover:text-white transition-colors text-sm font-medium">Logout</motion.button>
                </div>
            </motion.div>

            <div className="">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                    My Contributions <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">{myResources.length}</span>
                </h2>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : myResources.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">You haven't uploaded any educational resources yet.</p>
                        <Link to="/upload" className="text-primary font-medium hover:underline">Share your knowledge now</Link>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {myResources.map((res, index) => (
                            <motion.div
                                key={res._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative border rounded-lg overflow-hidden bg-card transition-shadow hover:shadow-lg"
                            >
                                <Link to={`/resource/${res._id}`}>
                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                        <img
                                            src={res.thumbnail || 'https://via.placeholder.com/300x200'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            alt=""
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="text-white fill-white h-10 w-10 drop-shadow-lg" />
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded capitalize font-medium">{res.type}</div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{res.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Uploaded {new Date(res.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Profile;
