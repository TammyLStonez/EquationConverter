# EqConvert — Setup Guide

A LaTeX → Unicode document converter web app built with vanilla HTML/CSS/JS and Firebase.

---

## Project Structure

```
eqconvert/
├── index.html        ← Sign-in / sign-up page
├── app.html          ← Main converter (protected)
├── history.html      ← Conversion history (protected)
├── css/style.css     ← Shared design system
├── js/
│   ├── firebase.js   ← ⚠ Add your Firebase config here
│   ├── auth.js       ← Email + Google auth
│   ├── converter.js  ← LaTeX → Unicode engine
│   ├── storage.js    ← Firestore + Storage operations
│   └── nav.js        ← Shared navigation
└── netlify.toml      ← Routing rules
```

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `eqconvert`) → Continue
3. Disable Google Analytics if you don't need it → **Create project**

---

## Step 2 — Enable Authentication

1. In the Firebase Console sidebar → **Authentication** → **Get started**
2. Under **Sign-in method**, enable:
   - **Email/Password** → toggle on → Save
   - **Google** → toggle on → add your support email → Save

---

## Step 3 — Create Firestore Database

1. Sidebar → **Firestore Database** → **Create database**
2. Choose **Start in production mode** → select a region → Done
3. Go to **Rules** tab and replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversions/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

4. **Publish** the rules.

5. To enable **automatic 30-day deletion**: go to **Indexes** → **TTL policies** → **Add TTL policy**:
   - Collection: `conversions`
   - Field: `expiresAt`
   - Click **Save**

---

## Step 4 — Enable Firebase Storage

1. Sidebar → **Storage** → **Get started**
2. Choose **Start in production mode** → select a region → Done
3. Go to **Rules** tab and replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

4. **Publish** the rules.

5. To enable **automatic 30-day file deletion**:
   - Storage console → **Lifecycle** (or go to Google Cloud Console → Cloud Storage → your bucket → Lifecycle)
   - Add a rule: Delete objects older than **30 days**

---

## Step 5 — Add Firebase Config to the App

1. Firebase Console → Project Settings (gear icon) → **General**
2. Scroll to **Your apps** → click the `</>` (web) icon → register the app
3. Copy the `firebaseConfig` object
4. Open `js/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc123"
};
```

5. Also add your Netlify domain to Firebase Auth's **Authorized domains**:
   - Authentication → Settings → Authorized domains → **Add domain**
   - Add: `your-app-name.netlify.app`

---

## Step 6 — Deploy to Netlify

```bash
# In the eqconvert/ folder:
git init
git add .
git commit -m "Initial commit"

# Push to GitHub, then in Netlify:
# New site → Import from GitHub → select repo
# Build command: (leave blank)
# Publish directory: (leave blank — root)
# Deploy site
```

That's it — your app is live!

---

## How the 30-day Cleanup Works

| Layer        | Mechanism                                      |
|--------------|------------------------------------------------|
| Firestore    | TTL policy on the `expiresAt` field            |
| Storage      | Bucket lifecycle rule (delete after 30 days)   |
| App-side     | `purgeExpired()` runs on every app load        |

All three layers work together so nothing is left behind.
