# Mini Workspace Explorer

A browser-based file explorer: nested folders and text files with create, rename, delete, search, and an inline editor. Everything is stored in the browser — no backend.

**Live demo:** [mini-workspace-explorer-psi.vercel.app](https://mini-workspace-explorer-psi.vercel.app/)

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Redux Toolkit · Tailwind CSS v4

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`.

## Features

- **Tree sidebar** — nested folders, expand/collapse, selected folder highlighted, full keyboard navigation.
- **Breadcrumb** — `Workspace / Projects / Webbly`, every segment clickable.
- **Main panel** — contents of the selected folder; folders navigate, files open in the editor.
- **Create / rename / delete** — inline inputs with validation; deleting a folder removes its whole subtree.
- **Text editor** — `<textarea>` with a local draft, Save button, unsaved indicator.
- **Search** — debounced, workspace-wide, across all depths; results show the parent path and jump to the item.
- **Persistence** — the workspace survives a refresh via `localStorage`.

## Architecture

| Path | Responsibility |
| --- | --- |
| `src/types/workspace.ts` | `WorkspaceItem`, `ItemsMap`, `ROOT_ID` |
| `src/lib/tree.ts` | Pure tree helpers — `getChildren`, `getPath`, `getDescendantIds`, `searchItems`, `getNameError` |
| `src/lib/seed.ts` | Seed workspace used on first load |
| `src/redux/features/workspaceSlice.ts` | State and reducers |
| `src/redux/persistence.ts` | `localStorage` load/save |
| `src/components/` | `layout/`, `tree/`, `editor/`, `search/`, `ui/` |

The workspace is a **flat map keyed by id**, with each item pointing at its `parentId`, rather than a nested tree. Lookups, renames, and content updates are O(1) and never rewrite the structure; all recursion (children, path, descendants, search) lives in the pure helpers in `src/lib/tree.ts`, which keeps the reducers small and the tree logic easy to test.

### Persistence

State is written to `localStorage` under the key `mwe:v1`, debounced by 500 ms and flushed on `pagehide`. On load, `sanitizeWorkspace()` validates the stored shape and drops any item that is not reachable from the root through folders; corrupt or missing data falls back to the seed workspace. Hydration happens on the client behind `HydrationGate`, so the server and first client render always match.

## Edge-case decisions

| Case | Behaviour |
| --- | --- |
| Duplicate name | Blocked with an inline error. Case-insensitive and trimmed, scoped to the same folder only. |
| Empty folder | Empty state with "New folder" / "New file" buttons. |
| Empty workspace | Same empty state, worded for the root ("Your workspace is empty."). |
| Delete a folder with contents | Confirm dialog naming how many nested items go with it. |
| Delete the selected folder | Selection moves to the deleted folder's parent; an open file inside the subtree closes. |
| Deeply nested search hit | Result shows the full parent path, and clicking it expands every ancestor in the tree. |
| No search results | "No matches." An empty query hides the result list entirely. |
| Unsaved editor changes | Confirm before a draft is destroyed — opening another file from the tree, list, or search — plus a `beforeunload` warning. Navigating between **folders** keeps the editor open, so it does not prompt; nothing is lost. |

The root folder cannot be renamed or deleted.

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Cmd/Ctrl + K` | Focus search |
| `Cmd/Ctrl + Alt + N` | New file in the selected folder |
| `Cmd/Ctrl + S` | Save the open file |
| `Enter` / `Escape` | Confirm / cancel a name input |
| `↑` `↓` `←` `→`, `Home`, `End` | Navigate the tree; `Enter` or `Space` opens the focused item |
| `↑` `↓` + `Enter` | Move through search results and open one; `Escape` closes them |
