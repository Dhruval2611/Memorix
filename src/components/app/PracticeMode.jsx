import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Brain, Zap, TrendingUp, Info } from 'lucide-react';
import Button from '../ui/Button';
import CustomSelect from '../ui/CustomSelect';
import {
  getContentLibrary,
  getLearningStateForContent,
  saveLearningStateForContent,
  updateUserStats,
  addSessionRecord,
} from '../../utils/storage';
import {
  selectNextItem,
  updateItemState,
  createLearningState,
  calculateStats,
} from '../../utils/adaptiveEngine';
import './PracticeMode.css';

export default function PracticeMode() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('setup'); // 'setup' | 'practice' | 'summary'
  const [contentId, setContentId] = useState('');
  const [library, setLibrary] = useState([]);
  const [items, setItems] = useState([]);
  const [learningState, setLearningState] = useState({});
  const [currentItem, setCurrentItem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, total: 0 });
  const [recentIds, setRecentIds] = useState([]);
  const [directionSetting, setDirectionSetting] = useState('term-to-def'); // 'term-to-def', 'def-to-term', 'random'
  const [currentDirection, setCurrentDirection] = useState('term-to-def');
  const inputRef = useRef(null);

  useEffect(() => {
    setLibrary(getContentLibrary());
  }, []);

  const startPractice = () => {
    const content = library.find(c => c.id === contentId);
    if (!content) return;

    const existingState = getLearningStateForContent(contentId);
    const state = Object.keys(existingState).length > 0
      ? existingState
      : createLearningState(content.items);

    setItems(content.items);
    setLearningState(state);
    setSessionStats({ correct: 0, wrong: 0, total: 0 });
    setRecentIds([]);

    const firstItem = selectNextItem(content.items, state, []);
    setCurrentItem(firstItem);
    setCurrentDirection(directionSetting === 'random' ? (Math.random() > 0.5 ? 'term-to-def' : 'def-to-term') : directionSetting);
    setStage('practice');
  };

  const checkAnswer = useCallback(() => {
    if (!userAnswer.trim() || !currentItem) return;

    const normalizeString = (str) => str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, ' ').trim();
    const normalizedUser = normalizeString(userAnswer);
    const isTermToDef = currentDirection === 'term-to-def';
    const expectedAnswer = currentItem.type === 'fill-blank' 
      ? currentItem.term 
      : (isTermToDef ? currentItem.definition : currentItem.term);
    const normalizedExpected = normalizeString(expectedAnswer);
    const isCorrect = normalizedUser === normalizedExpected;

    // Update learning state
    const newState = updateItemState(learningState, currentItem.id, isCorrect);
    setLearningState(newState);
    saveLearningStateForContent(contentId, newState);

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      total: prev.total + 1,
    }));

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');

      // Select next item
      const newRecent = [...recentIds, currentItem.id].slice(-5);
      setRecentIds(newRecent);
      const next = selectNextItem(items, newState, newRecent);
      setCurrentItem(next);
      setCurrentDirection(directionSetting === 'random' ? (Math.random() > 0.5 ? 'term-to-def' : 'def-to-term') : directionSetting);

      // Focus input
      inputRef.current?.focus();
    }, 2000);
  }, [userAnswer, currentItem, learningState, contentId, items, recentIds, currentDirection, directionSetting]);

  const endSession = () => {
    updateUserStats({
      totalCorrect: sessionStats.correct,
      totalWrong: sessionStats.wrong,
    });

    addSessionRecord({
      type: 'practice',
      contentId,
      correct: sessionStats.correct,
      wrong: sessionStats.wrong,
      total: sessionStats.total,
      accuracy: sessionStats.total > 0
        ? Math.round((sessionStats.correct / sessionStats.total) * 100)
        : 0,
    });

    setStage('summary');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') checkAnswer();
  };

  const stats = calculateStats(items, learningState);
  const sessionAccuracy = sessionStats.total > 0
    ? Math.round((sessionStats.correct / sessionStats.total) * 100)
    : 0;

  return (
    <div className="practice-page">

      <div className="container">
        <button className="back-btn" onClick={() => stage === 'practice' ? endSession() : navigate(-1)}>
          <ArrowLeft size={16} /> {stage === 'practice' ? 'End Session' : 'Back'}
        </button>

        <AnimatePresence mode="wait">
          {/* SETUP */}
          {stage === 'setup' && (
            <motion.div
              key="setup"
              className="practice-setup"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <h1>
                <span className="gradient-text">Practice</span> Mode
              </h1>
              <p>Continuous adaptive learning that reinforces your weak areas intelligently.</p>

              {library.length === 0 ? (
                <div className="no-content-msg glass">
                  <p>No content uploaded yet. Upload some learning material first.</p>
                  <Button variant="primary" onClick={() => navigate('/upload')}>
                    Upload Content
                  </Button>
                </div>
              ) : (
                <>
                  <div className="setup-field">
                    <label>Select Content</label>
                    <CustomSelect
                      value={contentId}
                      onChange={(val) => setContentId(val)}
                      options={library.map(c => ({
                        value: c.id,
                        label: `${c.title} (${c.itemCount} items)`
                      }))}
                      placeholder="Choose content..."
                    />
                  </div>

                  <div className="setup-field" style={{ marginTop: '16px' }}>
                    <label>Practice Direction</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="setup-select has-tooltip"
                        style={{ flex: 1, padding: '10px', background: directionSetting === 'term-to-def' ? 'var(--accent-dim)' : 'var(--bg-hover)', color: directionSetting === 'term-to-def' ? 'var(--w85)' : 'var(--w50)', border: directionSetting === 'term-to-def' ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => setDirectionSetting('term-to-def')}
                      >
                        Term → Def
                        <div className="custom-tooltip">Show Term, Answer Definition</div>
                      </button>
                      <button
                        className="setup-select has-tooltip"
                        style={{ flex: 1, padding: '10px', background: directionSetting === 'def-to-term' ? 'var(--accent-dim)' : 'var(--bg-hover)', color: directionSetting === 'def-to-term' ? 'var(--w85)' : 'var(--w50)', border: directionSetting === 'def-to-term' ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => setDirectionSetting('def-to-term')}
                      >
                        Def → Term
                        <div className="custom-tooltip">Show Definition, Answer Term</div>
                      </button>
                      <button
                        className="setup-select has-tooltip"
                        style={{ flex: 1, padding: '10px', background: directionSetting === 'random' ? 'var(--accent-dim)' : 'var(--bg-hover)', color: directionSetting === 'random' ? 'var(--w85)' : 'var(--w50)', border: directionSetting === 'random' ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => setDirectionSetting('random')}
                      >
                        Mixed
                        <div className="custom-tooltip">Randomly switch directions</div>
                      </button>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    icon={<Brain size={18} />}
                    onClick={startPractice}
                    disabled={!contentId}
                  >
                    Start Practicing
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {/* PRACTICE */}
          {stage === 'practice' && currentItem && (
            <motion.div
              key="practice"
              className="practice-active"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              {/* Session sidebar stats */}
              <div className="practice-sidebar">
                <div className="sidebar-stat">
                  <Zap size={14} />
                  <span>{sessionStats.total} answered</span>
                </div>
                <div className="sidebar-stat correct-color">
                  <CheckCircle2 size={14} />
                  <span>{sessionStats.correct}</span>
                </div>
                <div className="sidebar-stat wrong-color">
                  <XCircle size={14} />
                  <span>{sessionStats.wrong}</span>
                </div>
                {sessionStats.total > 0 && (
                  <div className="sidebar-stat">
                    <TrendingUp size={14} />
                    <span>{sessionAccuracy}%</span>
                  </div>
                )}
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem.id + sessionStats.total}
                  className="practice-card "
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Confidence indicator */}
                  <div className="confidence-bar">
                    <span className="confidence-label">Confidence</span>
                    <div className="confidence-dots-row">
                      {[1, 2, 3, 4, 5].map(level => {
                        const itemState = learningState[currentItem.id];
                        const confidence = itemState?.confidence || 0;
                        return (
                          <span
                            key={level}
                            className={`conf-dot ${confidence >= level ? 'filled' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <span className="question-type-badge">{currentItem.type}</span>
                  <div className="practice-term">
                    {currentItem.type === 'fill-blank' ? currentItem.term : (currentDirection === 'term-to-def' ? currentItem.term : currentItem.definition)}
                  </div>
                  <p className="practice-prompt">
                    {currentItem.type === 'fill-blank'
                      ? 'Fill in the blank:'
                      : (currentDirection === 'term-to-def' ? 'What does this mean?' : 'What is the term?')}
                  </p>

                  {currentItem.type === 'fill-blank' && (
                    <div className="fill-blank-context">{currentItem.definition}</div>
                  )}

                  <div className={`practice-input-wrap ${feedback || ''}`}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={currentItem.type === 'fill-blank' ? 'Type the missing word...' : 'Type your answer...'}
                      disabled={feedback !== null}
                      className="practice-input"
                      autoFocus
                      autoComplete="off"
                    />
                  </div>

                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        className={`practice-feedback ${feedback}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {feedback === 'correct' ? (
                          <>
                            <CheckCircle2 size={18} />
                            <span>Correct! Confidence increased.</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={18} />
                            <div className="practice-correction">
                              <span>Correct answer:</span>
                              <strong>
                                {currentItem.type === 'fill-blank'
                                  ? currentItem.term
                                  : (currentDirection === 'term-to-def' ? currentItem.definition : currentItem.term)}
                              </strong>
                              <span className="requeue-notice">This will appear again soon.</span>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!feedback && (
                    <div className="practice-actions">
                      <Button variant="primary" onClick={checkAnswer} disabled={!userAnswer.trim()}>
                        Check Answer
                      </Button>
                      <button className="end-session-btn" onClick={endSession}>
                        End Session
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Mastery overview */}
              <div className="mastery-overview glass">
                <div className="mastery-row">
                  <span>Mastered</span>
                  <span className="mastery-value">{stats.mastered}</span>
                </div>
                <div className="mastery-row">
                  <span>Learning</span>
                  <span className="mastery-value">{stats.learning}</span>
                </div>
                <div className="mastery-row">
                  <span>Weak</span>
                  <span className="mastery-value weak">{stats.weak}</span>
                </div>
                <div className="mastery-row">
                  <span>New</span>
                  <span className="mastery-value">{stats.new}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUMMARY */}
          {stage === 'summary' && (
            <motion.div
              key="summary"
              className="practice-summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2>Session Complete!</h2>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="summary-value gradient-text">{sessionStats.total}</span>
                  <span className="summary-label">Answered</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-value correct-color">{sessionStats.correct}</span>
                  <span className="summary-label">Correct</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-value wrong-color">{sessionStats.wrong}</span>
                  <span className="summary-label">Wrong</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-value gradient-text">{sessionAccuracy}%</span>
                  <span className="summary-label">Accuracy</span>
                </div>
              </div>

              <div className="summary-actions">
                <Button variant="primary" icon={<Brain size={16} />} onClick={() => setStage('setup')}>
                  Practice Again
                </Button>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
