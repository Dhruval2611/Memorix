import { motion } from 'framer-motion';
import ScrollReveal, { ScrollRevealItem } from '../animations/ScrollReveal';
import './MemorySystem.css';

const nodes = [
  { id: 1, label: 'New Content', sublabel: 'Upload & Extract', color: '#8b5cf6' },
  { id: 2, label: 'First Exposure', sublabel: 'Initial Practice', color: '#3b82f6' },
  { id: 3, label: 'Mistake Detection', sublabel: 'Wrong → Queue', color: '#f87171' },
  { id: 4, label: 'Smart Repetition', sublabel: 'Adaptive Cycles', color: '#22d3ee' },
  { id: 5, label: 'Confidence Growth', sublabel: 'Progressive Mastery', color: '#34d399' },
  { id: 6, label: 'Long-Term Memory', sublabel: 'Retained Forever', color: '#a78bfa' },
];

export default function MemorySystem() {
  return (
    <section className="section memory-system" id="memory-system">


      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-label">The Engine</span>
            <h2>
              Adaptive{' '}
              <span className="gradient-text">Memory System</span>
            </h2>
            <p className="section-desc">
              A scientifically-inspired learning cycle that strengthens retention through intelligent repetition.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="memory-timeline">
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                className="memory-node"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <div className="node-indicator">
                  <div
                    className="node-dot"
                    style={{
                      background: node.color,
                      boxShadow: `0 0 20px ${node.color}60`,
                    }}
                  />
                  {i < nodes.length - 1 && <div className="node-line" />}
                </div>
                <div className="node-content">
                  <div className="node-number" style={{ color: node.color }}>
                    {String(node.id).padStart(2, '0')}
                  </div>
                  <h3>{node.label}</h3>
                  <p>{node.sublabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="memory-principles">
            {[
              { title: 'Active Recall', desc: 'Test yourself rather than re-reading. Forces your brain to retrieve information.' },
              { title: 'Adaptive Repetition', desc: 'Wrong answers come back more frequently. Right answers space out gradually.' },
              { title: 'Mistake Reinforcement', desc: 'Errors are opportunities. Wrong items get re-queued with higher priority.' },
              { title: 'Randomized Cycles', desc: 'Even mastered items reappear randomly to prevent guess-based memorization.' },
            ].map((principle, i) => (
              <div key={i} className="principle-card glass">
                <h4>{principle.title}</h4>
                <p>{principle.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
