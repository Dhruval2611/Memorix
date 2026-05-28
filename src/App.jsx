import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Landing page sections
import HeroSection from './components/sections/HeroSection';
import HowItWorks from './components/sections/HowItWorks';
import PracticeModes from './components/sections/PracticeModes';
import InteractiveDemo from './components/sections/InteractiveDemo';
import MemorySystem from './components/sections/MemorySystem';
import StatsSection from './components/sections/StatsSection';
import FinalCTA from './components/sections/FinalCTA';

import UploadPanel from './components/app/UploadPanel';
import TestMode from './components/app/TestMode';
import PracticeMode from './components/app/PracticeMode';
import ReadMode from './components/app/ReadMode';
import Dashboard from './components/app/Dashboard';
import Login from './components/app/Login';
import RecycleBin from './components/app/RecycleBin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <PracticeModes />
      <InteractiveDemo />
      <MemorySystem />
      <StatsSection />
      <FinalCTA />
      <Footer />
    </>
  );
}

function ProtectedRoute({ user, children }) {
  if (user === null) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes({ user, setUser }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        <Route path="/upload" element={<ProtectedRoute user={user}><UploadPanel /></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute user={user}><TestMode /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute user={user}><PracticeMode /></ProtectedRoute>} />
        <Route path="/read" element={<ProtectedRoute user={user}><ReadMode /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
        <Route path="/recycle-bin" element={<ProtectedRoute user={user}><RecycleBin /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('memorix_theme') || 'dark');
  const [user, setUser] = useState(() => localStorage.getItem('memorix_current_user') || null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('memorix_theme', theme);
  }, [theme]);

  return (
    <Router>
      <ScrollToTop />
      <div className="page-content">
        <Navbar theme={theme} setTheme={setTheme} user={user} setUser={setUser} />
        <AppRoutes user={user} setUser={setUser} />
      </div>
      <MobileBottomNav />
    </Router>
  );
}
