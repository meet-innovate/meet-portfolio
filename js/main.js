/* ==========================
   Meet Portfolio - main.js
   ========================== */

(function () {
  "use strict";

  // ===== CONFIG =====
  const GITHUB_USERNAME = "meet-innovate";
  const MAX_REPOS = 6;

  // ===== HELPERS =====
  const $ = (sel) => document.querySelector(sel);

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[m])
    );
  }

  // ===== FOOTER YEAR =====
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== MOBILE MENU =====
  const menuBtn = $(".menu-btn");
  const mobileMenu = $(".mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.classList.toggle("open");
      mobileMenu.setAttribute("aria-hidden", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
      });
    });
  }

  // ===== REVEAL ON SCROLL =====
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  // ===== GITHUB PROJECTS =====
  async function loadGitHubRepos() {
    const grid = $("#github-projects");
    const status = $("#github-status");
    if (!grid || !status) return;

    status.textContent = "Loading GitHub projects…";

    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(
          GITHUB_USERNAME
        )}/repos?per_page=100&sort=pushed`
      );

      if (!res.ok) throw new Error(`GitHub repos error: ${res.status}`);
      const repos = await res.json();

      const cleaned = repos
        .filter((r) => !r.fork && !r.archived)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, MAX_REPOS);

      if (cleaned.length === 0) {
        status.textContent = "No public repos found.";
        return;
      }

      grid.innerHTML = cleaned
        .map((r) => {
          const name = escapeHtml(r.name);
          const desc = escapeHtml(r.description || "No description yet.");
          const lang = escapeHtml(r.language || "Project");
          const updated = formatDate(r.pushed_at);
          const stars = r.stargazers_count ?? 0;

          const demoLink = r.homepage
            ? `<a class="btn btn-small" href="${escapeHtml(
                r.homepage
              )}" target="_blank" rel="noreferrer">Demo</a>`
            : "";

          return `
            <article class="card reveal">
              <h3>${name}</h3>
              <p class="muted">${desc}</p>

              <div class="tags">
                <span>${lang}</span>
                <span>★ ${stars}</span>
                <span>Updated ${updated}</span>
              </div>

              <div class="card-actions">
                ${demoLink}
                <a class="btn btn-small btn-ghost"
                   href="${escapeHtml(r.html_url)}"
                   target="_blank" rel="noreferrer">Code</a>
              </div>
            </article>
          `;
        })
        .join("");

      grid.querySelectorAll(".reveal").forEach((el) => io.observe(el));
      status.textContent = `Showing ${cleaned.length} recent repos from @${GITHUB_USERNAME}.`;
    } catch (err) {
      console.error(err);
      status.textContent = "Couldn’t load GitHub projects right now.";
    }
  }

  // ===== LIVE GITHUB STATS =====
  async function loadGitHubStats() {
    try {
      const reposEl = document.getElementById("ghRepos");
      const followersEl = document.getElementById("ghFollowers");
      const starsEl = document.getElementById("ghStars");

      if (!reposEl || !followersEl || !starsEl) return;

      const userRes = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}`
      );
      if (!userRes.ok) throw new Error("GitHub user fetch failed");
      const user = await userRes.json();

      const reposRes = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`
      );
      if (!reposRes.ok) throw new Error("GitHub repos fetch failed");
      const repos = await reposRes.json();

      const totalStars = Array.isArray(repos)
        ? repos.reduce((sum, r) => sum + (r?.stargazers_count || 0), 0)
        : 0;

      reposEl.textContent = user.public_repos ?? "—";
      followersEl.textContent = user.followers ?? "—";
      starsEl.textContent = totalStars;
    } catch (e) {
      console.warn("GitHub stats failed", e);
    }
  }

  // ===== INIT =====
  loadGitHubRepos();
  loadGitHubStats();
    // ===== INIT =====
  loadGitHubRepos();
  loadGitHubStats();

  // ===== CURSOR DOT (smooth follow) =====
  const dot = document.querySelector(".cursor-dot");

  if (dot) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateDot() {
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;

      dot.style.left = dotX + "px";
      dot.style.top = dotY + "px";

      requestAnimationFrame(animateDot);
    }

    animateDot();
  }

})();
