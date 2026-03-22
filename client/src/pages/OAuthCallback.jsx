import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * /auth/callback  — landing page after Google OAuth
 * Reads ?user=<encoded JSON> set by the server redirect,
 * stores it in auth context + localStorage, then sends user to home.
 */
const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const { loginWithData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const raw = searchParams.get('user');
        const errParam = searchParams.get('error');

        if (errParam) {
            navigate('/login?error=google_failed');
            return;
        }

        if (raw) {
            try {
                const userData = JSON.parse(decodeURIComponent(raw));
                loginWithData(userData);
                localStorage.setItem('ezyedutube_visited', '1');
                navigate('/');
            } catch {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, []);

    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-zinc-400">Signing you in with Google…</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
