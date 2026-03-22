import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import ResourceDetail from './pages/ResourceDetail';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resource/:id" element={<ResourceDetail />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
