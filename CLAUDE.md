# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tako is a browser extension for GitHub that provides a fast inline, expandable file tree with file preview. Built as a Chrome/Firefox WebExtension (Manifest V3) that runs as a content script on github.com repository pages.

## Development Commands

```bash
# Development with hot reload
yarn dev

# Production build
yarn build

# Clean build artifacts
yarn clean
```

## Architecture

### Entry Point & Lifecycle
- `src/content.tsx` is the content script entry point
- Runs on `document_start` for all github.com repo pages
- Two main render paths:
  1. `renderTokenPrompt()` - if no GitHub token stored
  2. `renderTako()` - main app with authenticated Octokit client
- Uses `github-url-detection` to detect repo tree pages via `isRepoTree()`
- Listens to `turbo:render` events to handle GitHub's SPA navigation
- `onElementRemoval()` re-initializes if Tako element gets removed

### State Management
- Zustand store in `src/store.ts` with two key states:
  - `previewedFile` - currently previewed file (opens side panel)
  - `hoveredFile` - file user is hovering over
- Store subscription in `content.tsx` manipulates GitHub DOM:
  - Removes `.Layout` class to break GitHub's layout constraints
  - Sets `max-width: unset` on repo main element
  - Hides sidebar when file previewed

### Data Fetching
- TanStack Query for all GitHub API calls
- Two main query configs:
  - `repoContentsQueryConfig` - fetches directory contents, handles submodules detection
  - `mostRecentRepoCommitQueryConfig` - fetches latest commit info
- Prefetches root contents and latest commit before rendering
- Uses Octokit REST client with user's personal access token

### Component Structure
- `Tako.tsx` - root component, provides `TakoContext` with repository info and Octokit client
- `Contents.tsx` - recursively renders directory contents (dirs, files, submodules, symlinks)
- `Preview.tsx` - renders file preview (text/images), uses GitHub's markdown API for syntax highlighting
- `Item.tsx` - individual file/folder items with expand/collapse for directories
- Submodules get their own nested `TakoProvider` with separate repository context

### Preview System
- `Preview.tsx` determines file type: text/image/unknown
- Text files: fetches blob via `git.getBlob`, renders with GitHub markdown API for syntax highlighting
- Images: uses GitHub's raw URL (`/owner/repo/blob/ref/path?raw=true`)
- Markdown: renders as HTML via GitHub API, rewrites relative image URLs
- Line numbers generated client-side for non-markdown text files

### Repository Detection
- `getRepository()` in `content.tsx` extracts owner/repo/branch from URL
- Branch comes from URL path (`tree/{branch}`) or falls back to default branch
- Branch name is URI decoded to handle special characters

## Technical Details

- Built with Parcel using `@parcel/config-webextension`
- TypeScript with React 19
- Uses GitHub Primer CSS classes (extension runs in GitHub DOM context)
- WebExtension Polyfill for cross-browser compatibility
- Stores GitHub token in `chrome.storage.sync`
