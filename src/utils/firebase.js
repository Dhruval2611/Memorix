/* ============================================
   Firebase Configuration
   ============================================ */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqIVbQrkpYHdwbUPlnOv6PvS2IM3ARa_U",
  authDomain: "memorix-84986.firebaseapp.com",
  projectId: "memorix-84986",
  storageBucket: "memorix-84986.firebasestorage.app",
  messagingSenderId: "676233780144",
  appId: "1:676233780144:web:fd7b10ae2d85cca5279475",
  measurementId: "G-PF6VVV1N75"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
