import React from 'react';
import '../index.css';

export default function Login({ onLogin }) {
  const handleLogin = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="login-layout">
      {/* LEFT SIDE - BRANDING */}
      <div className="login-brand-panel">
        <div className="login-brand-bg-layer" />
        <div className="login-brand-content">
          <div className="brand-tag">EQUITY MERIDIAN</div>
          <h1 className="brand-title">Architectural<br/>Wealth.</h1>
          <p className="brand-description">
            Building resilient financial structures with the precision of master architects. Secure your legacy with Sovereign Curation.
          </p>
          <div className="brand-badge">
            <span className="badge-line"></span>
            <span className="badge-text">VERIFIED PRIVATE BANKING</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Access Portfolio</h2>
            <p>Sign in to your private wealth dashboard.</p>
          </div>

          <div className="login-card">
            <form onSubmit={handleLogin}>
              <div className="form-group-login">
                <label>EMAIL ADDRESS</label>
                <input type="email" placeholder="name@institution.com" required />
              </div>

              <div className="form-group-login">
                <div className="label-row">
                  <label>PASSWORD</label>
                  <a href="#" className="forgot-link">Forgot Password?</a>
                </div>
                <input type="password" placeholder="••••••••" required />
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember device for 30 days</label>
              </div>

              <button type="submit" className="btn-secure-login">
                <span className="material-symbols-outlined icon-sm">lock</span>
                Secure Login
              </button>
            </form>

            <div className="auth-divider">
              <span>MODERN AUTHENTICATION</span>
            </div>

            <div className="modern-auth-grid">
              <button type="button" className="auth-option">
                <span className="material-symbols-outlined auth-icon">fingerprint</span>
                <span className="auth-label">BIOMETRICS</span>
              </button>
              <button type="button" className="auth-option">
                <span className="material-symbols-outlined auth-icon">face</span>
                <span className="auth-label">FACE ID</span>
              </button>
              <button type="button" className="auth-option">
                <span className="material-symbols-outlined auth-icon">passkey</span>
                <span className="auth-label">PASSKEY</span>
              </button>
            </div>
          </div>

          <div className="login-footer-link">
            Don't have an account? <a href="#">Apply for membership</a>
          </div>
        </div>

        <div className="login-bottom-footer">
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Security</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="footer-copyright">
            © 2024 Equity Meridian. All rights reserved. Member SIPC/FINRA.
          </div>
        </div>
      </div>
    </div>
  );
}
