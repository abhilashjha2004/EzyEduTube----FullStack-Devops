import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const sidebarWidth = collapsed ? 'md:ml-16' : 'md:ml-60';

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar toggleSidebar={() => setSidebarOpen(p => !p)} />
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(p => !p)}
                collapsed={collapsed}
                toggleCollapsed={() => setCollapsed(p => !p)}
            />
            <main className={`transition-all duration-300 pt-16 ${sidebarWidth}`}>
                <div className="container mx-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
