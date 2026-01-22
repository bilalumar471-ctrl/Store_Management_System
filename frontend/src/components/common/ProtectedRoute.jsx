// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  // Check if user is logged in
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  // Parse user data
  let user;
  try {
    user = JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on their actual role
    if (user.role === 'super_admin') {
      return <Navigate to="/super-admin-dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  // User is authenticated and has the right role
  return children;
};

export default ProtectedRoute;