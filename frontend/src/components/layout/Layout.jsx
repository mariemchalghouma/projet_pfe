import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar, { SidebarContext } from './Sidebar';
import MapView from '../map/MapView';

const Layout = ({ children, withMap = true }) => {
    // Sidebar collapsed state (shared with Sidebar via context)
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleCollapsed = useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    // Resizable panel width
    const [contentWidth, setContentWidth] = useState(480);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(480);

    const handleMouseDown = useCallback((e) => {
        isDragging.current = true;
        startX.current = e.clientX;
        startWidth.current = contentWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [contentWidth]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            const delta = e.clientX - startX.current;
            const newWidth = Math.min(Math.max(startWidth.current + delta, 320), 800);
            setContentWidth(newWidth);
        };
        const handleMouseUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed }}>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <Sidebar />

                {/* Main content area: sidebar offset + page content (+ optional divider + map) */}
                <div
                    className={`flex flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[68px]' : 'ml-[220px]'}`}
                    id="main-content"
                >
                    {withMap ? (
                        <>
                            {/* Page content panel */}
                            <div
                                className="flex-shrink-0 overflow-y-auto bg-white border-r border-gray-200"
                                style={{ width: contentWidth }}
                            >
                                {children}
                            </div>

                            {/* Drag divider */}
                            <div
                                onMouseDown={handleMouseDown}
                                className="w-1.5 bg-gray-200 hover:bg-orange-400 cursor-col-resize transition-colors flex-shrink-0 relative group z-10"
                                title="Glisser pour redimensionner"
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-gray-400 group-hover:bg-orange-500 transition-colors"></div>
                            </div>

                            {/* Map panel — default layout map */}
                            <div className="flex-1 min-w-[300px]">
                                <MapView />
                            </div>
                        </>
                    ) : (
                        // Full-width content panel (no global map on the right)
                        <div className="flex-1 overflow-y-auto bg-white border-l border-gray-200">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

export default Layout;
