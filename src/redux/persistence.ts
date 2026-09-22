import { getPath } from "@/lib/tree";
import {
  ROOT_ID,
  type ItemsMap,
  type PersistedWorkspace,
  type WorkspaceItem,
} from "@/types/workspace";
import { hydrate } from "./features/workspaceSlice";
import type { AppStore } from "./store";

export const STORAGE_KEY = "mwe:v1";
const SAVE_DELAY_MS = 500;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isItem(id: string, value: unknown): value is WorkspaceItem {
  if (!isRecord(value)) return false;
  const hasBase =
    value.id === id &&
    typeof value.name === "string" &&
    (value.parentId === null || typeof value.parentId === "string") &&
    typeof value.createdAt === "number" &&
    typeof value.updatedAt === "number";
  if (!hasBase) return false;
  return (
    value.type === "folder" ||
    (value.type === "file" && typeof value.content === "string")
  );
}

export function sanitizeWorkspace(value: unknown): PersistedWorkspace | null {
  if (!isRecord(value) || !isRecord(value.items)) return null;

  const candidates: ItemsMap = Object.fromEntries(
    Object.entries(value.items).filter(
      (entry): entry is [string, WorkspaceItem] => isItem(entry[0], entry[1]),
    ),
  );
  const root = candidates[ROOT_ID];
  if (root?.type !== "folder" || root.parentId !== null) return null;

  const items: ItemsMap = Object.fromEntries(
    Object.entries(candidates).filter(([id]) => {
      const path = getPath(candidates, id);
      return (
        path[0]?.id === ROOT_ID &&
        path.slice(0, -1).every((ancestor) => ancestor.type === "folder")
      );
    }),
  );

  const isFolderId = (id: unknown): id is string =>
    typeof id === "string" && items[id]?.type === "folder";

  return {
    items,
    selectedFolderId: isFolderId(value.selectedFolderId)
      ? value.selectedFolderId
      : ROOT_ID,
    openFileId:
      typeof value.openFileId === "string" &&
      items[value.openFileId]?.type === "file"
        ? value.openFileId
        : null,
    expandedIds: Array.isArray(value.expandedIds)
      ? [...new Set(value.expandedIds.filter(isFolderId))]
      : [ROOT_ID],
  };
}

export function loadWorkspace(): PersistedWorkspace | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeWorkspace(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function saveWorkspace(data: PersistedWorkspace) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Could not save workspace to localStorage.", error);
  }
}

function pickPersisted({
  items,
  selectedFolderId,
  openFileId,
  expandedIds,
}: PersistedWorkspace): PersistedWorkspace {
  return { items, selectedFolderId, openFileId, expandedIds };
}

function hasChanged(a: PersistedWorkspace, b: PersistedWorkspace): boolean {
  return (
    a.items !== b.items ||
    a.selectedFolderId !== b.selectedFolderId ||
    a.openFileId !== b.openFileId ||
    a.expandedIds !== b.expandedIds
  );
}

export function setupPersistence(store: AppStore): () => void {
  store.dispatch(hydrate(loadWorkspace()));

  let last = pickPersisted(store.getState().workspace);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timer === null) return;
    clearTimeout(timer);
    timer = null;
    saveWorkspace(last);
  };

  const unsubscribe = store.subscribe(() => {
    const next = pickPersisted(store.getState().workspace);
    if (!hasChanged(last, next)) return;
    last = next;
    timer ??= setTimeout(flush, SAVE_DELAY_MS);
  });
  window.addEventListener("pagehide", flush);

  return () => {
    unsubscribe();
    window.removeEventListener("pagehide", flush);
    flush();
  };
}
