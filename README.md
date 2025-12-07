<div style="text-align:center;">
  <img width="50%" src="media/logo.png" alt="Tako extension logo" />
</div>

# Tako

Lightning-fast expandable file tree that integrates into GitHub's UI.

Have you ever wanted a faster way to explore a Github repository? Who hasn't!
Tako replaces the default repository file listing with an interactive file tree and integrated file preview. Never wait for a full page refresh ever again, all contents are prefetched intelligently so it's blazingly fast!

https://github.com/user-attachments/assets/785d5fe5-487f-4e63-b4c7-21e1490af200

## Features

- Blends seamlessly into GitHub's existing interface
- Click any file to view it in a side panel without page navigation
- Loads directory contents on hover for fast navigation
- Syntax highlighting, and markdown use GitHub's own rendering
- Single-child directories auto-collapse for cleaner navigation (enable in settings)
- Resolves symlinks and highlights broken ones
- Browse nested submodules as naturally as any directory

## Install

Chrome/Firefox WebExtension (Manifest V3)

Requires GitHub personal access token for API access.

## Development

```bash
pnpm install
pnpm dev
```

### Releases

Tagged releases automatically build and publish via GitHub Actions:

1. Create a tag: `git tag v1.0.0 && git push origin v1.0.0`
2. GitHub Actions builds the extension and creates a release
3. Artifact uploads to GitHub Releases and Chrome Web Store

**Chrome Web Store Setup**: Add `BPP_KEYS` secret to GitHub repo settings with your Chrome Web Store credentials. See [PlasmoHQ/bpp](https://github.com/PlasmoHQ/bpp) for setup instructions.
