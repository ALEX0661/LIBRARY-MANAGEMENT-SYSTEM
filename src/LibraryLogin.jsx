import { useState } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import Icon from './Icon';
import './LibraryLogin.css';

function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Both fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.data.session_id, res.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="ll-card-header">
        <div className="ll-icon-circle">
          <Icon name="lock" size={22} />
        </div>
        <h1 className="ll-title">Welcome Back</h1>
        <p className="ll-subtitle">Sign in to your library account</p>
      </div>

      <form className="ll-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="ll-error">{error}</div>}

        <div className="field">
          <label htmlFor="ll-email">Email Address</label>
          <div className="field-input-wrap">
            <span className="field-icon"><Icon name="mail" size={15} /></span>
            <input
              id="ll-email"
              type="email"
              className="field-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="ll-password">Password</label>
          <div className="field-input-wrap">
            <span className="field-icon"><Icon name="lock" size={15} /></span>
            <input
              id="ll-password"
              type={showPw ? 'text' : 'password'}
              className="field-input"
              style={{ paddingRight: '38px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="ll-eye-btn"
              onClick={() => setShowPw((v) => !v)}
              tabIndex={-1}
            >
              <Icon name={showPw ? 'eyeOff' : 'eye'} size={15} />
            </button>
          </div>
        </div>
      
        <button type="submit" className="btn btn-primary ll-submit" disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Signing in…' : 'Sign In'}
          {!loading && <Icon name="chevRight" size={14} />}
        </button>
      </form>

      <p className="ll-switch">
        Don't have an account?{' '}
        <button type="button" className="ll-switch-link" onClick={onSwitch}>
          Register here
        </button>
      </p>
    </>
  );
}

function RegisterForm({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({
    fname: '', mname: '', lname: '',
    username: '', email: '', password: '', confirm: '',
    phone: '', address: '',
  });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const { fname, lname, username, email, password, confirm } = form;
    if (!fname || !lname || !username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.register({
        fname: form.fname,
        mname: form.mname || undefined,
        lname: form.lname,
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="ll-card-header">
        <div className="ll-icon-circle">
          <Icon name="personPlus" size={22} />
        </div>
        <h1 className="ll-title">Create Account</h1>
        <p className="ll-subtitle">Register to access the library system</p>
      </div>

      <form className="ll-form ll-register-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="ll-error">{error}</div>}

        <div className="ll-name-row">
          <div className="field">
            <label htmlFor="r-fname">First Name *</label>
            <input id="r-fname" type="text" className="field-input" placeholder="Juan" value={form.fname} onChange={set('fname')} />
          </div>
          <div className="field">
            <label htmlFor="r-mname">Middle Name</label>
            <input id="r-mname" type="text" className="field-input" placeholder="(optional)" value={form.mname} onChange={set('mname')} />
          </div>
          <div className="field">
            <label htmlFor="r-lname">Last Name *</label>
            <input id="r-lname" type="text" className="field-input" placeholder="Dela Cruz" value={form.lname} onChange={set('lname')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="r-username">Username *</label>
          <div className="field-input-wrap">
            <span className="field-icon"><Icon name="person" size={15} /></span>
            <input id="r-username" type="text" className="field-input" placeholder="e.g. jdelacruz" value={form.username} onChange={set('username')} autoComplete="username" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="r-email">Email Address *</label>
          <div className="field-input-wrap">
            <span className="field-icon"><Icon name="mail" size={15} /></span>
            <input id="r-email" type="email" className="field-input" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
        </div>

        <div className="ll-pw-row">
          <div className="field">
            <label htmlFor="r-pw">Password *</label>
            <div className="field-input-wrap">
              <span className="field-icon"><Icon name="lock" size={15} /></span>
              <input id="r-pw" type={showPw ? 'text' : 'password'} className="field-input" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" style={{ paddingRight: '38px' }} />
              <button type="button" className="ll-eye-btn" onClick={() => setShowPw((v) => !v)} tabIndex={-1}>
                <Icon name={showPw ? 'eyeOff' : 'eye'} size={15} />
              </button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="r-confirm">Confirm Password *</label>
            <div className="field-input-wrap">
              <span className="field-icon"><Icon name="lock" size={15} /></span>
              <input id="r-confirm" type={showPw ? 'text' : 'password'} className="field-input" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="r-phone">Phone Number</label>
          <div className="field-input-wrap">
            <span className="field-icon"><Icon name="phone" size={15} /></span>
            <input id="r-phone" type="tel" className="field-input" placeholder="09XXXXXXXXX" value={form.phone} onChange={set('phone')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="r-address">Address</label>
          <input id="r-address" type="text" className="field-input" placeholder="Street, City, Province" value={form.address} onChange={set('address')} />
        </div>

        <button type="submit" className="btn btn-primary ll-submit" disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Registering…' : 'Create Account'}
          {!loading && <Icon name="check" size={14} />}
        </button>
      </form>

      <p className="ll-switch">
        Already have an account?{' '}
        <button type="button" className="ll-switch-link" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </>
  );
}

export default function LibraryLogin() {
  const [mode, setMode] = useState('login');
  const [registered, setRegistered] = useState(false);

  function handleRegistered() {
    setRegistered(true);
    setMode('login');
  }

  return (
    <div className="ll-page">
      <header className="ll-navbar">
        <div className="ll-nav-brand">
          <span className="ll-nav-logo">
            <Icon name="library" size={18} />
          </span>
          Library Management
        </div>
        <nav className="ll-nav-links">
          <a href="#catalog" className="ll-nav-link">Catalog</a>
          <a href="#help" className="ll-nav-link">Help Center</a>
          {mode === 'login' && (
            <button className="ll-btn-register" onClick={() => setMode('register')}>
              Register
            </button>
          )}
        </nav>
      </header>

      <main className="ll-main">
        <div className="ll-card">
          {registered && mode === 'login' && (
            <div className="ll-success-banner">
              <Icon name="check" size={14} />
              Account created! You can now sign in.
            </div>
          )}

          {mode === 'login'
            ? <LoginForm onSwitch={() => { setRegistered(false); setMode('register'); }} />
            : <RegisterForm onSwitch={() => setMode('login')} onSuccess={handleRegistered} />
          }
        </div>

        <div className="ll-sub-links">
          <a href="#status" className="ll-sub-link">Library Status</a>
          <span className="ll-dot">·</span>
          <a href="#support" className="ll-sub-link">Technical Support</a>
          <span className="ll-dot">·</span>
          <a href="#contact" className="ll-sub-link">Contact Librarian</a>
        </div>
      </main>

      <footer className="ll-footer">
        <span className="ll-footer-ssl">
          <Icon name="lock" size={12} />
          256-bit SSL Encrypted Connection
        </span>
        <span className="ll-footer-copy">
          © 2026 Library Management System. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
