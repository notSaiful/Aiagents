import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gemini-notes-kwn2b",
  appId: "1:818945879107:web:9f9c94f8cd364ec44078f6",
  storageBucket: "gemini-notes-kwn2b.firebasestorage.app",
  apiKey: "AIzaSyBbQt8GbMEAojJaFfVKGUGBhm64SUNFpNQ",
  authDomain: "gemini-notes-kwn2b.firebaseapp.com",
  messagingSenderId: "818945879107",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
