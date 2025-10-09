import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from '../../../Images/logo.png';
import { LoginSubmit } from '../../Networking/APIs/LoginApi';
import { GetuserList } from '../../Networking/APIs/UserGetDetails';
import Loader from '../../Component/Loader';
import './Login.css';

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(LoginSubmit({ username, password })).unwrap();

      setLoading(false);
      toast.success("Login successfull!...");
      dispatch(GetuserList());
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      // err will contain the `message` from `rejectWithValue` in your slice
      const errorMessage = err?.message || "Login failed. Please check your credentials.";

      console.error("Login failed:", err);
    }
  };

  // If loading, show the loader full-screen
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #fffbe6, #f7e0b5)",
      }}
    >
      {/* A single clean card with two columns */}
      <div className="row shadow-lg rounded overflow-hidden bg-white w-100" style={{ maxWidth: '900px' }}>

        {/* --- Left Column: Image Section (slides in from the left) --- */}
        <div
          className={`col-md-6 d-none d-md-flex align-items-center justify-content-center p-5 slide-in-left ${isAnimated ? 'visible' : ''}`}
          style={{ background: 'rgba(255, 250, 230, 0.5)' }}
        >
          <img src={logo} alt="Company Brand" className="img-fluid" style={{ maxWidth: '350px' }} />
        </div>

        {/* --- Right Column: Form Section (slides in from the right) --- */}
        <div className={`col-md-6 d-flex flex-column justify-content-center p-4 p-md-5 slide-in-right ${isAnimated ? 'visible' : ''}`}>

          <div className="text-center mb-4">
            <h3 className="fw-bold">Welcome Back!</h3>
            <p className="text-muted">Please log in to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-medium">Email</label>
              <input
                type="text" // Corrected from 'username'
                className="form-control"
                id="username"
                placeholder="Enter email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-medium">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-warning btn-sm fw-bold">Login</button>
            </div>

            <div className="text-center">
            
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};