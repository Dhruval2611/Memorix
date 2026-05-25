import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import Button from '../ui/Button';
import './HeroSection.css';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero" id="hero">
      {/* Ambient orbs — very subtle */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      {/* Side labels */}
      <div className="hero-side-left hide-mobile">MEMORIX 2025</div>
      <div className="hero-side-right hide-mobile">SMART MEMORY</div>

      <div className="container hero-content">
        <motion.span
          className="hero-greeting"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          // Memory Training Platform
        </motion.span>

        <div className="hero-name-wrap">
          <motion.h1
            className="hero-name shimmer-text"
            initial={{ opacity: 0, y: 80, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Memorix
          </motion.h1>
        </div>

        <motion.div
          className="hero-underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          Upload your learning material and master it through adaptive
          repetition and smart practice. Transform information into
          long-term memory.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/practice')}
          >
            Start Practicing
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={<ArrowRight size={14} />}
            onClick={() => navigate('/upload')}
          >
            Upload Content
          </Button>
        </motion.div>

        <motion.div
          className="hero-meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          <span className="hero-meta-item">∞ Practice Items</span>
          <span className="hero-meta-dot">◆</span>
          <span className="hero-meta-item">AI Extraction</span>
          <span className="hero-meta-dot">◆</span>
          <span className="hero-meta-item">Adaptive Learning</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span className="scroll-text">Scroll Down</span>
      </motion.div>
    </section>
  );
}
