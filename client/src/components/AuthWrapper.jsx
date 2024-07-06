import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Loader from './shared/Loader';

const AuthWrapper = () => {
  const { currentUser, isLoading } = useSelector((state) => state.user);

  if (isLoading) {
    return <div><Loader></div>;
  }

  if (!currentUser) {
    return <Navigate to="/continue-signin" replace />;
  }

  return <Outlet />;
};

export default AuthWrapper;