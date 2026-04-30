// js/storage.js
// Upload converted .docx to Firebase Storage,
// save a history record to Firestore,
// fetch and delete history for the current user.

import { db, storage } from "./firebase.js";
import {
  collection, addDoc, query, where, orderBy, getDocs,
  deleteDoc, doc, Timestamp, limit,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const COLLECTION = "conversions";
const TTL_DAYS   = 30;                     // files expire after 30 days

// ── Upload converted file + save record ──────────────────────
export async function saveConversion(uid, blob, originalName, stats) {
  const outputName = originalName.replace(/\.docx$/i, '_unicode.docx');
  const expiresAt  = Timestamp.fromDate(
    new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000)
  );

  // Upload file to Storage at  users/{uid}/{timestamp}_{name}
  const storagePath = `users/${uid}/${Date.now()}_${outputName}`;
  const storageRef  = ref(storage, storagePath);
  await uploadBytes(storageRef, blob, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const downloadURL = await getDownloadURL(storageRef);

  // Save record to Firestore
  const docRef = await addDoc(collection(db, COLLECTION), {
    uid,
    originalName,
    outputName,
    downloadURL,
    storagePath,
    parasChanged:  stats.parasChanged,
    eqsFound:      stats.eqsFound,
    createdAt:     Timestamp.now(),
    expiresAt,
  });

  return { id: docRef.id, downloadURL, outputName, expiresAt };
}

// ── Fetch history for current user ────────────────────────────
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

// ── Delete a single conversion record + its file ──────────────
export async function deleteConversion(conversionId, storagePath) {
  // Delete Firestore record
  await deleteDoc(doc(db, COLLECTION, conversionId));
  // Delete Storage file (best-effort — may already be purged)
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (_) { /* file already gone — ignore */ }
}

// ── Purge expired records for the current user ─────────────────
// Called on app load so stale records disappear automatically.
export async function purgeExpired(uid) {
  const now = Timestamp.now();
  const q   = query(
    collection(db, COLLECTION),
    where("uid", "==", uid),
    where("expiresAt", "<=", now)
  );
  const snap = await getDocs(q);
  const deletes = snap.docs.map(d =>
    deleteConversion(d.id, d.data().storagePath)
  );
  await Promise.allSettled(deletes);
  return snap.size;           // number of records purged
}

// ── Helpers ───────────────────────────────────────────────────
export function daysUntilExpiry(expiresAt) {
  const ms   = expiresAt.toDate() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function formatDate(timestamp) {
  return timestamp.toDate().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
