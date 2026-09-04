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

  const features = [
    {
      icon: '📡',
      title: 'API Monitoring',
      desc: 'Monitor your APIs at configurable intervals. Know instantly when something goes wrong.'
    },
    {
      icon: '🔔',
      title: 'Failure Detection & Alerts',
      desc: 'Detect repeated failures automatically and receive email alerts after 3 consecutive failures.'
    },
    {
      icon: '📊',
      title: 'History & Analytics',
      desc: 'Track response times, HTTP status codes, and complete monitoring history over time.'
    },
    {
      icon: '🌐',
      title: 'Public Status Page',
      desc: 'Share a safe public status page with stakeholders — without exposing your actual API URL.'
    }
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Hero / Login Card */}
        <div className="login-card">
          <div className="login-brand">
            <img src="/favicon.png" alt="PulseOps Logo" className="login-logo-img" />
            <h1>PulseOps</h1>
            <p className="login-tagline">Keep your APIs awake. Know when they go down.</p>
            <p className="login-desc">
              PulseOps monitors your APIs at configurable intervals, records response history,
              detects repeated failures, and alerts you when your service goes down.
            </p>
          </div>

          {error && <div className="error-alert mb-4">⚠️ {error}</div>}

          <div className="login-actions">
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

        {/* Feature Highlights */}
        <div className="login-features">
          <h2 className="features-title">What PulseOps Does</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
