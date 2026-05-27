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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--w50)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <User size={14} /> {user}
                </div>
                <button
                  className="navbar-cta hide-mobile"
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{ background: 'transparent', color: 'var(--w50)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px' }}
                >
                  <LogOut size={14} style={{ marginRight: '6px', display: 'inline' }} />
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="navbar-cta hide-mobile"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
            )}

            <button
              className="navbar-hamburger hide-desktop"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-menu-inner">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {user ? (
                  <button
                    className="mobile-cta"
                    onClick={() => {
                      setMobileOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--w70)' }}
                  >
                    <LogOut size={16} /> Logout ({user})
                  </button>
                ) : (
                  <button
                    className="mobile-cta"
                    onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  >
                    Log In
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--w70)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', flex: 1, transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--w85)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--w70)'; }}
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
