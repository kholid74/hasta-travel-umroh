import { expect, type Page } from "@playwright/test";
import { roles, type UserRole } from "../../content/admin/roles";

export type DemoRoleId = UserRole;

/**
 * Enter the workspace as a demo role through the "Pilih Akses Demo" gateway.
 * Every UI spec uses this helper so the entry mechanism lives in one place.
 * `?switch=1` keeps the gateway visible even when a session already exists.
 */
export async function enterAs(page: Page, role: UserRole = "SUPERADMIN", persona?: string) {
  const def = roles[role];
  await page.goto("/admin/login?switch=1");
  await expect(page.locator(".gateway[data-ready=true]")).toBeVisible();
  const card = page.getByRole("form", { name: `Akses ${def.label}` });
  if (persona) await card.getByRole("combobox").selectOption(persona);
  await card.getByRole("button", { name: new RegExp(`^(Masuk|Lanjutkan) sebagai ${def.shortLabel}$`) }).click();
  await expect(page).toHaveURL(new RegExp(`${def.home}$`));
}
