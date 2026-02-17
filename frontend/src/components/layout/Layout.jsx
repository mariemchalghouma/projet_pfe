import { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            {/* Main content area - adjust margin based on sidebar state via CSS */}
            <div className="flex-1 ml-[220px] transition-all duration-300" id="main-content">
                {children}
            </div>
        </div>
    );
};

export default Layout;
