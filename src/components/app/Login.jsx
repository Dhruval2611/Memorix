import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, UserPlus, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import { verifyLogin, registerUser, getUserByEmail, resetPassword, getAllUsers } from '../../utils/storage';
import { sendEmailOtp } from '../../utils/emailService';
import './Login.css';

export default function Login({ setUser }) {
  const [view, setView] = useState('login'); // login | signup | forgot | otp | reset
  const navigate = useNavigate();

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mockOtpValue, setMockOtpValue] = useState('');

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) return;

    // Special case: if this is the very first time using the app and there are no users, jump to signup
    const allUsers = getAllUsers();
    if (allUsers.length === 0) {
      setView('signup');
      setError('No users exist yet. Please create an account.');
      return;
    }

    const user = verifyLogin(username.trim(), password.trim());
    if (user) {
      localStorage.setItem('memorix_current_user', user.username);
      setUser(user.username);
      navigate('/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  // Handle Signup
  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    const success = registerUser(username.trim(), password.trim(), email.trim());
    if (success) {
      localStorage.setItem('memorix_current_user', username.trim());
      setUser(username.trim());
      navigate('/dashboard');
    } else {
      setError('Username already exists. Please choose another.');
    }
  };

  // Handle Forgot Password - Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    const user = getUserByEmail(email.trim());
    if (!user) {
      setError('No account found with this email address.');
      return;
    }

    // Generate mock OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtpValue(code);
    
    // Simulate real SMS/Email dispatch
    const result = await sendEmailOtp(email.trim(), code);
    if (result.success) {
      setView('otp');
    } else {
      setError(result.message);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    
    if (otp === mockOtpValue) {
      setView('reset');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  // Handle Password Reset
  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    
    const user = getUserByEmail(email.trim());
    if (!user) return;

    if (newPassword.trim() === user.password) {
      setError('New password cannot be the same as the old password.');
      return;
    }

    if (newPassword.trim().length >= 4) {
      resetPassword(user.username, newPassword.trim());
      setView('login');
      setUsername(user.username);
      setPassword('');
      alert('Password reset successful! Please log in.');
    } else {
      setError('Password must be at least 4 characters.');
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setError('');
    setShowPassword(false);
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
                <p>Log in to access your personal study sets.</p>
              </div>

              {error && <div className="login-error"><AlertCircle size={14}/> {error}</div>}

              <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Alice"
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
                
                <Button variant="primary" type="submit" disabled={!username.trim() || !password.trim()}>
                  Log In
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
                  <label>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
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
                </div>
                
                <Button variant="primary" type="submit" disabled={!username.trim() || !password.trim() || !email.includes('@')}>
                  Create Account
                </Button>
                
                <div className="login-footer">
                  <span>Already have an account?</span>
                  <button type="button" onClick={() => switchView('login')}>Log In</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* FORGOT PASSWORD - PHONE */}
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
                <p>Enter your registered email address to receive an OTP.</p>
              </div>

              {error && <div className="login-error"><AlertCircle size={14}/> {error}</div>}

              <form onSubmit={handleSendOtp} className="login-form">
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
                
                <Button variant="primary" type="submit" disabled={!email.includes('@')}>
                  Send OTP via Email
                </Button>
                
                <div className="login-footer">
                  <button type="button" onClick={() => switchView('login')}>Back to Login</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* OTP VERIFICATION */}
          {view === 'otp' && (
            <motion.div
              key="otp"
              className="login-box glass"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="login-header">
                <button type="button" className="back-btn-icon" onClick={() => switchView('forgot')}>
                  <ArrowLeft size={20} />
                </button>
                <div className="login-icon-wrap">
                  <KeyRound size={28} />
                </div>
                <h2>Verify OTP</h2>
                <p>We've sent a 6-digit code to {email}</p>
              </div>

              {error && <div className="login-error"><AlertCircle size={14}/> {error}</div>}

              <form onSubmit={handleVerifyOtp} className="login-form">
                <div className="input-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.2em' }}
                    autoFocus
                    required
                  />
                </div>
                
                <Button variant="primary" type="submit" disabled={otp.length !== 6}>
                  Verify OTP
                </Button>
                
                <div className="login-footer">
                  <button type="button" onClick={() => switchView('forgot')}>Change Email Address</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* RESET PASSWORD */}
          {view === 'reset' && (
            <motion.div
              key="reset"
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
                <h2>Create New Password</h2>
                <p>Please enter your new password below.</p>
              </div>

              {error && <div className="login-error"><AlertCircle size={14}/> {error}</div>}

              <form onSubmit={handleResetPassword} className="login-form">
                <div className="input-group">
                  <label>New Password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button variant="primary" type="submit" disabled={newPassword.length < 4}>
                  Reset Password
                </Button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
