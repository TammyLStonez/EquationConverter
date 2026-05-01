# EqConvert — Setup Guide

LaTeX → Unicode document converter. Vanilla HTML/CSS/JS + Firebase Auth + Firestore.
No Firebase Storage required — files are processed and downloaded entirely in the browser.

---

## Project Structure

```
eqconvert/
├── index.html        ← Sign-in / sign-up (email + Google)
├── app.html          ← Main converter (auth-protected)
├── history.html      ← Conversion history (auth-protected)
├── css/style.css     ← Shared design system
├── js/
│   ├── firebase.js   ← ⚠ Add your Firebase config here
│   ├── auth.js       ← Email/password + Google sign-in
│   ├── converter.js  ← LaTeX → Unicode engine + .docx processor
│   ├── storage.js    ← Firestore metadata (no file storage)
│   └── nav.js        ← Shared navigation bar
└── netlify.toml      ← Routing rules for Netlify
```

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `eqconvert`) → **Create project**

---

## Step 2 — Enable Authentication

1. Sidebar → **Authentication** → **Get started**
2. Under **Sign-in method**, enable:
   - **Email/Password** → toggle on → Save
   - **Google** → toggle on → add your support email → Save

---

## Step 3 — Create Firestore Database

1. Sidebar → **Firestore Database** → **Create database**
2. Choose **Start in production mode** → select a region → Done
3. Go to the **Rules** tab and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversions/{docId} {
      allow read, delete: if request.auth != null
                          && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

4. **Publish** the rules.

5. **Enable 30-day auto-deletion (TTL policy):**
   - Firestore → **Indexes** tab → **TTL policies** → **Add TTL policy**
   - Collection group: `conversions`
   - Field path: `expiresAt`
   - Click **Save**

---

## Step 4 — Add Firebase Config

1. Firebase Console → **Project Settings** (gear icon) → **General**
2. Scroll to **Your apps** → click `</>` → register a web app
3. Copy the `firebaseConfig` object
4. Open `js/firebase.js` and replace the placeholders:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc"
};
```

5. Add your Netlify domain to **Authorized domains**:
   - Authentication → **Settings** → **Authorized domains** → **Add domain**
   - Add: `your-app.netlify.app`

---

## Step 5 — Deploy to Netlify

```bash
# Inside the eqconvert/ folder
git init
git add .
git commit -m "Initial commit"
# Push to GitHub, then in Netlify:
# New site → Import from GitHub → select repo
# Build command:     (leave blank)
# Publish directory: (leave blank)
# → Deploy site
```

Future updates auto-deploy when you push to GitHub.

---

## How the 30-day Cleanup Works

| Layer        | Mechanism                                         |
|--------------|---------------------------------------------------|
| Firestore    | TTL policy on the `expiresAt` field (set above)   |
| App-side     | `purgeExpired()` runs on every app load           |

No Firebase Storage is used — converted files live only in the user's browser
and are downloaded immediately after conversion.

---

## Converter — What It Handles

| Category           | Examples                                              |
|--------------------|-------------------------------------------------------|
| Greek letters      | `\alpha` → α, `\Omega` → Ω                          |
| Operators          | `\times` → ×, `\sum` → ∑, `\int` → ∫               |
| Relations          | `\leq` → ≤, `\approx` → ≈, `\equiv` → ≡            |
| Arrows             | `\rightarrow` → →, `\implies` → ⟹, `\iff` → ⟺    |
| Fractions          | `\frac{1}{2}` → ½, `\frac{a}{b}` → a⁄b             |
| Roots              | `\sqrt{x}` → √x, `\sqrt[3]{x}` → ∛x               |
| Superscripts       | `x^{2}` → x², `E^{n}` → Eⁿ                         |
| Subscripts         | `H_{2}O` → H₂O, `x_{i}` → xᵢ                      |
| Temperature        | `^\circ C` → °C, `^\circ F` → °F                   |
| Delimiters         | `\left(` → (, `\langle` → ⟨                         |
| Accents            | `\hat{x}` → x̂, `\vec{v}` → v⃗                     |
| Environments       | `\begin{equation}`, `align`, `gather`, `multline`   |
| All 4 delimiters   | `$…$`, `$$…$$`, `\(…\)`, `\[…\]`                  |
| Currency guard     | `$50` and `$1,200` are left untouched               |
