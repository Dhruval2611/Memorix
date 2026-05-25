/* ============================================
   Adaptive Engine — Smart repetition algorithm
   ============================================ */

/**
 * Confidence levels:
 * 0 = never seen
 * 1 = wrong answer (high priority repeat)
 * 2 = answered once correctly (still frequent)
 * 3 = answered 2-3 times correctly (moderate frequency)
 * 4 = answered 4+ times correctly (low frequency)
 * 5 = mastered (rare appearance)
 */

const CONFIDENCE_WEIGHTS = {
  0: 10,  // Never seen — highest priority
  1: 12,  // Wrong — even higher than never seen
  2: 6,   // Once correct — still high
  3: 3,   // Getting better
  4: 1.5, // Almost mastered
  5: 0.5, // Mastered — still appears occasionally
};

/**
 * Create initial learning state for a set of items
 */
export function createLearningState(items) {
  const state = {};
  for (const item of items) {
    state[item.id] = {
      confidence: 0,
      correctCount: 0,
      wrongCount: 0,
      lastSeen: null,
      lastCorrect: null,
    };
  }
  return state;
}

/**
 * Select next item for practice using weighted random selection
 * Items with lower confidence get higher probability of appearing
 */
export function selectNextItem(items, learningState, recentIds = []) {
  if (!items || items.length === 0) return null;

  // Build weighted pool
  const pool = items.map(item => {
    const state = learningState[item.id] || { confidence: 0 };
    let weight = CONFIDENCE_WEIGHTS[state.confidence] || CONFIDENCE_WEIGHTS[0];

    // Reduce weight if recently shown (prevent immediate repetition)
    if (recentIds.includes(item.id)) {
      weight *= 0.1;
    }

    // Boost weight if wrong recently
    if (state.confidence === 1) {
      weight *= 1.5;
    }

    return { item, weight };
  });

  // Weighted random selection
  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const entry of pool) {
    random -= entry.weight;
    if (random <= 0) return entry.item;
  }

  // Fallback
  return pool[pool.length - 1].item;
}

/**
 * Update learning state after an answer
 */
export function updateItemState(learningState, itemId, isCorrect) {
  const current = learningState[itemId] || {
    confidence: 0,
    correctCount: 0,
    wrongCount: 0,
    lastSeen: null,
    lastCorrect: null,
  };

  const updated = { ...current };
  updated.lastSeen = new Date().toISOString();

  if (isCorrect) {
    updated.correctCount += 1;
    updated.lastCorrect = new Date().toISOString();

    // Increase confidence based on consecutive correct answers
    if (updated.confidence <= 1) {
      updated.confidence = 2;
    } else if (updated.confidence < 5) {
      // Only increase if they've gotten it right enough times at this level
      const threshold = updated.confidence; // Need N correct at level N
      if (updated.correctCount >= threshold) {
        updated.confidence = Math.min(5, updated.confidence + 1);
      }
    }
  } else {
    updated.wrongCount += 1;
    // Drop confidence significantly on wrong answer
    updated.confidence = 1;
    // Reset correct count for this mastery level
    updated.correctCount = Math.max(0, updated.correctCount - 2);
  }

  return {
    ...learningState,
    [itemId]: updated,
  };
}

/**
 * Generate a test set of random items
 */
export function generateTestSet(items, count) {
  if (!items || items.length === 0) return [];
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}

/**
 * Calculate overall mastery stats
 */
export function calculateStats(items, learningState) {
  if (!items || items.length === 0) {
    return { mastered: 0, learning: 0, new: 0, weak: 0, accuracy: 0 };
  }

  let mastered = 0;
  let learning = 0;
  let newItems = 0;
  let weak = 0;
  let totalCorrect = 0;
  let totalAttempts = 0;

  for (const item of items) {
    const state = learningState[item.id];
    if (!state || state.confidence === 0) {
      newItems++;
    } else if (state.confidence >= 4) {
      mastered++;
    } else if (state.confidence === 1) {
      weak++;
    } else {
      learning++;
    }

    if (state) {
      totalCorrect += state.correctCount;
      totalAttempts += state.correctCount + state.wrongCount;
    }
  }

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return { mastered, learning, new: newItems, weak, accuracy, totalCorrect, totalAttempts };
}

/**
 * Build a practice queue for the session
 */
export function buildPracticeQueue(items, learningState, size = 20) {
  const queue = [];
  const recentIds = [];

  for (let i = 0; i < size; i++) {
    const next = selectNextItem(items, learningState, recentIds.slice(-3));
    if (next) {
      queue.push(next);
      recentIds.push(next.id);
    }
  }

  return queue;
}
