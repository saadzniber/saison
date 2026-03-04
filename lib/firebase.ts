'use client';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

function getFirebaseApp(): FirebaseApp {
  if (!firebaseConfig.apiKey) throw new Error('Firebase not configured: check .env.local');
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const getDb = () => getFirestore(getFirebaseApp());
export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const googleProvider = new GoogleAuthProvider();
