# How to add a blog post

No build tools. Posts are markdown files in this folder, organized by
`posts.json`. The blog page shows a folder list on the left and the posts
inside the selected folder on the right.

`posts.json` looks like this:

```json
{
  "posts":   [ ...top-level posts... ],
  "folders": [ { "name": "Ideas", "posts": [ ...posts in this folder... ] } ]
}
```

---

## Add a regular (top-level) post

1. Create `posts/my-slug.md` and write in markdown.
2. Add an entry to the **`posts`** array in `posts.json`:

   ```json
   {
     "slug": "my-slug",
     "title": "My title",
     "date": "2026-06-20",
     "summary": "A short blurb shown in the list."
   }
   ```

It shows up under **🏠 All posts**.

---

## Add a post inside a folder

1. Put the markdown file in a matching subfolder, e.g.
   `posts/ideas/my-note.md`.
2. Add it to that folder's `posts` array. The `slug` is the path **without**
   the `.md`, so it includes the folder:

   ```json
   {
     "name": "Ideas",
     "posts": [
       {
         "slug": "ideas/my-note",
         "title": "My note",
         "date": "2026-06-20",
         "summary": "Lives in the Ideas folder."
       }
     ]
   }
   ```

### Add a brand-new folder

Add another object to the `folders` array with a `name` and a `posts` list:

```json
{ "name": "Travel", "posts": [] }
```

Folders can also nest — give a folder its own `folders` array.

---

## Rules of thumb

- `slug` must match the markdown file path under `posts/`, minus `.md`.
- `date` is `YYYY-MM-DD`. Posts are shown newest-first automatically.
- Add an image: drop it in `imgs/` and use `![alt](imgs/photo.jpg)`.

## Publish

Commit and push to `main` — GitHub Pages redeploys automatically.

Preview locally first by running a server from the project root:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/blog.html
