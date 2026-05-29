import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Brain, GraduationCap, LayoutDashboard } from 'lucide-react';
import './MobileBottomNav.css';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Study', path: '/read', icon: BookOpen },
  { label: 'Practice', path: '/practice', icon: Brain },
  { label: 'Test', path: '/test', icon: GraduationCap },
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
            <div key={item.path} className="mobile-nav-item">
              <Link 
                to={item.path} 
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                <div className="icon-wrapper">
                  <Icon size={20} className="icon" />
                </div>
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
