import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Monitor, LogOut, User } from 'lucide-react';
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



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
                <div className="navbar-user-info" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--w50)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <User size={14} /> <span className="hide-mobile">{user}</span>
                </div>
                <button
                  className="navbar-cta"
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{ background: 'transparent', color: 'var(--w50)', border: '1px solid var(--border-subtle)', padding: '6px 12px' }}
                >
                  <LogOut size={14} className="hide-mobile" style={{ marginRight: '6px', display: 'inline' }} />
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20,20,25,0.95)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxWidth: '400px', width: '90%', textAlign: 'center' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent)' }}>
                <LogOut size={32} />
              </div>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--w85)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Log Out</h3>
              <p style={{ margin: '0 0 24px 0', color: 'var(--w50)', fontSize: '0.9rem', lineHeight: '1.5' }}>Are you sure you want to log out of your account?</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-hover)', color: 'var(--w70)', border: '1px solid var(--border-subtle)', cursor: 'pointer', flex: 1, transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('memorix_current_user');
                    setUser(null);
                    setShowLogoutConfirm(false);
                    navigate('/login');
                  }}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', flex: 1, fontWeight: '600', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 15px var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
