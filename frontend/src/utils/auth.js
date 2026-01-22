//auth.js
// Authentication utility functions

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

// Store authentication data
export const setAuthData = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get stored user
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const user = getUser();
  if (!user) return false;
  
  const roleHierarchy = {
    'user': 1,
    'admin': 2,
    'super_admin': 3,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles) => {
  const user = getUser();
  if (!user) return false;
  
  return roles.includes(user.role);
};

// Get user role
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

// Check if user is admin or above
export const isAdmin = () => {
  return hasRole('admin');
};

// Check if user is super admin
export const isSuperAdmin = () => {
  const user = getUser();
  return user?.role === 'super_admin';
};

// Get user display name
export const getUserDisplayName = () => {
  const user = getUser();
  return user?.username || user?.email || 'User';
};

// Role display names
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'user': 'User',
    'admin': 'Admin',
    'super_admin': 'Super Admin',
  };
  
  return roleNames[role] || role;
};