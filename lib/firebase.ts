import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBG8f9iq4xzOFbbV_NieY9HO9-uTh6dX0",
  authDomain: "solo-leveling-system-d3ee3.firebaseapp.com",
  projectId: "solo-leveling-system-d3ee3",
  storageBucket: "solo-leveling-system-d3ee3.firebasestorage.app",
  messagingSenderId: "674585954136",
  appId: "1:674585954136:web:1a1c3b43c9e7c6a99ec72d",
  measurementId: "G-FFSJX6EDEP"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
