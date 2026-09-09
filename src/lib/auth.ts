import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface AuthState {
  user: User | null;
  /** True only when signed in AND listed in the `admins` collection. */
  isAdmin: boolean;
  loading: boolean;
}

/**
 * App-wide auth state. An account only counts as admin if a document exists at
 * `admins/{uid}` — created manually in the Firebase console.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, isAdmin: false, loading: false });
        return;
      }
      let isAdmin = false;
      try {
        isAdmin = (await getDoc(doc(db, 'admins', user.uid))).exists();
      } catch {
        isAdmin = false;
      }
      setState({ user, isAdmin, loading: false });
    });
  }, []);

  return state;
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Could not sign in. Please try again.';
  }
}
