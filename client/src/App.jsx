import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';

import UserStores from './pages/user/UserStores';
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Home redirect helper
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/user/stores" replace />;
}

export default function App() {
  return (
    <div className="app-container">
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated common route */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Administrator Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminStores />
            </ProtectedRoute>
          }
        />

        {/* Normal User Routes */}
        <Route
          path="/user/stores"
          element={
            <ProtectedRoute allowedRoles={['NORMAL_USER']}>
              <UserStores />
            </ProtectedRoute>
          }
        />

        {/* Store Owner Routes */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STORE_OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route
          path="*"
          element={
            <div className="main-content" style={{ textAlign: 'center', padding: '80px 20px' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>404</h1>
              <p style={{ color: '#64748b', margin: '8px 0 24px' }}>
                The page you are looking for does not exist.
              </p>
              <RootRedirect />
            </div>
          }
        />
      </Routes>
    </div>
  );
}
