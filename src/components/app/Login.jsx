import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, UserPlus, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import { auth } from '../../utils/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth';
import { pullFromCloud } from '../../utils/storage';
import './Login.css';

export default function Login({ setUser }) {
  const [view, setView] = useState('login'); // login | signup | forgot
  const navigate = useNavigate();

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      localStorage.setItem('memorix_current_user', cred.user.uid);
      setUser(cred.user.uid);
      // Pull cloud data in background — don't block navigation
      pullFromCloud().catch(console.error);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      // Set display name
      await updateProfile(cred.user, { displayName: username.trim() || email.split('@')[0] });
      localStorage.setItem('memorix_current_user', cred.user.uid);
      setUser(cred.user.uid);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setError('');
    setShowPassword(false);
    setResetSent(false);
  };

  return (
    <div className="login-page">
      <div className="container">
        <AnimatePresence mode="wait">
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <motion.div
              key="login"
              className="login-box glass"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="login-header">
                <div className="login-icon-wrap">
                  <LogIn size={28} />
                </div>
                <h2>Welcome Back</h2>
                <p>Log in to access your study sets on any device.</p>
              </div>

              {error && <div className="login-error"><AlertCircle size={14}/> {error}</div>}

              <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alice@example.com"
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>Password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="forgot-link">
                    <button type="button" onClick={() => switchView('forgot')}>Forgot Password?</button>
                  </div>
                </div>
                
                <Button variant="primary" type="submit" disabled={loading || !email.trim() || !password.trim()}>
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
                
                <div className="login-footer">
                  <span>Don't have an account?</span>
                  <button type="button" onClick={() => switchView('signup')}>Sign Up</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* SIGNUP VIEW */}
          {view === 'signup' && (
            <motion.div
              key="signup"
              className="login-box glass"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="login-header">
                <button type="button" className="back-btn-icon" onClick={() => switchView('login')}>
                  <ArrowLeft size={20} />
                </button>
                <div className="login-icon-wrap">
                  <UserPlus size={28} />
                </div>
                <h2>Create Account</h2>
                <p>Start your memorization journey today.</p>
              </div>

              {error && <div className="login-error"><AlertCircle size={14}/> {error}</div>}

              <form onSubmit={handleSignup} className="login-form">
                <div className="input-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a display name"
                  />
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alice@example.com"
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>Password (min 6 characters)</label>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button variant="primary" type="submit" disabled={loading || !password.trim() || !email.includes('@')}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
                
                <div className="login-footer">
                  <span>Already have an account?</span>
                  <button type="button" onClick={() => switchView('login')}>Log In</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* FORGOT PASSWORD */}
          {view === 'forgot' && (
            <motion.div
              key="forgot"
              className="login-box glass"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="login-header">
                <button type="button" className="back-btn-icon" onClick={() => switchView('login')}>
                  <ArrowLeft size={20} />
                </button>
                <div className="login-icon-wrap">
                  <KeyRound size={28} />
                </div>
                <h2>Reset Password</h2>
                <p>We'll send a password reset link to your email.</p>
              </div>

              {error && <div className="login-error"><AlertCircle size={14}/> {error}</div>}

              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '12px' }}>✓ Reset email sent!</div>
                  <p style={{ color: 'var(--w50)', fontSize: '0.85rem' }}>
                    Check your inbox at <strong>{email}</strong> and follow the link to reset your password.
                  </p>
                  <div className="login-footer" style={{ marginTop: '20px' }}>
                    <button type="button" onClick={() => switchView('login')}>Back to Login</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="login-form">
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alice@example.com"
                      autoFocus
                      required
                    />
                  </div>
                  
                  <Button variant="primary" type="submit" disabled={loading || !email.includes('@')}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  
                  <div className="login-footer">
                    <button type="button" onClick={() => switchView('login')}>Back to Login</button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
