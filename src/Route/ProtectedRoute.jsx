import React from 'react';
import { Navigate } from 'react-router-dom';
import { NavbarComponent } from '../Screens/Navbar/Navbar';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // console.log(token, "token");


  return token ? (
    <>
      <NavbarComponent />
      {children}
    </>
  ) : (
    <Navigate to="/login" />
  );

};

export default PrivateRoute;
