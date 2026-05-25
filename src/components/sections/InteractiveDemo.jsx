import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import ScrollReveal from '../animations/ScrollReveal';
import './InteractiveDemo.css';

const demoItems = [
  { term: 'Ephemeral', definition: 'Lasting for a very short time' },
  { term: 'Ubiquitous', definition: 'Present, appearing, or found everywhere' },
  { term: 'Pragmatic', definition: 'Dealing with things in a practical way' },
  { term: 'Resilient', definition: 'Able to recover quickly from difficulties' },
  { term: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing' },
  { term: 'Ambiguous', definition: 'Open to more than one interpretation' },
];

export default function InteractiveDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  const currentItem = demoItems[currentIndex];

  const checkAnswer = useCallback(() => {
    if (!userInput.trim()) return;

    const isCorrect = currentItem.definition
      .toLowerCase()
      .includes(userInput.trim().toLowerCase().slice(0, 10)) ||
      userInput.trim().toLowerCase().includes(currentItem.definition.toLowerCase().split(' ').slice(0, 3).join(' '));

    // Simplified check - match if first significant words match
    const userWords = userInput.toLowerCase().split(' ').filter(w => w.length > 2);
    const defWords = currentItem.definition.toLowerCase().split(' ').filter(w => w.length > 2);
    const matchCount = userWords.filter(w => defWords.includes(w)).length;
    const matched = matchCount >= Math.min(2, defWords.length) || isCorrect;

    setFeedback(matched ? 'correct' : 'wrong');
    setStats(prev => ({
      correct: prev.correct + (matched ? 1 : 0),
      wrong: prev.wrong + (matched ? 0 : 1),
    }));

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      setShowHint(false);
      setCurrentIndex((prev) => (prev + 1) % demoItems.length);
    }, 2000);
  }, [userInput, currentItem, currentIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') checkAnswer();
  };

  return (
    <section className="section interactive-demo" id="interactive-demo">


      <div className="container">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-label">Try It Now</span>
            <h2>
              Interactive{' '}
              <span className="gradient-text">Demo</span>
            </h2>
            <p className="section-desc">
              Experience the practice flow. Define the word shown below.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="demo-container">
            <div className="demo-card ">
              {/* Stats bar */}
              <div className="demo-stats-bar">
                <span className="demo-stat-correct">
                  <CheckCircle2 size={14} /> {stats.correct}
                </span>
                <span className="demo-counter">{currentIndex + 1} / {demoItems.length}</span>
                <span className="demo-stat-wrong">
                  <XCircle size={14} /> {stats.wrong}
                </span>
              </div>

              {/* Word Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="demo-word"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  {currentItem.term}
                </motion.div>
              </AnimatePresence>

              {/* Hint */}
              {showHint && (
                <motion.div
                  className="demo-hint"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  Hint: {currentItem.definition.split(' ').slice(0, 3).join(' ')}...
                </motion.div>
              )}

              {/* Input */}
              <div className={`demo-input-wrap ${feedback || ''}`}>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type the definition..."
                  disabled={feedback !== null}
                  className="demo-input"
                  autoComplete="off"
                />
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className={`demo-feedback ${feedback}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {feedback === 'correct' ? (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Correct! Well done.</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        <div className="demo-correction">
                          <span>The answer is:</span>
                          <strong>{currentItem.definition}</strong>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              {!feedback && (
                <div className="demo-actions">
                  <button className="demo-hint-btn" onClick={() => setShowHint(true)}>
                    Show Hint
                  </button>
                  <button className="demo-submit-btn" onClick={checkAnswer}>
                    Check Answer
                  </button>
                  <button
                    className="demo-skip-btn"
                    onClick={() => {
                      setCurrentIndex((prev) => (prev + 1) % demoItems.length);
                      setUserInput('');
                      setShowHint(false);
                    }}
                  >
                    <RotateCcw size={14} /> Skip
                  </button>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
