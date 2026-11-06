import { describe, expect, it } from "vitest";
import { exportBackup, importBackup, isEncryptedBackup } from "./backup";
import type { DiscountCard } from "./cards";
import { getStorePreset } from "./stores";

const cards: DiscountCard[] = [
  {
    id: "one",
    name: "Кофейня",
    number: "00012345",
    format: "CODE128",
    color: "#566C50",
    category: "Кофе и еда",
    notes: "Без сахара",
    favorite: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

describe("wallet backups", () => {
  it("round trips all four catalog cards and a legacy card in one backup", async () => {
    const fixtures = [
      ["pyaterochka", "4006381333931"],
      ["magnit", "Карта №00042"],
      ["lenta", "000123456789"],
      ["lemanapro", "LM-00012345"],
    ];
    const collection: DiscountCard[] = fixtures.map(([id, number]) => {
      const store = getStorePreset(id);
      if (!store) throw new Error("Missing fixture store");
      return {
        ...cards[0],
        id,
        name: store.name,
        storeId: store.id,
        format: store.format,
        number,
      };
    });
    collection.push(cards[0]);
    for (const password of [undefined, "all-store-password"]) {
      const restored = await importBackup(
        await exportBackup(collection, password),
        password,
      );
      expect(restored).toEqual(collection);
      expect(restored[4]).not.toHaveProperty("storeId");
    }
  });
  it("preserves optional store identity in plain and encrypted backups", async () => {
    const storeCards: DiscountCard[] = [{ ...cards[0], storeId: "lenta" }];
    expect(await importBackup(await exportBackup(storeCards))).toEqual(
      storeCards,
    );
    expect(
      await importBackup(
        await exportBackup(storeCards, "store-password"),
        "store-password",
      ),
    ).toEqual(storeCards);
  });
  it("round trips plain backups without losing Unicode or leading zeroes", async () => {
    const text = await exportBackup(cards);
    expect(isEncryptedBackup(text)).toBe(false);
    expect(await importBackup(text)).toEqual(cards);
  });
  it("encrypts with fresh randomness and round trips a password-protected backup", async () => {
    const first = await exportBackup(cards, "correct horse battery");
    const second = await exportBackup(cards, "correct horse battery");
    expect(first).not.toContain("Кофейня");
    expect(first).not.toBe(second);
    expect(isEncryptedBackup(first)).toBe(true);
    expect(await importBackup(first, "correct horse battery")).toEqual(cards);
    await expect(importBackup(first, "wrong password")).rejects.toThrow(
      "Неверный пароль",
    );
    await expect(importBackup(first)).rejects.toThrow("Введите пароль");
    const tampered = JSON.parse(first);
    tampered.data =
      (tampered.data.startsWith("A") ? "B" : "A") + tampered.data.slice(1);
    await expect(
      importBackup(JSON.stringify(tampered), "correct horse battery"),
    ).rejects.toThrow("повреждена");
  });
  it("rejects malformed envelopes, incompatible algorithms and unsafe iteration counts", async () => {
    await expect(importBackup("{broken")).rejects.toThrow("JSON");
    await expect(
      importBackup('{"app":"other","version":1,"cards":[]}'),
    ).rejects.toThrow("не поддерживается");
    await expect(
      importBackup(
        JSON.stringify({
          app: "discount-cards",
          version: 1,
          encrypted: true,
          iterations: 1e12,
        }),
        "password",
      ),
    ).rejects.toThrow("Параметры");
    await expect(exportBackup(cards, "short")).rejects.toThrow("Пароль");
  });
});
