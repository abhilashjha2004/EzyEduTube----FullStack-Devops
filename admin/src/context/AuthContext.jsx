import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const AuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedAdmin = localStorage.getItem('admin_user');
        if (storedAdmin) {
            try { setAdminUser(JSON.parse(storedAdmin)); } catch { }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await axios.post(`${API}/api/auth/login`, { username, password });
        if (res.data.user.role !== 'admin') {
            throw new Error('Access Denied. You are not an administrator.');
        }
        setAdminUser(res.data.user);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
        localStorage.setItem('admin_token', res.data.token);
    };

    const logout = () => {
        setAdminUser(null);
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
    };

    return (
        <AuthContext.Provider value={{ adminUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
