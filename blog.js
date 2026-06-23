// Blog logic for the single-shell site (index.html). The DOMContentLoaded
// router reads the URL path: "/" shows the home post list, "/<slug>" renders
// that post. No build step: posts are markdown files in posts/, organized in
// posts/posts.json, and rendered in the browser with marked.js.
//
// posts.json shape:
//   {
//     "posts":   [ { slug, title, date, summary }, ... ],   // top-level posts
//     "folders": [ { name, posts: [...], folders: [...] }, ... ]  // folders (can nest)
//   }
// A flat array (the old format) is also accepted and treated as top-level posts.

function formatDate(iso) {
  // iso is "YYYY-MM-DD"; render as e.g. "June 13, 2026"
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function sortByDate(posts) {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date)); // newest first
}

async function loadManifest() {
  const res = await fetch("posts/posts.json", { cache: "no-store" });
  const data = await res.json();
  // Accept the old flat-array format for backwards compatibility.
  if (Array.isArray(data)) return { posts: data, folders: [] };
  return { posts: data.posts || [], folders: data.folders || [] };
}

// Every post anywhere in the tree — used to look up a post's metadata by slug.
function allPosts(manifest) {
  const out = [...(manifest.posts || [])];
  (function walk(folders) {
    (folders || []).forEach((f) => {
      out.push(...(f.posts || []));
      walk(f.folders);
    });
  })(manifest.folders);
  return out;
}

// The chain of folder names containing a post, e.g. ["Ideas", "Sub"].
// Returns null for a top-level post (not in any folder).
function folderPathOf(manifest, slug) {
  let found = null;
  (function walk(folders, trail) {
    for (const f of folders || []) {
      if (found) return;
      const here = [...trail, f.name];
      if ((f.posts || []).some((p) => p.slug === slug)) {
        found = here;
        return;
      }
      walk(f.folders, here);
    }
  })(manifest.folders, []);
  return found;
}

// Turn a slug (which may contain "/") into a safe file path, blocking "..".
function postFilePath(slug) {
  const segments = slug.split("/").filter(Boolean);
  if (segments.some((s) => s === "..")) throw new Error(`Unsafe slug: ${slug}`);
  return "posts/" + segments.map(encodeURIComponent).join("/") + ".md";
}

// Slug -> clean URL, e.g. "ideas/my-note" -> "/ideas/my-note".
function postUrl(slug) {
  return "/" + slug.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

// Current URL path -> slug, e.g. "/ideas/my-note" -> "ideas/my-note".
// Returns null at the site root (the home page).
function slugFromPath() {
  const path = decodeURIComponent(window.location.pathname).replace(/^\/+|\/+$/g, "");
  return path || null;
}

// --- Home page (index.html): a flat list of every post, newest first ----
// Folder navigation lives in the sidebar; this is just the blog landing.
async function renderListing() {
  const root = document.getElementById("post-list");
  if (!root) return;

  try {
    const manifest = await loadManifest();
    const posts = sortByDate(allPosts(manifest));
    if (!posts.length) {
      root.innerHTML = "<p>No posts yet. Check back soon.</p>";
      return;
    }
    root.innerHTML = posts
      .map(
        (p) => `
      <article class="post-summary">
        <h3><a href="${postUrl(p.slug)}">${p.title}</a></h3>
        <time class="post-date">${formatDate(p.date)}</time>
        <p>${p.summary || ""}</p>
      </article>`
      )
      .join("");
  } catch (err) {
    console.error("Failed to load blog index:", err);
    root.innerHTML = "<p>Couldn't load posts.</p>";
  }
}

// --- Single post page (/slug) -------------------------------------------
async function renderPost(slug) {
  const container = document.getElementById("post-content");
  if (!container) return;

  try {
    const manifest = await loadManifest();
    const meta = allPosts(manifest).find((p) => p.slug === slug);

    // The manifest is the source of truth. An unknown slug is a 404 — bail
    // before fetching, because the SPA fallback returns index.html (200) for
    // any missing file, which would otherwise render as garbage markdown.
    if (!meta) {
      document.title = "Not found";
      container.innerHTML = "<p>Post not found. <a href='/'>Back home</a>.</p>";
      return;
    }

    const res = await fetch(postFilePath(slug), { cache: "no-store" });
    if (!res.ok) throw new Error(`Post not found: ${slug}`);
    const markdown = await res.text();
    // Same guard for the markdown file itself: if it's missing, the fallback
    // hands back the index.html shell rather than a 404.
    if (markdown.trimStart().startsWith("<!DOCTYPE")) {
      throw new Error(`Markdown missing for ${slug}`);
    }

    document.title = meta.title;
    const dateEl = document.getElementById("post-meta-date");
    if (dateEl) dateEl.textContent = formatDate(meta.date);

    // If the post lives in a folder, show that folder path above it.
    const folderEl = document.getElementById("post-folder");
    const path = folderPathOf(manifest, slug);
    if (folderEl && path) folderEl.textContent = path.join(" / ");

    container.innerHTML = marked.parse(markdown);
  } catch (err) {
    console.error("Failed to load post:", err);
    container.innerHTML = "<p>Couldn't load this post. <a href='/'>Back home</a>.</p>";
  }
}

// --- Home intro (index.html): a short description from home.md ----------
async function renderHomeIntro() {
  const el = document.getElementById("home-intro");
  if (!el) return;
  try {
    const res = await fetch("home.md", { cache: "no-store" });
    const md = res.ok ? await res.text() : "";
    if (!md.trim()) {
      el.remove(); // nothing to show
      return;
    }
    el.innerHTML = marked.parse(md);
  } catch (err) {
    console.error("Failed to load home intro:", err);
    el.remove();
  }
}

// Route on the URL path: "/" is the home page, anything else is a post.
window.addEventListener("DOMContentLoaded", () => {
  const slug = slugFromPath();
  const homeView = document.getElementById("home-view");
  const postView = document.getElementById("post-view");

  if (slug) {
    if (homeView) homeView.hidden = true;
    if (postView) postView.hidden = false;
    renderPost(slug);
  } else {
    if (postView) postView.hidden = true;
    if (homeView) homeView.hidden = false;
    renderHomeIntro();
    renderListing();
  }
});
