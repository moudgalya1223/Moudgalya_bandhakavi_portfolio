'use client';

import { auth, googleProvider } from './firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// Allowed admin emails list
const ADMIN_EMAILS = [
  'dattu99rockstar@gmail.com',
  'dattamoudgalyabandhakavi@gmail.com'
];

export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  
  const userEmail = user.email.toLowerCase().trim();
  const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;
  
  if (adminUid && user.uid === adminUid) return true;
  
  // Strict check: Only dattu99rockstar@gmail.com (and developer email) have admin privileges
  return ADMIN_EMAILS.includes(userEmail);
}

export function getUserRole(user: User | null): 'admin' | 'client' | 'none' {
  if (!user) return 'none';
  if (isAdmin(user)) return 'admin';
  return 'client';
}
