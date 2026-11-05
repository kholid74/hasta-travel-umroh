import type { DemoState, ProductType } from "./types";

export type InventoryItem = { id: string; sku: string; name: string; category: string; unit: string; variant: string; minimumStock: number; active: boolean };
export type Warehouse = { id: string; name: string; locationLabel: string; active: boolean };
export type ItemSnapshot = { itemId: string; name: string; sku: string; unit: string; variant: string; quantity: number };
export type StockMovement = {
  id: string; itemId: string; type: "OPENING" | "RECEIPT" | "HANDOVER" | "RETURN" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT";
  quantity: number; warehouseId: string; referenceType: string; referenceId: string; createdAt: string; note: string; operatorId: string;
  itemSnapshot: Omit<ItemSnapshot, "quantity">; condition?: "REUSABLE" | "DAMAGED";
};
export type PilgrimKitTemplate = { id: string; name: string; productType: ProductType; items: { itemId: string; requiredQuantity: number }[]; active: boolean };
export type PilgrimKitAllocation = {
  id: string; pilgrimId: string; bookingId: string; productType: ProductType; packageId: string; departureId: string;
  packageName: string; pilgrimName: string; templateId: string; templateName: string; warehouseId: string;
  allocatedItems: (ItemSnapshot & { releasedQuantity: number })[]; status: "ALLOCATED" | "PARTIAL" | "COMPLETED" | "RELEASED";
};
export type Handover = { id: string; allocationId: string; pilgrimId: string; bookingId: string; warehouseId: string; receivedBy: string; receivedAt: string; operatorId: string; items: ItemSnapshot[]; notes: string; receiptNumber: string; pilgrimName: string; packageName: string; productType: ProductType; warehouseName: string; templateName: string };
export type InventoryState = { inventory: InventoryItem[]; warehouses: Warehouse[]; stockMovements: StockMovement[]; kitTemplates: PilgrimKitTemplate[]; kitAllocations: PilgrimKitAllocation[]; handovers: Handover[] };
export const snapshotItem = (item: InventoryItem) => ({ itemId: item.id, name: item.name, sku: item.sku, unit: item.unit, variant: item.variant });

type Legacy = Pick<DemoState, "jamaah" | "bookings" | "packages" | "departures" | "hajjPackages"> & { inventory: { id: string; name: string; stock: number; minimum: number }[] };
export function initializeInventory(old: Legacy): InventoryState {
  const inventory = old.inventory.map((i, n) => {
    if (!i.id || !i.name.trim() || !Number.isSafeInteger(i.stock) || i.stock < 0 || !Number.isSafeInteger(i.minimum) || i.minimum < 0) throw new Error("Arsip stok lama tidak valid.");
    return { id: i.id, name: i.name, sku: `HT-${String(n + 1).padStart(3, "0")}`, category: i.name.includes("Koper") ? "Bagasi" : "Perlengkapan", unit: "pcs", variant: "Standar", minimumStock: i.minimum, active: true };
  });
  const warehouses = [{ id: "WH-JKT", name: "Gudang Jakarta", locationLabel: "Kantor pusat · Demo", active: true }, { id: "WH-BDG", name: "Gudang Bandung", locationLabel: "Cabang · Demo", active: true }];
  const kitTemplates: PilgrimKitTemplate[] = (["UMRAH", "HAJJ_SPECIAL"] as const).map(productType => ({ id: `KIT-${productType}`, name: productType === "UMRAH" ? "Umrah Reguler" : "Haji Khusus", productType, active: true, items: inventory.filter(i => ["Koper Besar", "Tas Paspor", "Seragam Batik"].includes(i.name)).map(i => ({ itemId: i.id, requiredQuantity: 1 })) }));
  const stockMovements: StockMovement[] = old.inventory.filter(i => i.stock > 0).map(i => ({ id: `OPEN-${i.id}`, itemId: i.id, type: "OPENING", quantity: i.stock, warehouseId: "WH-JKT", referenceType: "MIGRATION", referenceId: i.id, createdAt: "2026-10-01", note: "Saldo awal dari arsip demo", operatorId: "USR-1", itemSnapshot: snapshotItem(inventory.find(k => k.id === i.id)!) }));
  const kitAllocations: PilgrimKitAllocation[] = [], handovers: Handover[] = [];
  for (const j of old.jamaah) {
    const b = old.bookings.find(b => b.jamaahId === j.id);
    if (!j.equipment.length) continue;
    if (!b || new Set(j.equipment).size !== j.equipment.length || j.equipment.some(name => !inventory.some(i => i.name === name))) throw new Error("Arsip distribusi lama memiliki referensi barang/booking yang tidak valid.");
    const items = inventory.filter(i => j.equipment.includes(i.name)).map(i => ({ ...snapshotItem(i), quantity: 1 }));
    if (!items.length) continue;
    const template = kitTemplates.find(t => t.productType === b.productType)!;
    const packageId = b.hajjPackageId || old.departures.find(d => d.id === b.departureId)?.packageId || "";
    const packageName = [...old.packages, ...old.hajjPackages].find(p => p.id === packageId)?.name || "Arsip paket demo";
    const a: PilgrimKitAllocation = { id: `LEGACY-A-${b.id}`, pilgrimId: j.id, bookingId: b.id, productType: b.productType, packageId, departureId: b.departureId, packageName, pilgrimName: j.name, templateId: template.id, templateName: template.name, warehouseId: "WH-JKT", allocatedItems: items.map(i => ({ ...i, releasedQuantity: 0 })), status: "COMPLETED" };
    const h: Handover = { id: `LEGACY-H-${b.id}`, allocationId: a.id, pilgrimId: j.id, bookingId: b.id, warehouseId: "WH-JKT", receivedBy: "Tidak tercatat (arsip demo)", receivedAt: "2026-10-02", operatorId: "USR-1", items, notes: "Migrasi arsip distribusi demo; bukan bukti riil. Tanggal adalah tanggal migrasi contoh; tanggal penyerahan dan nama penerima lama tidak tercatat.", receiptNumber: `DEMO-KIT-LEGACY-${b.id}`, pilgrimName: j.name, packageName, productType: b.productType, warehouseName: warehouses[0].name, templateName: template.name };
    kitAllocations.push(a); handovers.push(h);
    items.forEach(i => stockMovements.push({ id: `${h.id}-${i.itemId}`, itemId: i.itemId, type: "HANDOVER", quantity: i.quantity, warehouseId: h.warehouseId, referenceType: "HANDOVER", referenceId: h.id, createdAt: h.receivedAt, note: h.notes, operatorId: h.operatorId, itemSnapshot: snapshotItem(inventory.find(k => k.id === i.itemId)!) }));
  }
  return { inventory, warehouses, kitTemplates, stockMovements, kitAllocations, handovers };
}
