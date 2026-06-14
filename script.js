// Loads the sidebar into every page, then builds the navigation tree under
// the "Guy Gilad" headline from posts/posts.json.
//
// The nav is the only navigation pane. Top-level posts sit directly in it
// (alongside About); folders show a triangle and reveal their posts. Folders
// open on hover for a quick peek, and a click pins them open so you can move
// the mouse onto the post inside.

async function loadSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;
  try {
    const res = await fetch("sidebar.html", { cache: "no-store" });
    container.innerHTML = await res.text();
    await buildNav();
  } catch (err) {
    console.error("Failed to load sidebar:", err);
  }
}

async function buildNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;

  let manifest = { posts: [], folders: [] };
  try {
    const res = await fetch("posts/posts.json", { cache: "no-store" });
    const data = await res.json();
    manifest = Array.isArray(data)
      ? { posts: data, folders: [] }
      : { posts: data.posts || [], folders: data.folders || [] };
  } catch (err) {
    console.error("Failed to load posts.json for nav:", err);
  }

  // About is a post too, but it gets a fixed link at the top of the nav, so
  // don't repeat it in the listed top-level posts below.
  const topPosts = (manifest.posts || []).filter((p) => p.slug !== "about");

  nav.innerHTML = `
    <ul class="nav-tree">
      <li><a href="post.html?post=about">About</a></li>
      ${navLevel(topPosts, manifest.folders)}
    </ul>`;

  // Click a folder label to pin it open (hover still works as a quick peek).
  nav.querySelectorAll("li.is-expandable > .nav-folder").forEach((label) => {
    label.addEventListener("click", () => {
      label.parentElement.classList.toggle("open");
    });
  });
}

// A folder's date is the newest post date anywhere inside it (recursively),
// so a folder sorts by its most recent post.
function folderDate(folder) {
  let newest = "";
  (folder.posts || []).forEach((p) => {
    if (p.date > newest) newest = p.date;
  });
  (folder.folders || []).forEach((f) => {
    const d = folderDate(f);
    if (d > newest) newest = d;
  });
  return newest;
}

// Render one level: posts and folders merged into a single list, newest first.
function navLevel(posts, folders) {
  const entries = [
    ...(posts || []).map((p) => ({ date: p.date || "", html: postLi(p) })),
    ...(folders || []).map((f) => ({ date: folderDate(f), html: folderLi(f) })),
  ];
  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries.map((e) => e.html).join("");
}

// A leaf link to a single post.
function postLi(p) {
  return `<li><a href="post.html?post=${encodeURIComponent(p.slug)}">${p.title}</a></li>`;
}

// A folder, expandable, with its children (sub-folders + posts) sorted too.
function folderLi(f) {
  return `
    <li class="is-expandable">
      <span class="nav-folder"><span class="folder-arrow"></span>${f.name}</span>
      <ul>${navLevel(f.posts, f.folders)}</ul>
    </li>`;
}

window.addEventListener("DOMContentLoaded", loadSidebar);
