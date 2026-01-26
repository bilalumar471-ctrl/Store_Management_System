//app.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProductList from './pages/ProductList';
import GenerateBill from './components/user/GenerateBill';
import SalesReport from './components/admin/SalesReport';
import ProfitReport from './components/admin/ProfitReport';
import ViewUsers from './components/admin/ViewUsers';
import ManageUsers from './components/superadmin/ManageUsers';
import BillHistory from './components/common/BillHistory';
import ProtectedRoute from './components/common/ProtectedRoute';
import VoiceAssistant from './components/common/VoiceAssistant';
import BillPrint from './pages/BillPrint';
import BillPrint from './pages/BillPrint';

// Helper to get current user from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Component to handle root redirect
const RootRedirect = () => {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'super_admin') {
    return <Navigate to="/super-admin-dashboard" replace />;
  } else if (user.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else {
    return <Navigate to="/user-dashboard" replace />;
  }
};

// Component to handle login redirect if already logged in
const LoginRoute = () => {
  const user = getCurrentUser();

  if (user) {
    return <RootRedirect />;
  }

  return <Login />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Root Route - Redirects based on role */}
        <Route path="/" element={<RootRedirect />} />

        {/* User Dashboard - Accessible by all roles */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard - Admin and SuperAdmin only */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* SuperAdmin Dashboard - SuperAdmin only */}
        <Route
          path="/super-admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Product Routes - All authenticated users */}
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
              <ProductList />
            </ProtectedRoute>
          }
        />

        {/* Bill Generation - All authenticated users */}
        <Route
          path="/generate-bill"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
              <GenerateBill />
            </ProtectedRoute>
          }
        />

        {/* Bill History - All authenticated users */}
        <Route
          path="/bill-history"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
              <BillHistory />
            </ProtectedRoute>
          }
        />

        {/* Bill Print - All authenticated users */}
        <Route
          path="/print-bill/:id"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
              <BillPrint />
            </ProtectedRoute>
          }
        />

        {/* Sales Report - Admin and SuperAdmin */}
        <Route
          path="/sales-report"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <SalesReport />
            </ProtectedRoute>
          }
        />

        {/* Profit/Loss Report - Admin and SuperAdmin */}
        <Route
          path="/profit-loss"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ProfitReport />
            </ProtectedRoute>
          }
        />

        {/* View Users - Admin and SuperAdmin */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <ViewUsers />
            </ProtectedRoute>
          }
        />

        {/* Manage Users - SuperAdmin only */}
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Voice Assistant - Available on all pages for logged-in users */}
      <VoiceAssistant />
    </Router>
  );
}

export default App;