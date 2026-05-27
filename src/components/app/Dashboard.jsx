import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, Brain, Flame, TrendingUp, Trash2, Clock, Upload, Plus, Edit3 } from 'lucide-react';
import Button from '../ui/Button';
import GlowCard from '../ui/GlowCard';
import ScrollReveal, { ScrollRevealItem } from '../animations/ScrollReveal';
import { getContentLibrary, deleteContentItem, getUserStats, getSessionHistory } from '../../utils/storage';
import { calculateStats, createLearningState } from '../../utils/adaptiveEngine';
import { getLearningStateForContent } from '../../utils/storage';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setLibrary(getContentLibrary());
    setUserStats(getUserStats());
    setHistory(getSessionHistory());
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Delete this content and all its learning data?')) {
      deleteContentItem(id);
      setLibrary(getContentLibrary());
    }
  };

  const getContentStats = (content) => {
    const state = getLearningStateForContent(content.id);
    if (!content.items) return { mastered: 0, learning: 0, new: content.itemCount, weak: 0, accuracy: 0 };
    return calculateStats(content.items, state);
  };

  return (
    <div className="dashboard-page">

      <div className="container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1>
              Your <span className="gradient-text">Dashboard</span>
            </h1>
            <p>Track your progress and manage your learning content.</p>
          </div>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/upload')}
          >
            Upload Content
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="quick-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="quick-stat glass">
            <div className="qs-icon" style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' }}>
              <Target size={18} />
            </div>
            <div className="qs-info">
              <span className="qs-value">{userStats.totalCorrect || 0}</span>
              <span className="qs-label">Total Correct</span>
            </div>
          </div>
          <div className="quick-stat glass">
            <div className="qs-icon" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)' }}>
              <BookOpen size={18} />
            </div>
            <div className="qs-info">
              <span className="qs-value">{library.length}</span>
              <span className="qs-label">Content Sets</span>
            </div>
          </div>
          <div className="quick-stat glass">
            <div className="qs-icon" style={{ background: 'rgba(248, 113, 113, 0.15)', color: 'var(--accent-red)' }}>
              <Flame size={18} />
            </div>
            <div className="qs-info">
              <span className="qs-value">{userStats.streak || 0}</span>
              <span className="qs-label">Day Streak</span>
            </div>
          </div>
          <div className="quick-stat glass">
            <div className="qs-icon" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
              <TrendingUp size={18} />
            </div>
            <div className="qs-info">
              <span className="qs-value">{userStats.totalSessions || 0}</span>
              <span className="qs-label">Sessions</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <GlowCard glowColor="purple" className="action-card" onClick={() => navigate('/practice')}>
            <Brain size={24} />
            <h3>Practice Mode</h3>
            <p>Adaptive learning</p>
          </GlowCard>
          <GlowCard glowColor="blue" className="action-card" onClick={() => navigate('/test')}>
            <Target size={24} />
            <h3>Test Mode</h3>
            <p>Evaluate knowledge</p>
          </GlowCard>
          <GlowCard glowColor="cyan" className="action-card" onClick={() => navigate('/upload')}>
            <Upload size={24} />
            <h3>Upload</h3>
            <p>Add new content</p>
          </GlowCard>
          <GlowCard glowColor="green" className="action-card" onClick={() => navigate('/read')}>
            <Edit3 size={24} />
            <h3>Study & Edit</h3>
            <p>Manage your sets</p>
          </GlowCard>
        </motion.div>

        {/* Content Library */}
        <motion.div
          className="content-library"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <h2>Content Library</h2>

          {library.length === 0 ? (
            <div className="empty-library glass">
              <BookOpen size={40} className="empty-icon" />
              <h3>No content yet</h3>
              <p>Upload your first learning material to get started.</p>
              <Button variant="primary" onClick={() => navigate('/upload')}>
                Upload Content
              </Button>
            </div>
          ) : (
            <div className="library-grid">
              {library.map((content) => {
                const stats = getContentStats(content);
                return (
                  <div key={content.id} className="library-item glass">
                    <div className="library-item-header">
                      <h3>{content.title}</h3>
                      <button
                        className="library-delete"
                        onClick={() => handleDelete(content.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="library-meta">
                      <span>{content.itemCount} items</span>
                      <span>•</span>
                      <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="library-stats-row">
                      <div className="lib-stat">
                        <span className="lib-stat-val mastered">{stats.mastered}</span>
                        <span className="lib-stat-label">Mastered</span>
                      </div>
                      <div className="lib-stat">
                        <span className="lib-stat-val learning">{stats.learning}</span>
                        <span className="lib-stat-label">Learning</span>
                      </div>
                      <div className="lib-stat">
                        <span className="lib-stat-val new-items">{stats.new}</span>
                        <span className="lib-stat-label">New</span>
                      </div>
                    </div>
                    <div className="library-actions">
                      <button className="lib-action-btn" onClick={() => navigate('/practice')}>
                        <Brain size={14} /> Practice
                      </button>
                      <button className="lib-action-btn" onClick={() => navigate('/test')}>
                        <Target size={14} /> Test
                      </button>
                      <button className="lib-action-btn" onClick={() => navigate('/read', { state: { contentId: content.id } })}>
                        <Edit3 size={14} /> Study
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Sessions */}
        {history.length > 0 && (
          <motion.div
            className="recent-sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <h2>Recent Sessions</h2>
            <div className="sessions-list">
              {history.slice(0, 8).map((session, i) => (
                <div key={i} className="session-item glass">
                  <div className="session-icon">
                    {session.type === 'test' ? <Target size={16} /> : <Brain size={16} />}
                  </div>
                  <div className="session-info">
                    <span className="session-type">{session.type === 'test' ? 'Test' : 'Practice'}</span>
                    <span className="session-date">
                      {new Date(session.timestamp).toLocaleDateString()} at{' '}
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="session-result">
                    <span className="session-accuracy">{session.accuracy}%</span>
                    <span className="session-detail">{session.correct}/{session.correct + session.wrong}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
