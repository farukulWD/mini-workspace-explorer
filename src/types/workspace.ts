export const ROOT_ID = "root";
export const ROOT_NAME = "Workspace";

export type ItemType = "folder" | "file";

interface BaseItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface FolderItem extends BaseItem {
  type: "folder";
}

export interface FileItem extends BaseItem {
  type: "file";
  content: string;
}

export type WorkspaceItem = FolderItem | FileItem;

export type ItemsMap = Record<string, WorkspaceItem>;

export interface PersistedWorkspace {
  items: ItemsMap;
  selectedFolderId: string;
  openFileId: string | null;
  expandedIds: string[];
}
