// js/firebase.js
// ─────────────────────────────────────────────────────────────
// Firebase configuration — replace the values below with your
// own project's config from the Firebase Console:
// Project Settings → General → Your Apps → SDK setup & config
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ── ⚠ Replace with your Firebase project config ──────────────
const firebaseConfig = {
  apiKey: "AIzaSyCcSg1VwEG9eUvhb5Tvf-SmToOi7OhkcbA",
  authDomain: "eqconvert-7371f.firebaseapp.com",
  projectId: "eqconvert-7371f",
  storageBucket: "eqconvert-7371f.firebasestorage.app",
  messagingSenderId: "560238940023",
  appId: "1:560238940023:web:407fd05a267752b800db72",
  measurementId: "G-N4TG1KV1G3"
};
// ─────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
