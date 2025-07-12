// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate,Outlet } from 'react-router-dom';

export default function ProtectedRoute({allowedRole }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Get the role from localStorage
  if (!token || (userRole !== allowedRole)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render the child components if authenticated and role matches
}
