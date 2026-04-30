// js/auth.js
// Handles: email/password sign-up & sign-in, Google OAuth,
//          sign-out, auth state observer, and page guard.

import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

// ── Public API ────────────────────────────────────────────────

export async function signUp(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  return cred.user;
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
}

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function currentUser() {
  return auth.currentUser;
}

// ── Page guard ────────────────────────────────────────────────
// Call requireAuth() at the top of any protected page.
// If the user is not signed in, redirect to index.html.
export function requireAuth(onReady) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "/index.html";
    } else {
      onReady(user);
    }
  });
}

// ── Redirect if already signed in ─────────────────────────────
// Call on index.html so signed-in users skip the login page.
export function redirectIfAuthed(destination = "/app.html") {
  return onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = destination;
  });
}

// ── Friendly error messages ────────────────────────────────────
export function authErrorMessage(code) {
  const map = {
    "auth/email-already-in-use":    "An account with this email already exists.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/weak-password":           "Password must be at least 6 characters.",
    "auth/user-not-found":          "No account found with this email.",
    "auth/wrong-password":          "Incorrect password. Please try again.",
    "auth/invalid-credential":      "Incorrect email or password.",
    "auth/too-many-requests":       "Too many failed attempts. Please try again later.",
    "auth/popup-closed-by-user":    "Google sign-in was cancelled.",
    "auth/network-request-failed":  "Network error. Check your connection.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
