'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, googleProvider, getDb } from './firebase';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const db = getDb();
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              uid: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || '',
              email: data.email || firebaseUser.email || '',
              photoUrl: data.photoUrl || firebaseUser.photoURL || '',
              familyId: data.familyId || undefined,
              starredRecipes: data.starredRecipes || [],
              createdAt: data.createdAt?.toDate(),
            });
          } else {
            const newUser: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoUrl: firebaseUser.photoURL || '',
              starredRecipes: [],
            };
            await setDoc(userRef, {
              ...newUser,
              createdAt: serverTimestamp(),
            });
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await fbSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
