/* ============================================
   Storage Utility — localStorage wrapper
   ============================================ */

const STORAGE_KEYS = {
  CONTENT_LIBRARY: 'memorix_content_library',
  LEARNING_STATE: 'memorix_learning_state',
  USER_STATS: 'memorix_user_stats',
  SESSION_HISTORY: 'memorix_session_history',
  USERS: 'memorix_users_auth_v2',
};

export function getCurrentUser() {
  return localStorage.getItem('memorix_current_user') || 'guest';
}

function getPrefixedKey(key) {
  if (key === STORAGE_KEYS.USERS) return key; // Global key, not prefixed by user
  const user = getCurrentUser();
  return `${user}_${key}`;
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(getPrefixedKey(key), JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Storage save error:', e);
    return false;
  }
}

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(getPrefixedKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Storage load error:', e);
    return fallback;
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(getPrefixedKey(key));
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

export function updateContentItem(id, updatedSet) {
  const library = getContentLibrary();
  const index = library.findIndex(item => item.id === id);
  if (index !== -1) {
    library[index] = { 
      ...library[index], 
      ...updatedSet, 
      itemCount: updatedSet.items ? updatedSet.items.length : library[index].itemCount 
    };
    saveContentLibrary(library);
    return library[index];
  }
  return null;
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

// Authentication / Users
export function getAllUsers() {
  return loadFromStorage(STORAGE_KEYS.USERS, []);
}

export function registerUser(username, password, email) {
  const users = getAllUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) return false; // Already exists
  users.push({ username, password, email });
  saveToStorage(STORAGE_KEYS.USERS, users);
  return true;
}

export function verifyLogin(username, password) {
  const users = getAllUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
}

export function getUserByEmail(email) {
  const users = getAllUsers();
  return users.find(u => u.email === email);
}

export function resetPassword(username, newPassword) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (index !== -1) {
    users[index].password = newPassword;
    saveToStorage(STORAGE_KEYS.USERS, users);
    return true;
  }
  return false;
}

export { STORAGE_KEYS };
