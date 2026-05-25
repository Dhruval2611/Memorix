import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import './FinalCTA.css';

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="section final-cta" id="final-cta">
      {/* Subtle background glows */}
      <div className="cta-bg">
        <div className="cta-glow cta-glow-1" />
        <div className="cta-glow cta-glow-2" />
      </div>

      <div className="container cta-content">
        <motion.div
          className="cta-text"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="cta-title">
            Turn Information Into{' '}
            <span className="gradient-text">Long-Term Memory</span>
          </h2>
          <p className="cta-subtitle">
            Start your intelligent learning journey today. Upload content, practice adaptively, and master anything.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              onClick={() => navigate('/upload')}
            >
              Start Using Memorix
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
