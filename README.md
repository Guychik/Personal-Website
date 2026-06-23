# Personal Website

Guy Gilad's personal site and blog — *"a tiny stand, somewhere on the internet."*

A dependency-free static site: plain HTML, CSS, and vanilla JavaScript. There is
**no build step and no framework**. Posts are markdown files rendered in the
browser, and the whole thing is served as static assets on Cloudflare.

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
- **Clean URLs, one shell.** [index.html](index.html) is the single page for
  the whole site. Cloudflare serves it for any path that isn't a real file
  (the `single-page-application` fallback in [wrangler.jsonc](wrangler.jsonc)),
  and [blog.js](blog.js) reads the URL path to decide what to show: `/` renders
  the home listing, `/about` (or `/folder/slug`) renders that post. A
  `<base href="/">` tag keeps relative fetches working under nested paths.

## Files

| Path | Purpose |
| --- | --- |
| [index.html](index.html) | The single shell — renders the home listing at `/` and any post at `/<slug>`. |
| [sidebar.html](sidebar.html) | Sidebar markup, loaded dynamically into each page. |
| [home.md](home.md) | The short intro shown at the top of the home page. |
| [blog.js](blog.js) | Routes on the URL path; renders the post list, a post, and the home intro. |
| [script.js](script.js) | Loads the sidebar and builds the folder-tree navigation. |
| [style.css](style.css) | All styling. |
| [posts/](posts/) | Markdown posts + `posts.json` manifest. |
| [posts/posts.json](posts/posts.json) | Post metadata and folder structure. |
| [imgs/](imgs/) | Images (profile photo, post images). |
| [wrangler.jsonc](wrangler.jsonc) | Cloudflare static-assets config (incl. the clean-URL fallback). |

## Run locally

Use Wrangler — it serves the site exactly as Cloudflare does, including the
clean-URL fallback. (A plain static server like `python3 -m http.server` won't
resolve `/about`, because it doesn't do the SPA fallback.)

```bash
npx wrangler dev
```

Then open the printed `http://localhost:8787/` and try `/`, `/about`, etc.

## Add a post

Create a markdown file in [posts/](posts/) and add an entry to
[posts/posts.json](posts/posts.json). The full walkthrough — top-level posts,
folders, nesting, and images — lives in [posts/README.md](posts/README.md).

## Deploy

The site is served from Cloudflare as static assets (see
[wrangler.jsonc](wrangler.jsonc)). Push to `main` to publish.
