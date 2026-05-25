/* ============================================
   Storage Utility — localStorage wrapper
   ============================================ */

const STORAGE_KEYS = {
  CONTENT_LIBRARY: 'memorix_content_library',
  LEARNING_STATE: 'memorix_learning_state',
  USER_STATS: 'memorix_user_stats',
  SESSION_HISTORY: 'memorix_session_history',
};

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Storage save error:', e);
    return false;
  }
}

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Storage load error:', e);
    return fallback;
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// Content Library
export function getContentLibrary() {
  return loadFromStorage(STORAGE_KEYS.CONTENT_LIBRARY, []);
}

export function saveContentLibrary(library) {
  return saveToStorage(STORAGE_KEYS.CONTENT_LIBRARY, library);
}

export function addContentItem(item) {
  const library = getContentLibrary();
  const newItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
  };
  library.push(newItem);
  saveContentLibrary(library);
  return newItem;
}

export function deleteContentItem(id) {
  const library = getContentLibrary().filter(item => item.id !== id);
  saveContentLibrary(library);
  // Also clean up learning state for this content
  const state = getLearningState();
  delete state[id];
  saveLearningState(state);
}

// Learning State
export function getLearningState() {
  return loadFromStorage(STORAGE_KEYS.LEARNING_STATE, {});
}

export function saveLearningState(state) {
  return saveToStorage(STORAGE_KEYS.LEARNING_STATE, state);
}

export function getLearningStateForContent(contentId) {
  const state = getLearningState();
  return state[contentId] || {};
}

export function saveLearningStateForContent(contentId, contentState) {
  const state = getLearningState();
  state[contentId] = contentState;
  saveLearningState(state);
}

// User Stats
export function getUserStats() {
  return loadFromStorage(STORAGE_KEYS.USER_STATS, {
    totalSessions: 0,
    totalCorrect: 0,
    totalWrong: 0,
    streak: 0,
    lastPracticeDate: null,
    masteredItems: 0,
  });
}

export function updateUserStats(updates) {
  const stats = getUserStats();
  const updated = { ...stats, ...updates };

  // Streak logic
  const today = new Date().toDateString();
  const lastDate = stats.lastPracticeDate ? new Date(stats.lastPracticeDate).toDateString() : null;

  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastDate === yesterday.toDateString()) {
      updated.streak = (stats.streak || 0) + 1;
    } else if (lastDate !== today) {
      updated.streak = 1;
    }
    updated.lastPracticeDate = new Date().toISOString();
  }

  saveToStorage(STORAGE_KEYS.USER_STATS, updated);
  return updated;
}

// Session History
export function getSessionHistory() {
  return loadFromStorage(STORAGE_KEYS.SESSION_HISTORY, []);
}

export function addSessionRecord(record) {
  const history = getSessionHistory();
  history.unshift({
    ...record,
    timestamp: new Date().toISOString(),
  });
  // Keep last 50 sessions
  if (history.length > 50) history.pop();
  saveToStorage(STORAGE_KEYS.SESSION_HISTORY, history);
}

export { STORAGE_KEYS };
