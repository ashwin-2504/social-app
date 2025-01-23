import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ isLoggedIn }) => {
  // If the user is not logged in, redirect to the home page or another page
  if (!isLoggedIn) {
    return <Navigate to="/" />;  // Redirecting to home or another route if not logged in
  }

  // If logged in, render the child route
  return <Outlet />;
};

export default PrivateRoute;
