import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { auth } from './utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { pullFromCloud } from './utils/storage';

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
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes({ user, setUser }) {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      
      <Route path="/upload" element={<ProtectedRoute user={user}><UploadPanel /></ProtectedRoute>} />
      <Route path="/test" element={<ProtectedRoute user={user}><TestMode /></ProtectedRoute>} />
      <Route path="/practice" element={<ProtectedRoute user={user}><PracticeMode /></ProtectedRoute>} />
      <Route path="/read" element={<ProtectedRoute user={user}><ReadMode /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
      <Route path="/recycle-bin" element={<ProtectedRoute user={user}><RecycleBin /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('memorix_theme') || 'dark');
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in, string = logged in
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('memorix_theme', theme);
  }, [theme]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.setItem('memorix_current_user', firebaseUser.uid);
        setUser(firebaseUser.uid);
        // Pull cloud data and wait for it before showing the UI
        await pullFromCloud().catch(console.error);
      } else {
        localStorage.removeItem('memorix_current_user');
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Show nothing while checking auth (prevents flash)
  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--w50)', fontFamily: 'var(--font-body)' }}>Loading...</div>
      </div>
    );
  }

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
