import {
  ROOT_ID,
  ROOT_NAME,
  type FileItem,
  type FolderItem,
  type ItemsMap,
} from "@/types/workspace";

const SEED_TIME = Date.UTC(2026, 0, 1);

const folder = (
  id: string,
  name: string,
  parentId: string | null,
): FolderItem => ({
  id,
  name,
  parentId,
  type: "folder",
  createdAt: SEED_TIME,
  updatedAt: SEED_TIME,
});

const file = (
  id: string,
  name: string,
  parentId: string,
  content: string,
): FileItem => ({
  id,
  name,
  parentId,
  type: "file",
  content,
  createdAt: SEED_TIME,
  updatedAt: SEED_TIME,
});

export function createSeedItems(): ItemsMap {
  const items = [
    folder(ROOT_ID, ROOT_NAME, null),
    folder("projects", "Projects", ROOT_ID),
    folder("webbly", "Webbly", "projects"),
    file(
      "notes",
      "notes.txt",
      "webbly",
      "Webbly notes\n\n- Landing page draft is ready for review.\n",
    ),
    file(
      "tasks",
      "tasks.txt",
      "webbly",
      "- [ ] Finish navbar\n- [ ] Write copy\n- [x] Set up repo\n",
    ),
    folder("personal", "Personal", "projects"),
    folder("documents", "Documents", ROOT_ID),
    file(
      "readme",
      "README.txt",
      ROOT_ID,
      "Welcome to your workspace.\n\nCreate folders and text files from the main panel.\n",
    ),
  ];
  return Object.fromEntries(items.map((item) => [item.id, item]));
}
