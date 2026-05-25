import { Upload, Brain, TrendingUp } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../animations/ScrollReveal';
import GlowCard from '../ui/GlowCard';
import './HowItWorks.css';

const steps = [
  {
    icon: <Upload size={28} />,
    title: 'Upload Content',
    description: 'Paste text or upload PDF documents. Your learning material is the foundation.',
    glow: 'purple',
    step: '01',
  },
  {
    icon: <Brain size={28} />,
    title: 'AI Analyzes Data',
    description: 'Smart extraction identifies key terms, definitions, and concepts automatically.',
    glow: 'blue',
    step: '02',
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Practice & Improve',
    description: 'Adaptive repetition reinforces weak areas. Master your material through intelligent cycles.',
    glow: 'cyan',
    step: '03',
  },
];

export default function HowItWorks() {
  return (
    <section className="section how-it-works" id="how-it-works">

      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2>
              Three steps to{' '}
              <span className="gradient-text">mastery</span>
            </h2>
            <p className="section-desc">
              A streamlined workflow that transforms raw content into personalized practice sessions.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="how-cards" delay={0.2}>
          {steps.map((step, i) => (
            <ScrollRevealItem key={i}>
              <GlowCard glowColor={step.glow} className="how-card">
                <div className="how-step-number">{step.step}</div>
                <div className={`how-icon-wrap glow-icon-${step.glow}`}>
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="how-connector hide-mobile" />
                )}
              </GlowCard>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
