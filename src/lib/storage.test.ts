import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import type { DiscountCard } from "./cards";
import { loadCards, restoreCardsAfterLoadError, saveCards } from "./storage";

const card: DiscountCard = {
  id: "persistent",
  name: "Магазин",
  number: "000012345678",
  format: "CODE128",
  color: "#566C50",
  category: "Покупки",
  notes: "",
  favorite: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

async function writeRaw(value: unknown): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("discount-cards", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("wallet", "readwrite");
      transaction.objectStore("wallet").put(value, "cards");
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onabort = () => {
        database.close();
        reject(transaction.error);
      };
    };
  });
}

describe("IndexedDB persistence", () => {
  beforeEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase("discount-cards");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    await loadCards();
  });
  it("reads an empty wallet and persists edits and deletion", async () => {
    expect(await loadCards()).toEqual([]);
    await saveCards([card]);
    expect(await loadCards()).toEqual([card]);
    await saveCards([{ ...card, favorite: true }]);
    expect((await loadCards())[0]?.favorite).toBe(true);
    await saveCards([]);
    expect(await loadCards()).toEqual([]);
  });
  it("rejects invalid writes without damaging the saved wallet", async () => {
    await saveCards([card]);
    await expect(saveCards([{ ...card, number: "" }])).rejects.toThrow();
    expect(await loadCards()).toEqual([card]);
  });
  it("reports corrupted stored cards instead of silently returning an empty wallet", async () => {
    await writeRaw([{ ...card, number: 123 }]);
    await expect(loadCards()).rejects.toThrow("повреждены");
    await expect(saveCards([])).rejects.toThrow("Сначала загрузите");
    await restoreCardsAfterLoadError([card]);
    expect(await loadCards()).toEqual([card]);
    await expect(restoreCardsAfterLoadError([])).rejects.toThrow(
      "только после ошибки",
    );
  });
  it("does not overwrite changes made by another tab with a stale snapshot", async () => {
    await saveCards([card]);
    const updated = { ...card, name: "Из другой вкладки" };
    await writeRaw([updated]);
    await expect(saveCards([{ ...card, favorite: true }])).rejects.toThrow(
      "другой вкладке",
    );
    expect(await loadCards()).toEqual([updated]);
    await saveCards([{ ...updated, favorite: true }]);
    expect(await loadCards()).toEqual([{ ...updated, favorite: true }]);
  });
  it("allows only one of two simultaneous stale writes", async () => {
    await saveCards([card]);
    const writes = await Promise.allSettled([
      saveCards([{ ...card, name: "Первая" }]),
      saveCards([{ ...card, name: "Вторая" }]),
    ]);
    expect(
      writes.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      writes.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
  });
});
