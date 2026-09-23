import {
  createSelector,
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { createSeedItems } from "@/lib/seed";
import {
  getChildrenIndex,
  getDescendantIds,
  getNameError,
  getPath,
} from "@/lib/tree";
import {
  ROOT_ID,
  type ItemType,
  type PersistedWorkspace,
} from "@/types/workspace";

export interface WorkspaceState extends PersistedWorkspace {
  hydrated: boolean;
}

const initialState: WorkspaceState = {
  items: createSeedItems(),
  selectedFolderId: ROOT_ID,
  openFileId: null,
  expandedIds: [ROOT_ID],
  hydrated: false,
};

function expand(state: WorkspaceState, id: string) {
  if (!state.expandedIds.includes(id)) state.expandedIds.push(id);
}

function expandAncestors(state: WorkspaceState, id: string) {
  for (const ancestor of getPath(state.items, id).slice(0, -1)) {
    expand(state, ancestor.id);
  }
}

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    createItem: {
      reducer(
        state,
        action: PayloadAction<{
          id: string;
          parentId: string;
          name: string;
          type: ItemType;
          now: number;
        }>,
      ) {
        const { id, parentId, name, type, now } = action.payload;
        if (state.items[parentId]?.type !== "folder") return;
        if (getNameError(state.items, parentId, name)) return;

        const base = { id, name, parentId, createdAt: now, updatedAt: now };
        state.items[id] =
          type === "folder"
            ? { ...base, type }
            : { ...base, type, content: "" };
        expand(state, parentId);
      },
      prepare(payload: { parentId: string; name: string; type: ItemType }) {
        return {
          payload: {
            ...payload,
            name: payload.name.trim(),
            id: nanoid(),
            now: Date.now(),
          },
        };
      },
    },

    renameItem: {
      reducer(
        state,
        action: PayloadAction<{ id: string; name: string; now: number }>,
      ) {
        const { id, name, now } = action.payload;
        const item = state.items[id];
        if (!item || item.parentId === null) return;
        if (getNameError(state.items, item.parentId, name, id)) return;

        item.name = name;
        item.updatedAt = now;
      },
      prepare(payload: { id: string; name: string }) {
        return {
          payload: { ...payload, name: payload.name.trim(), now: Date.now() },
        };
      },
    },

    deleteItem(state, action: PayloadAction<string>) {
      const item = state.items[action.payload];
      if (!item || item.parentId === null) return;

      const parentId = item.parentId;
      const removed = new Set([
        item.id,
        ...getDescendantIds(state.items, item.id),
      ]);
      for (const id of removed) delete state.items[id];

      if (removed.has(state.selectedFolderId)) {
        state.selectedFolderId = parentId;
      }
      if (state.openFileId && removed.has(state.openFileId)) {
        state.openFileId = null;
      }
      state.expandedIds = state.expandedIds.filter((id) => !removed.has(id));
    },

    updateFileContent: {
      reducer(
        state,
        action: PayloadAction<{ id: string; content: string; now: number }>,
      ) {
        const { id, content, now } = action.payload;
        const item = state.items[id];
        if (item?.type !== "file") return;

        item.content = content;
        item.updatedAt = now;
      },
      prepare(payload: { id: string; content: string }) {
        return { payload: { ...payload, now: Date.now() } };
      },
    },

    selectFolder(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.items[id]?.type !== "folder") return;

      state.selectedFolderId = id;
      expandAncestors(state, id);
      expand(state, id);
    },

    openFile(state, action: PayloadAction<string>) {
      const item = state.items[action.payload];
      if (item?.type !== "file") return;

      state.openFileId = item.id;
      state.selectedFolderId = item.parentId ?? ROOT_ID;
      expandAncestors(state, item.id);
    },

    closeFile(state) {
      state.openFileId = null;
    },

    toggleExpand(state, action: PayloadAction<string>) {
      const index = state.expandedIds.indexOf(action.payload);
      if (index === -1) state.expandedIds.push(action.payload);
      else state.expandedIds.splice(index, 1);
    },

    hydrate(state, action: PayloadAction<PersistedWorkspace | null>) {
      if (action.payload) Object.assign(state, action.payload);
      state.hydrated = true;
    },
  },
  selectors: {
    selectItems: (state) => state.items,
    selectSelectedFolderId: (state) => state.selectedFolderId,
    selectOpenFileId: (state) => state.openFileId,
    selectExpandedIds: (state) => state.expandedIds,
    selectHydrated: (state) => state.hydrated,
  },
});

export const {
  createItem,
  renameItem,
  deleteItem,
  updateFileContent,
  selectFolder,
  openFile,
  closeFile,
  toggleExpand,
  hydrate,
} = workspaceSlice.actions;

export const {
  selectItems,
  selectSelectedFolderId,
  selectOpenFileId,
  selectExpandedIds,
  selectHydrated,
} = workspaceSlice.selectors;

export const selectChildrenIndex = createSelector(
  [selectItems],
  getChildrenIndex,
);

export default workspaceSlice.reducer;
