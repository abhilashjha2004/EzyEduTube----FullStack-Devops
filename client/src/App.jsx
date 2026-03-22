import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import ResourceDetail from './pages/ResourceDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';
import YourVideos from './pages/YourVideos';
import Welcome from './pages/Welcome';
import OAuthCallback from './pages/OAuthCallback';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Show welcome splash only to first-time visitors (no localStorage flag)
const WelcomeGate = ({ children }) => {
  const location = useLocation();
  const visited = localStorage.getItem('ezyedutube_visited');
  const isAuthRoute = ['/', '/login', '/register', '/auth/callback'].includes(location.pathname);

  if (!visited && isAuthRoute && location.pathname === '/') {
    return <Welcome />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <WelcomeGate>
          <Layout>
            <Routes>
              {/* Public routes — no auth required */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/resource/:id" element={<ResourceDetail />} />
              <Route path="/history" element={<History />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />

              {/* Slightly protected — still render but show login prompt inside */}
              <Route path="/upload" element={<Upload />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/your-videos" element={<YourVideos />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </WelcomeGate>
      </Router>
    </AuthProvider>
  );
}

export default App;
