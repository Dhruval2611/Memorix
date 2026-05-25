import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Landing page sections
import HeroSection from './components/sections/HeroSection';
import HowItWorks from './components/sections/HowItWorks';
import PracticeModes from './components/sections/PracticeModes';
import InteractiveDemo from './components/sections/InteractiveDemo';
import MemorySystem from './components/sections/MemorySystem';
import StatsSection from './components/sections/StatsSection';
import FinalCTA from './components/sections/FinalCTA';

// App pages
import UploadPanel from './components/app/UploadPanel';
import TestMode from './components/app/TestMode';
import PracticeMode from './components/app/PracticeMode';
import Dashboard from './components/app/Dashboard';

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

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPanel />} />
        <Route path="/test" element={<TestMode />} />
        <Route path="/practice" element={<PracticeMode />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="page-content">
        <Navbar />
        <AppRoutes />
      </div>
    </Router>
  );
}
