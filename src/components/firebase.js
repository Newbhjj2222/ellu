// src/components/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9yWK7qWFxtZE8NBWnlDg0QG0MXRjHdQ0",
  authDomain: "elluminate-904ac.firebaseapp.com",
  projectId: "elluminate-904ac",
  storageBucket: "elluminate-904ac.appspot.com",
  messagingSenderId: "954424892485",
  appId: "1:954424892485:web:6596511e522e87101b572c",
};

// Initialize Firebase app (prevent multiple in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore instance
export const db = getFirestore(app);

// Firebase Auth instance
export const auth = getAuth(app);

export default app;