// Shared blog logic for the home post list (index.html) and single-post page (post.html).
// No build step: posts are markdown files in posts/, organized in posts/posts.json,
// and rendered in the browser with marked.js.
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
        <h3><a href="post.html?post=${encodeURIComponent(p.slug)}">${p.title}</a></h3>
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

// --- Single post page (post.html?post=slug) -----------------------------
async function renderPost() {
  const container = document.getElementById("post-content");
  if (!container) return;

  const slug = new URLSearchParams(window.location.search).get("post");
  if (!slug) {
    container.innerHTML = "<p>No post specified. <a href='index.html'>Back home</a>.</p>";
    return;
  }

  try {
    const manifest = await loadManifest();
    const meta = allPosts(manifest).find((p) => p.slug === slug);

    const res = await fetch(postFilePath(slug));
    if (!res.ok) throw new Error(`Post not found: ${slug}`);
    const markdown = await res.text();

    if (meta) {
      document.title = meta.title;
      const dateEl = document.getElementById("post-meta-date");
      if (dateEl) dateEl.textContent = formatDate(meta.date);
    }

    // If the post lives in a folder, show that folder path above it.
    const folderEl = document.getElementById("post-folder");
    const path = folderPathOf(manifest, slug);
    if (folderEl && path) folderEl.textContent = path.join(" / ");

    container.innerHTML = marked.parse(markdown);
  } catch (err) {
    console.error("Failed to load post:", err);
    container.innerHTML = "<p>Couldn't load this post. <a href='index.html'>Back home</a>.</p>";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderListing();
  renderPost();
});
