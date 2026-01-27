import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <main className={`transition-all duration-300 pt-16 md:ml-64`}>
                <div className="container mx-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
