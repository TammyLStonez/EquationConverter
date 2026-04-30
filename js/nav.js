// js/nav.js
// Renders the shared navigation bar and wires up sign-out.

import { logOut, onAuth } from "./auth.js";

export function initNav(activePage) {
  const nav = document.getElementById("nav");
  if (!nav) return;

  nav.innerHTML = `
    <a class="nav-logo" href="/app.html">
      <div class="nav-logo-icon">∑</div>
      <span class="nav-logo-text">Eq<span>Convert</span></span>
    </a>
    <div class="nav-links" id="nav-links">
      <a class="nav-link ${activePage==='app'?'active':''}" href="/app.html">Convert</a>
      <a class="nav-link ${activePage==='history'?'active':''}" href="/history.html">History</a>
      <span class="nav-user" id="nav-user">…</span>
      <button class="nav-link nav-signout" id="nav-signout">Sign out</button>
    </div>
  `;

  onAuth(user => {
    const el = document.getElementById("nav-user");
    if (el && user) {
      el.textContent = user.displayName || user.email || "Signed in";
    }
  });

  document.getElementById("nav-signout")?.addEventListener("click", async () => {
    await logOut();
    window.location.href = "/index.html";
  });
}
