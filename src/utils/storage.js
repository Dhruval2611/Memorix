/* ============================================
   Storage Utility — localStorage + Firestore sync
   ============================================ */
import { db, auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  CONTENT_LIBRARY: 'memorix_content_library',
  LEARNING_STATE: 'memorix_learning_state',
  USER_STATS: 'memorix_user_stats',
  SESSION_HISTORY: 'memorix_session_history',
};

// ─── Core localStorage helpers ───

export function getCurrentUser() {
  const fbUser = auth.currentUser;
  return fbUser ? fbUser.uid : (localStorage.getItem('memorix_current_user') || 'guest');
}

function getPrefixedKey(key) {
  const user = getCurrentUser();
  return `${user}_${key}`;
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(getPrefixedKey(key), JSON.stringify(data));
    // Fire-and-forget sync to Firestore
    syncToCloud(key, data);
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

// ─── Firestore Cloud Sync ───

function syncToCloud(key, data) {
  const user = auth.currentUser;
  if (!user) return; // Not logged in via Firebase, skip sync
  
  const docRef = doc(db, 'users', user.uid, 'data', key);
  setDoc(docRef, { value: JSON.stringify(data), updatedAt: new Date().toISOString() })
    .catch(err => console.warn('Cloud sync failed:', err.message));
}

export async function pullFromCloud() {
  const user = auth.currentUser;
  if (!user) return;

  const keys = Object.values(STORAGE_KEYS);
  
  await Promise.all(keys.map(async (key) => {
    try {
      const docRef = doc(db, 'users', user.uid, 'data', key);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudData = snap.data().value;
        const localKey = `${user.uid}_${key}`;
        // Only overwrite if local is empty or cloud is newer
        const localRaw = localStorage.getItem(localKey);
        if (!localRaw || localRaw === 'null' || localRaw === '[]' || localRaw === '{}') {
          localStorage.setItem(localKey, cloudData);
        }
      }
    } catch (err) {
      console.warn(`Cloud pull failed for ${key}:`, err.message);
    }
  }));
}

// Force push all local data to cloud (useful after signup/migration)
export async function pushAllToCloud() {
  const user = auth.currentUser;
  if (!user) return;

  const keys = Object.values(STORAGE_KEYS);
  for (const key of keys) {
    const localKey = `${user.uid}_${key}`;
    const raw = localStorage.getItem(localKey);
    if (raw && raw !== 'null') {
      try {
        const docRef = doc(db, 'users', user.uid, 'data', key);
        await setDoc(docRef, { value: raw, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn(`Cloud push failed for ${key}:`, err.message);
      }
    }
  }
}

// ─── Content Library ───

export function getAllContent() {
  return loadFromStorage(STORAGE_KEYS.CONTENT_LIBRARY, []);
}

export function getContentLibrary() {
  return getAllContent().filter(item => !item.deletedAt);
}

export function getRecycleBin() {
  return getAllContent().filter(item => item.deletedAt);
}

export function saveContentLibrary(library) {
  return saveToStorage(STORAGE_KEYS.CONTENT_LIBRARY, library);
}

export function addContentItem(item) {
  const library = getAllContent();
  const newItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
  };
  library.push(newItem);
  saveContentLibrary(library);
  return newItem;
}

export function softDeleteContentItem(id) {
  const library = getAllContent();
  const index = library.findIndex(item => item.id === id);
  if (index !== -1) {
    library[index].deletedAt = new Date().toISOString();
    saveContentLibrary(library);
  }
}

export function restoreContentItem(id) {
  const library = getAllContent();
  const index = library.findIndex(item => item.id === id);
  if (index !== -1) {
    delete library[index].deletedAt;
    saveContentLibrary(library);
  }
}

export function deleteContentItem(id) {
  const library = getAllContent().filter(item => item.id !== id);
  saveContentLibrary(library);
  const state = getLearningState();
  delete state[id];
  saveLearningState(state);
}

export function updateContentItem(id, updatedSet) {
  const library = getAllContent();
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

// ─── Learning State ───

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

// ─── User Stats ───

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

// ─── Session History ───

export function getSessionHistory() {
  return loadFromStorage(STORAGE_KEYS.SESSION_HISTORY, []);
}

export function addSessionRecord(record) {
  const history = getSessionHistory();
  history.unshift({
    ...record,
    timestamp: new Date().toISOString(),
  });
  if (history.length > 50) history.pop();
  saveToStorage(STORAGE_KEYS.SESSION_HISTORY, history);
}

export { STORAGE_KEYS };
