import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, RotateCcw, BarChart3, Info } from 'lucide-react';
import Button from '../ui/Button';
import CustomSelect from '../ui/CustomSelect';
import { getContentLibrary, getLearningState, updateUserStats, addSessionRecord } from '../../utils/storage';
import { generateTestSet } from '../../utils/adaptiveEngine';
import './TestMode.css';

export default function TestMode() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('setup'); // 'setup' | 'test' | 'results'
  const [contentId, setContentId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [library, setLibrary] = useState([]);
  const [directionSetting, setDirectionSetting] = useState('term-to-def');
  const [testDirections, setTestDirections] = useState([]);

  useEffect(() => {
    setLibrary(getContentLibrary());
  }, []);

  const startTest = () => {
    const content = library.find(c => c.id === contentId);
    if (!content) return;

    const testItems = generateTestSet(content.items, questionCount);
    
    const directions = testItems.map(() => {
      return directionSetting === 'random' ? (Math.random() > 0.5 ? 'term-to-def' : 'def-to-term') : directionSetting;
    });

    setQuestions(testItems);
    setTestDirections(directions);
    setCurrentQ(0);
    setResults([]);
    setStage('test');
  };

  const checkAnswer = useCallback(() => {
    if (!userAnswer.trim()) return;

    const current = questions[currentQ];
    const currentDirection = testDirections[currentQ];
    const normalizeString = (str) => str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, ' ').trim();
    const normalizedUser = normalizeString(userAnswer);
    const expectedAnswer = current.type === 'fill-blank' 
      ? current.term 
      : (currentDirection === 'term-to-def' ? current.definition : current.term);
    const normalizedExpected = normalizeString(expectedAnswer);
    const isCorrect = normalizedUser === normalizedExpected;

    const result = {
      item: current,
      userAnswer: userAnswer.trim(),
      isCorrect,
      direction: currentDirection
    };

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setResults(prev => [...prev, result]);

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      if (currentQ + 1 >= questions.length) {
        finishTest([...results, result]);
      } else {
        setCurrentQ(prev => prev + 1);
      }
    }, 1500);
  }, [userAnswer, questions, currentQ, results, testDirections]);

  const finishTest = (finalResults) => {
    const correct = finalResults.filter(r => r.isCorrect).length;
    const wrong = finalResults.filter(r => !r.isCorrect).length;

    updateUserStats({
      totalSessions: undefined, // will be incremented
      totalCorrect: correct,
      totalWrong: wrong,
    });

    addSessionRecord({
      type: 'test',
      contentId,
      questionCount: questions.length,
      correct,
      wrong,
      accuracy: Math.round((correct / questions.length) * 100),
    });

    setStage('results');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') checkAnswer();
  };

  const correct = results.filter(r => r.isCorrect).length;
  const wrong = results.filter(r => !r.isCorrect).length;
  const accuracy = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;

  return (
    <div className="test-page">

      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <AnimatePresence mode="wait">
          {/* SETUP */}
          {stage === 'setup' && (
            <motion.div
              key="setup"
              className="test-setup"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <h1>
                <span className="gradient-text">Test</span> Mode
              </h1>
              <p>Evaluate your knowledge with a timed quiz from your uploaded content.</p>

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

                  <div className="setup-field">
                    <label>Test Direction</label>
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

                  <div className="setup-field">
                    <label>Number of Questions</label>
                    <div className="question-count-options">
                      {[10, 20, 30].map(n => (
                        <button
                          key={n}
                          className={`count-option ${questionCount === n ? 'active' : ''}`}
                          onClick={() => setQuestionCount(n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={startTest}
                    disabled={!contentId}
                  >
                    Start Test
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {/* TEST */}
          {stage === 'test' && questions[currentQ] && (
            <motion.div
              key="test"
              className="test-active"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              {/* Progress */}
              <div className="test-progress-bar">
                <motion.div
                  className="test-progress-fill"
                  animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="test-progress-info">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span className="test-score-mini">
                  <span className="mini-correct">{correct}</span> /
                  <span className="mini-wrong">{wrong}</span>
                </span>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ}
                  className="test-question-card "
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="question-type-badge">{questions[currentQ].type}</span>
                  <div className="question-term">
                    {questions[currentQ].type === 'fill-blank' ? questions[currentQ].term : (testDirections[currentQ] === 'term-to-def' ? questions[currentQ].term : questions[currentQ].definition)}
                  </div>
                  <p className="question-prompt">
                    {questions[currentQ].type === 'fill-blank'
                      ? 'Fill in the blank:'
                      : (testDirections[currentQ] === 'term-to-def' ? 'What does this mean?' : 'What is the term?')}
                  </p>

                  {questions[currentQ].type === 'fill-blank' && (
                    <div className="fill-blank-context" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: 'var(--r-md)', fontSize: '0.85rem', color: 'var(--w40)', width: '100%', lineHeight: '1.6', marginBottom: '16px' }}>{questions[currentQ].definition}</div>
                  )}

                  <div className={`test-input-wrap ${feedback || ''}`}>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer..."
                      disabled={feedback !== null}
                      className="test-input"
                      autoFocus
                      autoComplete="off"
                    />
                  </div>

                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        className={`test-feedback ${feedback}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {feedback === 'correct' ? (
                          <>
                            <CheckCircle2 size={18} />
                            <span>Correct!</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={18} />
                            <div>
                              <span>Correct answer: </span>
                              <strong>
                                {questions[currentQ].type === 'fill-blank'
                                  ? questions[currentQ].term
                                  : (testDirections[currentQ] === 'term-to-def' ? questions[currentQ].definition : questions[currentQ].term)}
                              </strong>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!feedback && (
                    <Button variant="primary" onClick={checkAnswer} disabled={!userAnswer.trim()}>
                      Submit Answer
                    </Button>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* RESULTS */}
          {stage === 'results' && (
            <motion.div
              key="results"
              className="test-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2>Test Complete!</h2>

              <div className="results-summary">
                <div className="result-stat main-accuracy">
                  <div className="accuracy-circle">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <motion.circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="url(#grad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={264}
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * accuracy / 100) }}
                        transition={{ delay: 0.3, duration: 1.5, ease: 'easeOut' }}
                        transform="rotate(-90 50 50)"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="accuracy-number">{accuracy}%</span>
                  </div>
                  <span className="result-label">Accuracy</span>
                </div>

                <div className="result-stat">
                  <span className="result-value correct-color">{correct}</span>
                  <span className="result-label">Correct</span>
                </div>
                <div className="result-stat">
                  <span className="result-value wrong-color">{wrong}</span>
                  <span className="result-label">Wrong</span>
                </div>
                <div className="result-stat">
                  <span className="result-value">{questions.length}</span>
                  <span className="result-label">Total</span>
                </div>
              </div>

              {/* Wrong answers review */}
              {results.filter(r => !r.isCorrect).length > 0 && (
                <div className="wrong-review">
                  <h3>Review Mistakes</h3>
                  <div className="wrong-list">
                    {results.filter(r => !r.isCorrect).map((r, i) => (
                      <div key={i} className="wrong-item glass">
                        <div className="wrong-term">
                          {r.item.type === 'fill-blank' ? r.item.term : (r.direction === 'term-to-def' ? r.item.term : r.item.definition)}
                        </div>
                        <div className="wrong-your-answer">You said: {r.userAnswer}</div>
                        <div className="wrong-correct-answer">Correct: {r.item.type === 'fill-blank' ? r.item.term : (r.direction === 'term-to-def' ? r.item.definition : r.item.term)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="results-actions">
                <Button variant="primary" icon={<RotateCcw size={16} />} onClick={() => setStage('setup')}>
                  Take Another Test
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
