import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Monitor, LogOut, User } from 'lucide-react';
import { auth } from '../../utils/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import './Navbar.css';

const navLinks = [
  { label: 'HOME', path: '/' },
  { label: 'STUDY', path: '/read' },
  { label: 'PRACTICE', path: '/practice' },
  { label: 'TEST', path: '/test' },
  { label: 'DASHBOARD', path: '/dashboard' },
];

export default function Navbar({ theme = 'dark', setTheme, user, setUser }) {
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenProfile = () => {
    try {
      let defaultName = 'User';
      if (auth.currentUser) {
        if (auth.currentUser.displayName) {
          defaultName = auth.currentUser.displayName;
        } else if (auth.currentUser.email) {
          defaultName = auth.currentUser.email.split('@')[0];
        }
      }
      setProfileName(defaultName);
      setProfileError('');
      setProfileSuccess('');
      setShowProfileModal(true);
    } catch (e) {
      console.error(e);
      setProfileError('Failed to load profile.');
      setShowProfileModal(true);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      if (profileName && profileName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: profileName });
      }
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="navbar-inner container">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-mark">M</span>
            <span className="navbar-logo-text">memorix</span>
          </Link>

          <div className="navbar-links hide-mobile">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
            <button
              className="theme-toggle"
              onClick={() => {
                if (theme === 'dark') setTheme('grey');
                else if (theme === 'grey') setTheme('light');
                else setTheme('dark');
              }}
              aria-label="Toggle Theme"
              style={{ background: 'transparent', border: 'none', color: 'var(--w70)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%' }}
            >
              {theme === 'dark' ? <Moon size={20} /> : theme === 'grey' ? <Monitor size={20} /> : <Sun size={20} />}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div 
                  className="navbar-user-info" 
                  onClick={handleOpenProfile}
                  role="button"
                  tabIndex={0}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--w50)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
                >
                  <User size={14} /> <span className="hide-mobile">{auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User'}</span>
                </div>
                <button
                  className="navbar-cta"
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{ display: 'flex', alignItems: 'center', background: 'transparent', color: 'var(--w50)', border: '1px solid var(--border-subtle)', padding: '6px 12px' }}
                >
                  <LogOut size={14} className="hide-mobile" style={{ marginRight: '6px' }} />
                  <span className="hide-mobile">Logout</span>
                  <LogOut size={16} className="hide-desktop" />
                </button>
              </div>
            ) : (
              <button
                className="navbar-cta"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'var(--bg)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', maxWidth: '400px', width: '90%', textAlign: 'center' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent)' }}>
                <LogOut size={32} />
              </div>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--w85)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Log Out</h3>
              <p style={{ margin: '0 0 24px 0', color: 'var(--w50)', fontSize: '0.9rem', lineHeight: '1.5' }}>Are you sure you want to log out of your account?</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-surface)', color: 'var(--w70)', border: '1px solid var(--border-subtle)', cursor: 'pointer', flex: 1, transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await signOut(auth);
                    localStorage.removeItem('memorix_current_user');
                    setUser(null);
                    setShowLogoutConfirm(false);
                    navigate('/login');
                  }}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', flex: 1, fontWeight: '600', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'var(--bg)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', maxWidth: '400px', width: '90%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: 'var(--w85)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} className="accent-color" /> Profile Settings
                </h3>
                <button onClick={() => setShowProfileModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--w50)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {profileError && <div style={{ background: 'rgba(248, 113, 113, 0.1)', color: 'var(--accent-red)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{profileError}</div>}
              {profileSuccess && <div style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{profileSuccess}</div>}

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--w50)' }}>Display Name</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--w85)', fontFamily: 'var(--font-body)' }}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-surface)', color: 'var(--w70)', border: '1px solid var(--border-subtle)', cursor: 'pointer', flex: 1, transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={profileLoading}
                    style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: profileLoading ? 'not-allowed' : 'pointer', flex: 1, fontWeight: '600', transition: 'all 0.2s', fontFamily: 'var(--font-body)', opacity: profileLoading ? 0.7 : 1 }}
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
