import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// Assume useAuth provides user details, or implement mock logic if missing
// import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  // Mock auth context check for demonstration, replace with actual context in full app
  // const { user, loading } = useAuth();
  const user = { role: 'admin' }; // Dummy data
  const loading = false;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
