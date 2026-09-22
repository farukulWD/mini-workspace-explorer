import { ROOT_ID, type ItemsMap, type WorkspaceItem } from "@/types/workspace";

export const MAX_NAME_LENGTH = 100;

const normalize = (name: string) => name.trim().toLowerCase();

export function compareItems(a: WorkspaceItem, b: WorkspaceItem): number {
  if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function getChildren(items: ItemsMap, parentId: string): WorkspaceItem[] {
  return Object.values(items)
    .filter((item) => item.parentId === parentId)
    .sort(compareItems);
}

export function getPath(items: ItemsMap, id: string): WorkspaceItem[] {
  const path: WorkspaceItem[] = [];
  const seen = new Set<string>();
  let current: WorkspaceItem | undefined = items[id];
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = current.parentId ? items[current.parentId] : undefined;
  }
  return path;
}

export function getDescendantIds(items: ItemsMap, id: string): string[] {
  const childrenByParent = new Map<string, string[]>();
  for (const item of Object.values(items)) {
    if (item.parentId === null) continue;
    const siblings = childrenByParent.get(item.parentId) ?? [];
    siblings.push(item.id);
    childrenByParent.set(item.parentId, siblings);
  }

  const result: string[] = [];
  const seen = new Set<string>([id]);
  const stack = [...(childrenByParent.get(id) ?? [])];
  while (stack.length > 0) {
    const next = stack.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    result.push(next);
    stack.push(...(childrenByParent.get(next) ?? []));
  }
  return result;
}

export function isNameTaken(
  items: ItemsMap,
  parentId: string,
  name: string,
  excludeId?: string,
): boolean {
  const target = normalize(name);
  return Object.values(items).some(
    (item) =>
      item.parentId === parentId &&
      item.id !== excludeId &&
      normalize(item.name) === target,
  );
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Name cannot be empty.";
  if (trimmed.includes("/")) return 'Name cannot contain "/".';
  if (trimmed.length > MAX_NAME_LENGTH)
    return `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  return null;
}

export function searchItems(items: ItemsMap, query: string): WorkspaceItem[] {
  const q = normalize(query);
  if (!q) return [];
  return Object.values(items)
    .filter(
      (item) => item.id !== ROOT_ID && item.name.toLowerCase().includes(q),
    )
    .sort(compareItems);
}
