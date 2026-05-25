import { motion } from 'framer-motion';
import { Target, RotateCcw, CheckCircle2, XCircle, BarChart3, Repeat2 } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../animations/ScrollReveal';
import GlowCard from '../ui/GlowCard';
import './PracticeModes.css';

export default function PracticeModes() {
  return (
    <section className="section practice-modes" id="practice-modes">

      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-label">Practice Modes</span>
            <h2>
              Two powerful ways to{' '}
              <span className="gradient-text">learn</span>
            </h2>
            <p className="section-desc">
              Choose the mode that fits your goal — evaluate your knowledge or train for mastery.
            </p>
          </div>
        </ScrollReveal>

        <div className="modes-grid">
          {/* Test Mode */}
          <ScrollReveal variant="fadeLeft" delay={0.1}>
            <GlowCard glowColor="purple" className="mode-card">
              <div className="mode-header">
                <div className="mode-icon-wrap" style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' }}>
                  <Target size={24} />
                </div>
                <div className="mode-badge test-badge">Evaluation</div>
              </div>
              <h3>Test Mode</h3>
              <p>Evaluate your memory with randomized quizzes from your uploaded content.</p>

              <div className="mode-features">
                <div className="mode-feature">
                  <BarChart3 size={16} />
                  <span>Choose 10, 20, or 30 questions</span>
                </div>
                <div className="mode-feature">
                  <Repeat2 size={16} />
                  <span>Random question generation</span>
                </div>
                <div className="mode-feature">
                  <CheckCircle2 size={16} />
                  <span>Score tracking & accuracy</span>
                </div>
              </div>

              {/* Mock UI Preview */}
              <div className="mode-preview">
                <div className="preview-inner">
                  <div className="preview-header">
                    <span className="preview-label">Question 7 of 10</span>
                    <span className="preview-progress-text">70%</span>
                  </div>
                  <div className="preview-progress-bar">
                    <motion.div
                      className="preview-progress-fill purple"
                      initial={{ width: 0 }}
                      whileInView={{ width: '70%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="preview-question">What does "ephemeral" mean?</div>
                  <div className="preview-input">Type your answer...</div>
                  <div className="preview-score-row">
                    <span className="preview-correct">✓ 5 correct</span>
                    <span className="preview-wrong">✗ 1 wrong</span>
                  </div>
                </div>
              </div>
            </GlowCard>
          </ScrollReveal>

          {/* Practice Mode */}
          <ScrollReveal variant="fadeRight" delay={0.2}>
            <GlowCard glowColor="cyan" className="mode-card">
              <div className="mode-header">
                <div className="mode-icon-wrap" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)' }}>
                  <RotateCcw size={24} />
                </div>
                <div className="mode-badge practice-badge">Adaptive</div>
              </div>
              <h3>Practice Mode</h3>
              <p>Continuous adaptive learning that intelligently repeats your weak areas.</p>

              <div className="mode-features">
                <div className="mode-feature">
                  <Repeat2 size={16} />
                  <span>Adaptive repetition engine</span>
                </div>
                <div className="mode-feature">
                  <XCircle size={16} />
                  <span>Wrong answers repeated later</span>
                </div>
                <div className="mode-feature">
                  <CheckCircle2 size={16} />
                  <span>Real understanding, not guessing</span>
                </div>
              </div>

              {/* Mock UI Preview */}
              <div className="mode-preview">
                <div className="preview-inner">
                  <div className="preview-header">
                    <span className="preview-label">Practice Session</span>
                    <span className="preview-progress-text">∞</span>
                  </div>
                  <div className="preview-question">"Ubiquitous"</div>
                  <div className="preview-input">Present everywhere...</div>
                  <div className="preview-feedback correct">
                    <CheckCircle2 size={14} />
                    <span>Correct! Confidence level increased.</span>
                  </div>
                  <div className="preview-confidence">
                    <span>Confidence</span>
                    <div className="confidence-dots">
                      <span className="dot filled" />
                      <span className="dot filled" />
                      <span className="dot filled" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
