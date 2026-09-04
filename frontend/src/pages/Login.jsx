import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/auth';
import { api } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if token was passed via URL redirect or user is already authenticated
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      authService.setToken(tokenFromUrl);
      navigate('/dashboard');
    } else if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google login did not return a valid credential.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo-badge">⚡</div>
          <h1>PulseOps</h1>
          <p className="login-tagline">Real-time Uptime & Performance Monitoring for Modern Applications</p>
        </div>

        {error && <div className="error-alert mb-4">⚠️ {error}</div>}

        <div className="login-actions flex justify-center">
          {loading ? (
            <div className="loading-text">Authenticating with Google...</div>
          ) : (
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="filled_black"
                shape="rectangular"
                text="continue_with"
                width="320"
              />
            </div>
          )}
        </div>

        <div className="login-footer">
          PulseOps &bull; Automated Infrastructure Monitoring
        </div>
      </div>
    </div>
  );
};

export default Login;
