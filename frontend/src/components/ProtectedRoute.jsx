import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireOnboarding = true }) => {
    const { token, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Verifying session...</p>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If route requires onboarding but user is not onboarded -> redirect to onboarding
    if (requireOnboarding && user && !user.isOnboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    // If route is for onboarding but user IS already onboarded -> redirect to dashboard
    if (!requireOnboarding && user && user.isOnboarded) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

