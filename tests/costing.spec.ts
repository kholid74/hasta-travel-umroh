import { test, expect } from "@playwright/test";
import { createSeed } from "../content/admin/seed";
import type { CostItem, CostPlan } from "../content/admin/costing";
import { calculateCosting, costingMoney, costingPercent, newCosting, reviseCosting, saveCosting, saveCostScenario, saveCostTemplate } from "../lib/admin/costing";

function item(overrides: Partial<CostItem> = {}): CostItem {
  return { id: "cost-1", name: "Biaya", category: "Kategori baru", type: "person", audience: "paying", quantity: "1", unit: "orang", unitPrice: "100", currency: "IDR", exchangeRate: "1", notes: "", ...overrides };
}
function plan(overrides: Partial<CostPlan> = {}): CostPlan {
  return { payingCount: 20, focCount: 2, sellingPrice: "200", discountPerPerson: "0", notes: "", items: [item()], ...overrides };
}

test("costing calculates per person, fixed group, units and mixed currencies exactly", () => {
  expect(calculateCosting(plan()).total).toBe(BigInt(200000));
  expect(calculateCosting(plan({ items: [item({ type: "group", unitPrice: "1000" })] })).hpp).toBe(BigInt(5000));
  expect(calculateCosting(plan({ items: [item({ type: "unit", quantity: "2.5", unitPrice: "1000" })] })).total).toBe(BigInt(250000));
  const mixed = plan({ items: [
    item(), item({ id: "fixed", type: "group", unitPrice: "1000" }),
    item({ id: "usd", type: "unit", currency: "USD", unitPrice: "0.10", quantity: "3", exchangeRate: "16000.123456" }),
    item({ id: "sar", type: "unit", currency: "SAR", unitPrice: "1.25", exchangeRate: "4300" }),
  ] });
  expect(calculateCosting(mixed).total).toBe(BigInt(1317504));
  expect(costingMoney(BigInt(-123456))).toBe("−Rp 1.234,56");
  expect(calculateCosting(plan({ items: [item({ unitPrice: "0.10", quantity: "3" })] })).total).toBe(BigInt(600));
  expect(calculateCosting(plan({ items: [item({ unitPrice: "0.01", quantity: "0.5" })] })).total).toBe(BigInt(20));
});

test("costing allocates FOC costs to paying jamaah and distinguishes margin from markup", () => {
  const result = calculateCosting(plan({ items: [item({ audience: "all" }), item({ id: "foc", audience: "foc", unitPrice: "50" })] }));
  expect(result.total).toBe(BigInt(230000));
  expect(result.hpp).toBe(BigInt(11500));
  expect(result.revenue).toBe(BigInt(400000));
  expect(result.profit).toBe(BigInt(170000));
  expect(costingPercent(result.margin)).toBe("42,50%");
  expect(costingPercent(result.markup)).toBe("73,91%");
  expect(result.breakEven).toBe(BigInt(3));
  const discounted = calculateCosting(plan({ discountPerPerson: "20" }));
  expect(discounted.revenue).toBe(BigInt(360000));
  expect(discounted.profit).toBe(BigInt(160000));
  expect(costingPercent(discounted.margin)).toBe("44,44%");
  expect(costingPercent(discounted.markup)).toBe("100,00%");
  expect(calculateCosting(plan({ discountPerPerson: "200" })).margin).toBeNull();
  expect(calculateCosting(plan({ items: [item({ unitPrice: "0" })] })).markup).toBeNull();
});

test("costing rejects zero participants, negative or incomplete inputs and invalid exchange rates", () => {
  for (const payingCount of [0, -1, 1.5, NaN, Infinity, 10001]) expect(() => calculateCosting(plan({ payingCount }))).toThrow();
  expect(() => calculateCosting(plan({ focCount: -1 }))).toThrow();
  expect(() => calculateCosting(plan({ discountPerPerson: "201" }))).toThrow();
  expect(() => calculateCosting(plan({ sellingPrice: "0" }))).toThrow();
  expect(() => calculateCosting(plan({ items: [] }))).toThrow();
  for (const overrides of [
    { unitPrice: "-1" }, { unitPrice: "1.234" }, { unitPrice: "NaN" }, { quantity: "0" },
    { quantity: "1e3" }, { exchangeRate: "0" }, { exchangeRate: "-1" }, { exchangeRate: "4300" },
    { name: " " }, { category: "" }, { unit: "" }, { unitPrice: "" },
  ]) expect(() => calculateCosting(plan({ items: [item(overrides)] }))).toThrow();
  expect(() => calculateCosting(plan({ items: [item(), item()] }))).toThrow();
});

test("scenario profit, loss and break-even respect fixed units without mutating the base plan", () => {
  const source = plan({ items: [item(), item({ id: "fixed", type: "group", unitPrice: "2500" })] });
  const before = structuredClone(source);
  const results = [20, 25, 30, 35, 40].map(payingCount => calculateCosting({ ...source, payingCount }));
  expect(results[0].profit).toBe(BigInt(-50000));
  expect(results[1].profit).toBe(BigInt(0));
  expect(results[2].profit).toBe(BigInt(50000));
  expect(results[0].breakEven).toBe(BigInt(25));
  expect(calculateCosting({ ...source, sellingPrice: "100" }).breakEven).toBeNull();
  expect(calculateCosting({ ...source, sellingPrice: "50" }).breakEven).toBeNull();
  expect(source).toEqual(before);
});

test("final costing is immutable, revisions and package templates are independent snapshots", () => {
  const state = createSeed(), original = structuredClone(state);
  expect(state.costings).toHaveLength(3);
  expect(calculateCosting(state.costings[0]).profit).toBeGreaterThan(BigInt(0));
  expect(calculateCosting(state.costings[2]).profit).toBeLessThan(BigInt(0));
  const costing = state.costings[0];
  saveCosting(state, costing.id, costing, true);
  const final = structuredClone(costing);
  expect(() => saveCosting(state, costing.id, { ...costing, sellingPrice: "1" })).toThrow();
  const revision = reviseCosting(state, costing.id);
  expect(revision.revision).toBe(2);
  expect(revision.finalizedAt).toBeUndefined();
  expect(() => reviseCosting(state, costing.id)).toThrow();
  saveCosting(state, revision.id, { ...revision, items: revision.items.map(i => ({ ...i, unitPrice: "10" })) });
  expect(costing).toEqual(final);
  saveCostTemplate(state, revision.id);
  state.departures.push({ ...state.departures[0], id: "NEW-DEPARTURE" });
  const next = newCosting(state, "NEW-DEPARTURE");
  expect(next.items).toEqual(revision.items);
  next.items[0].unitPrice = "99";
  expect(revision.items[0].unitPrice).toBe("10");
  expect(state.costTemplates[0].items[0].unitPrice).toBe("10");
  saveCostScenario(state, revision.id, "Simulasi 40", { ...revision, payingCount: 40 });
  revision.items[0].unitPrice = "12";
  expect(state.costScenarios[0].items[0].unitPrice).toBe("10");
  expect(state.jamaah).toEqual(original.jamaah);
  expect(state.bookings).toEqual(original.bookings);
  expect(state.payments).toEqual(original.payments);
  expect(state.packages).toEqual(original.packages);
  expect(createSeed().costings).toEqual(original.costings);
});

test("costing UI edits components, simulates, finalizes, revises and resets the demo", async ({ page }) => {
  test.setTimeout(180000);
  const seed = createSeed(), departure = seed.departures[0];
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await page.locator(".admin-sidebar").getByRole("link", { name: "HPP & Kalkulasi Paket", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(seed.departures.length);
  await page.locator("tbody").getByRole("link", { name: new RegExp(departure.id) }).click();
  await expect(page.getByRole("heading", { name: `HPP ${departure.id}` })).toBeVisible();
  await page.getByLabel("Jamaah berbayar rencana", { exact: true }).fill("0");
  await expect(page.getByRole("button", { name: "Simpan draft", exact: true })).toBeDisabled();
  await expect(page.locator(".form-error")).toContainText("Jumlah peserta");
  await page.getByLabel("Jamaah berbayar rencana", { exact: true }).fill("35");
  await page.getByRole("button", { name: "Tambah komponen", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nama biaya", { exact: true }).fill("Biaya uji HPP");
  await dialog.getByLabel("Kategori", { exact: true }).fill("Audit demo");
  await dialog.getByRole("combobox", { name: "Tipe biaya", exact: true }).selectOption("group");
  await dialog.getByLabel("Harga satuan", { exact: true }).fill("10000001.25");
  await dialog.getByRole("button", { name: "Terapkan komponen" }).click();
  await expect(page.locator("tbody tr").filter({ hasText: "Biaya uji HPP" })).toContainText("Rp 10.000.001,25");
  await page.getByRole("button", { name: "Edit Biaya uji HPP", exact: true }).click();
  await dialog.getByLabel("Harga satuan", { exact: true }).fill("987654.32");
  await dialog.getByRole("button", { name: "Terapkan komponen" }).click();
  await expect(page.locator("tbody tr").filter({ hasText: "Biaya uji HPP" })).toContainText("Rp 987.654,32");
  await page.getByRole("button", { name: "Hapus Biaya uji HPP", exact: true }).click();
  await dialog.getByRole("button", { name: "Ya, lanjutkan" }).click();
  await expect(page.locator("tbody")).not.toContainText("Biaya uji HPP");
  await page.getByRole("button", { name: "Simpan draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("disimpan sebagai draft");
  await page.getByRole("button", { name: "Simulasi harga", exact: true }).click();
  await page.getByLabel("Jamaah berbayar simulasi", { exact: true }).fill("20");
  await page.getByLabel("Harga jual simulasi (IDR)", { exact: true }).fill("1000000");
  await expect(page.locator(".costing-stats")).toContainText("−Rp");
  await page.getByLabel("Nama skenario", { exact: true }).fill("Contoh rugi");
  await page.getByRole("button", { name: "Simpan skenario draft" }).click();
  await expect(page.getByRole("status")).toContainText("Contoh rugi");
  await page.getByLabel("Harga jual simulasi (IDR)", { exact: true }).fill("50000000");
  await page.getByRole("button", { name: "Muat skenario" }).click();
  await expect(page.getByLabel("Harga jual simulasi (IDR)", { exact: true })).toHaveValue("1000000");
  await page.getByRole("button", { name: "Breakdown biaya", exact: true }).click();
  await expect(page.getByLabel("Jamaah berbayar rencana", { exact: true })).toHaveValue("35");
  await page.getByRole("button", { name: "Finalisasi costing", exact: true }).click();
  await dialog.getByRole("button", { name: "Ya, lanjutkan" }).click();
  await expect(page.getByLabel("Jamaah berbayar rencana", { exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Buat revisi baru" }).click();
  await expect(page.getByRole("combobox", { name: "Revisi costing", exact: true })).not.toHaveValue(seed.costings[0].id);
  await page.getByLabel("Jamaah berbayar rencana", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Simpan draft", exact: true }).click();
  await page.getByRole("button", { name: "Jadikan template paket" }).click();
  await dialog.getByRole("button", { name: "Ya, lanjutkan" }).click();
  await expect(page.getByRole("status")).toContainText("Template biaya");
  await page.getByRole("combobox", { name: "Revisi costing", exact: true }).selectOption(seed.costings[0].id);
  await expect(page.getByLabel("Jamaah berbayar rencana", { exact: true })).toHaveValue("35");
  await expect(page.getByRole("button", { name: "Buat revisi baru" })).toBeDisabled();
  await page.getByRole("button", { name: "Ringkasan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Biaya aktual tercatat" })).toBeVisible();
  await page.getByRole("button", { name: "Tutup notifikasi" }).click();
  await page.screenshot({ path: "test-results/hpp-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: "test-results/hpp-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Menu profil Ahmad" }).click();
  await page.getByRole("button", { name: "Reset data demo", exact: true }).click();
  await dialog.getByRole("button", { name: "Ya, lanjutkan" }).click();
  await expect(page.getByLabel("Jamaah berbayar rencana", { exact: true })).toBeEnabled();
  await expect(page.getByRole("combobox", { name: "Revisi costing", exact: true }).locator("option")).toHaveCount(1);
  await page.getByLabel("Jamaah berbayar rencana", { exact: true }).fill("22");
  await page.getByRole("button", { name: "Menu profil Ahmad" }).click();
  await page.getByRole("button", { name: "Reset data demo", exact: true }).click();
  await dialog.getByRole("button", { name: "Ya, lanjutkan" }).click();
  await expect(page.getByLabel("Jamaah berbayar rencana", { exact: true })).toHaveValue("35");
  await page.getByRole("link", { name: "Semua costing" }).click();
  await page.locator("tbody").getByRole("link", { name: new RegExp(seed.departures[3].id) }).click();
  await page.getByRole("button", { name: "Buat draft costing", exact: true }).click();
  await expect(page.getByRole("button", { name: "Simpan draft", exact: true })).toBeDisabled();
  await expect(page.locator(".form-error")).toContainText("minimal satu komponen");
  expect(errors).toEqual([]);
});
