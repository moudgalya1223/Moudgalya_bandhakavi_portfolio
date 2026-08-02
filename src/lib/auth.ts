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

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;
  if (adminUid && user.uid === adminUid) return true;
  // If email matches Moudgalya's developer email
  if (user.email === 'dattamoudgalyabandhakavi@gmail.com') return true;
  // Default to true if no adminUid specified in env
  return !adminUid;
}

export function getUserRole(user: User | null): 'admin' | 'client' | 'none' {
  if (!user) return 'none';
  if (isAdmin(user)) return 'admin';
  return 'client';
}
