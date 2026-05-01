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
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
// ─────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
