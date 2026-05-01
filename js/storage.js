// js/storage.js
// Saves conversion metadata (name, date, stats) to Firestore.
// No file storage — Firebase Storage is not used.
// Files are downloaded directly in the browser at conversion time.

import { db } from "./firebase.js";
import {
  collection, addDoc, query, where, orderBy,
  getDocs, deleteDoc, doc, Timestamp, limit,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const COLLECTION = "conversions";
const TTL_DAYS   = 30;

// ── Save a conversion record ──────────────────────────────────
export async function saveConversion(uid, originalName, stats) {
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000)
  );
  const outputName = originalName.replace(/\.docx$/i, '_unicode.docx');

  const docRef = await addDoc(collection(db, COLLECTION), {
    uid,
    originalName,
    outputName,
    parasChanged: stats.parasChanged,
    eqsFound:     stats.eqsFound,
    createdAt:    Timestamp.now(),
    expiresAt,
  });

  return { id: docRef.id, outputName, expiresAt };
}

// ── Fetch history for a user ──────────────────────────────────
export async function fetchHistory(uid, maxItems = 50) {
  const q = query(
    collection(db, COLLECTION),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Delete a single record ────────────────────────────────────
export async function deleteConversion(conversionId) {
  await deleteDoc(doc(db, COLLECTION, conversionId));
}

// ── Purge expired records (called on every app load) ──────────
export async function purgeExpired(uid) {
  const now = Timestamp.now();
  const q   = query(
    collection(db, COLLECTION),
    where("uid",       "==", uid),
    where("expiresAt", "<=", now)
  );
  const snap = await getDocs(q);
  await Promise.allSettled(
    snap.docs.map(d => deleteDoc(doc(db, COLLECTION, d.id)))
  );
  return snap.size;
}

// ── Formatting helpers ────────────────────────────────────────
export function daysUntilExpiry(expiresAt) {
  const ms = expiresAt.toDate() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function formatDate(timestamp) {
  return timestamp.toDate().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
