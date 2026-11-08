import { navigation } from "@/content/admin/navigation";
import { actionIds, roles, type DemoAction, type Permission, type UserRole } from "@/content/admin/roles";

/** Pure access checks shared by server route guards, navigation, the store guard and tests. */
export const roleOf = (role: UserRole) => roles[role];
export const homeFor = (role: UserRole) => roles[role].home;
export const isPortalRole = (role: UserRole) => roles[role].shell === "portal";

export function moduleAccess(role: UserRole, slug: string) {
  return roles[role].modules[slug];
}
export const canAccessRoute = (role: UserRole, slug: string) => Boolean(moduleAccess(role, slug));
export const canWriteModule = (role: UserRole, slug: string) => moduleAccess(role, slug) === "write";

export function can(role: UserRole, permission: Permission) {
  if ((actionIds as readonly string[]).includes(permission)) return roles[role].actions.includes(permission as DemoAction);
  const [slug, level] = permission.split(":");
  return level === "read" ? canAccessRoute(role, slug) : canWriteModule(role, slug);
}

/** Sidebar groups filtered to the modules the role may open (order preserved from navigation.ts). */
export function navigationFor(role: UserRole) {
  return navigation
    .map(group => ({ ...group, items: group.items.filter(([slug]) => canAccessRoute(role, slug)) }))
    .filter(group => group.items.length > 0);
}
