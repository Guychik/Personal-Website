# Personal Website

Guy Gilad's personal site and blog — *"a tiny stand, somewhere on the internet."*

A dependency-free static site: plain HTML, CSS, and vanilla JavaScript. There is
**no build step and no framework**. Posts are markdown files rendered in the
browser, and the whole thing deploys to GitHub Pages on every push to `main`.

## How it works

- **Posts are markdown.** Each post is a `.md` file under [posts/](posts/).
  They're rendered client-side with [marked](https://marked.js.org/), loaded
  from a CDN — nothing is precompiled.
- **`posts/posts.json` is the manifest.** It lists every post's metadata
  (slug, title, date, summary) and organizes posts into (optionally nested)
  folders. See [posts/README.md](posts/README.md) for the full format.
- **The sidebar builds itself.** [script.js](script.js) injects
  [sidebar.html](sidebar.html) into every page and builds a folder-tree
  navigation from the manifest (folders expand on hover, pin open on click).
- **Two pages share one script.** [blog.js](blog.js) drives both the home
  listing and individual posts; which one runs depends on the elements present
  on the page.

## Files

| Path | Purpose |
| --- | --- |
| [index.html](index.html) | Home page — intro + a flat list of all posts, newest first. |
| [post.html](post.html) | Single-post view (`post.html?post=<slug>`). |
| [sidebar.html](sidebar.html) | Sidebar markup, loaded dynamically into each page. |
| [home.md](home.md) | The short intro shown at the top of the home page. |
| [blog.js](blog.js) | Loads the manifest, renders the post list, a post, and the home intro. |
| [script.js](script.js) | Loads the sidebar and builds the folder-tree navigation. |
| [style.css](style.css) | All styling. |
| [posts/](posts/) | Markdown posts + `posts.json` manifest. |
| [posts/posts.json](posts/posts.json) | Post metadata and folder structure. |
| [imgs/](imgs/) | Images (profile photo, post images). |
| [.github/workflows/static.yml](.github/workflows/static.yml) | GitHub Pages deploy workflow. |

## Run locally

Because pages fetch markdown and JSON over HTTP, opening the files directly
(`file://`) won't work — serve them over a local web server from the project
root:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/

## Add a post

Create a markdown file in [posts/](posts/) and add an entry to
[posts/posts.json](posts/posts.json). The full walkthrough — top-level posts,
folders, nesting, and images — lives in [posts/README.md](posts/README.md).

## Deploy

Push to `main`. The
[GitHub Pages workflow](.github/workflows/static.yml) uploads the entire
repository and publishes it automatically — no build, no extra steps.
