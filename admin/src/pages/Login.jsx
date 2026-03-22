import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, adminUser } = useAuth();
    const navigate = useNavigate();

    // Already logged in
    if (adminUser) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <ShieldAlert size={48} className="mx-auto text-red-500" />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-400">
                    Sign in with administrator credentials
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-zinc-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-zinc-300">Username</label>
                            <div className="mt-1">
                                <input name="username" type="text" required
                                    value={username} onChange={e => setUsername(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-zinc-700 bg-zinc-800 rounded-xl shadow-sm placeholder-zinc-500 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300">Password</label>
                            <div className="mt-1">
                                <input name="password" type="password" required
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-zinc-700 bg-zinc-800 rounded-xl shadow-sm placeholder-zinc-500 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none transition disabled:opacity-50">
                            {loading ? 'Authenticating...' : 'Secure Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
