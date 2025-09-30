import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from '../../../Images/logo.png';
import { BaseURl } from '../../Networking/APIs/NWconfig';
import Loader from '../../Component/Loader';
import './login.css';

export const ResetPassword = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(BaseURl + 'reset-password', {
        username,
        old_password: oldPassword,
        new_password: newPassword,
      });

      setLoading(false);
      toast.success(res.data.msg || "Password reset successfully!");
      navigate('/login');
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.msg || "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
      console.error("Password reset failed:", error);
    }
  };

  // --- Render ---
  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #fffbe6, #f7e0b5)",
      }}
    >
      <div className="row shadow-lg rounded overflow-hidden bg-white w-100" style={{ maxWidth: '900px' }}>

        <div className={`col-md-6 d-flex flex-column justify-content-center p-4 p-md-5 slide-in-left ${isAnimated ? 'visible' : ''}`}>

          <div className="text-center mb-4">
            <h3 className="fw-bold">Reset Your Password</h3>
            <p className="text-muted">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-medium">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="oldPassword" className="form-label fw-medium">Old Password</label>
              <input
                type="password"
                className="form-control"
                id="oldPassword"
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="form-label fw-medium">New Password</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-warning btn-sm fw-bold" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Resetting...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
            <div className="text-center">
              <small>
                <Link to="/login" className="text-decoration-none">Back to Login</Link>
              </small>
            </div>
          </form>
        </div>

        <div
          className={`col-md-6 d-none d-md-flex align-items-center justify-content-center p-5 slide-in-right ${isAnimated ? 'visible' : ''}`}
          style={{ background: 'rgba(255, 250, 230, 0.5)' }}
        >
          <img src={logo} alt="Company Brand" className="img-fluid" style={{ maxWidth: '350px' }} />
        </div>
      </div>
    </div>
  );
};