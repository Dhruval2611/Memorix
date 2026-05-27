import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Dumbbell, FileText, LayoutDashboard } from 'lucide-react';
import './MobileBottomNav.css';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Study', path: '/read', icon: BookOpen },
  { label: 'Practice', path: '/practice', icon: Dumbbell },
  { label: 'Test', path: '/test', icon: FileText },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.div 
              key={item.path}
              className="mobile-nav-item"
              whileTap={{ scale: 0.85 }}
            >
              <Link 
                to={item.path} 
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                <div className="icon-wrapper">
                  <Icon size={22} className="icon" />
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavIndicator"
                      className="nav-indicator"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}
