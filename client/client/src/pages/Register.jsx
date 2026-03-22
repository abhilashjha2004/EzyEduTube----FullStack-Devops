import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, password);
            navigate('/');
        } catch (err) {
            alert('Registration failed: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm bg-card">
            <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={username} onChange={e => setUsername(e.target.value)} required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={password} onChange={e => setPassword(e.target.value)} required
                    />
                </div>
                <button type="submit" className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2">
                    Create Account
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
        </div>
    );
};

export default Register;
