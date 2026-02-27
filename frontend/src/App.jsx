import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import Clients from './pages/Clients';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';

import './App.css';

const AppContent = () => {
  return (
    <Routes>
      {/* 🟢 Public Routes (No Layout or PublicLayout) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* 🟠 Onboarding Route (AuthLayout - Isolated, No Sidebar) */}
      <Route element={<ProtectedRoute requireOnboarding={false} />} >
        <Route element={<AuthLayout />}>
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>
      </Route>

      {/* 🔴 Private App Routes (AppLayout - Sidebar + Protected) */}
      <Route element={<ProtectedRoute requireOnboarding={true} />} >
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetails />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

