import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AppLayout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-container">
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
