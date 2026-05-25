import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, BookOpen, Flame, BarChart3, TrendingUp, Clock } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../animations/ScrollReveal';
import GlowCard from '../ui/GlowCard';
import './StatsSection.css';

function AnimatedCounter({ value, suffix = '', prefix = '', duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const end = parseInt(value);
    if (isNaN(end)) return;

    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="stat-counter">
      {prefix}{count}{suffix}
    </span>
  );
}

const stats = [
  { icon: <Target size={22} />, value: '94', suffix: '%', label: 'Accuracy Rate', color: 'purple' },
  { icon: <BookOpen size={22} />, value: '248', suffix: '', label: 'Items Mastered', color: 'blue' },
  { icon: <Flame size={22} />, value: '12', suffix: '', label: 'Day Streak', color: 'cyan' },
  { icon: <Clock size={22} />, value: '36', suffix: '', label: 'Sessions', color: 'purple' },
];

export default function StatsSection() {
  return (
    <section className="section stats-section" id="stats">
      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-label">Analytics</span>
            <h2>
              Track your{' '}
              <span className="gradient-text">progress</span>
            </h2>
            <p className="section-desc">
              Detailed insights into your learning journey with real-time performance metrics.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="stats-grid" delay={0.2}>
          {stats.map((stat, i) => (
            <ScrollRevealItem key={i}>
              <GlowCard glowColor={stat.color} className="stat-card">
                <div className={`stat-icon glow-icon-${stat.color}`}>
                  {stat.icon}
                </div>
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                />
                <span className="stat-label">{stat.label}</span>
              </GlowCard>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>

        {/* Chart Mock */}
        <ScrollReveal delay={0.4}>
          <div className="stats-chart-card ">
            <div className="chart-header">
              <div>
                <h3>Weekly Performance</h3>
                <p>Your accuracy trend over the past week</p>
              </div>
              <div className="chart-legend">
                <span className="legend-dot correct" /> Correct
                <span className="legend-dot wrong" /> Wrong
              </div>
            </div>
            <div className="chart-bars">
              {[
                { day: 'Mon', correct: 85, wrong: 15 },
                { day: 'Tue', correct: 72, wrong: 28 },
                { day: 'Wed', correct: 90, wrong: 10 },
                { day: 'Thu', correct: 68, wrong: 32 },
                { day: 'Fri', correct: 95, wrong: 5 },
                { day: 'Sat', correct: 88, wrong: 12 },
                { day: 'Sun', correct: 92, wrong: 8 },
              ].map((bar, i) => (
                <div key={i} className="chart-bar-group">
                  <div className="chart-bar-track">
                    <motion.div
                      className="chart-bar correct-bar"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${bar.correct}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="chart-bar wrong-bar"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${bar.wrong}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="chart-bar-label">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
