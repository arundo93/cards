import { appI18n } from "../i18n";
import { type DiscountCard, validateCards } from "./cards";

const DATABASE = "discount-cards";
const STORE = "wallet";
let loadedSnapshot: string | undefined;
let lastLoadFailed = false;

function snapshot(value: unknown): string {
  return JSON.stringify(value ?? []);
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error(appI18n.t("errors.storage-unavailable")));
      return;
    }
    let blocked = false;
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onerror = () => reject(new Error(appI18n.t("errors.storage-open")));
    request.onblocked = () => {
      blocked = true;
      reject(new Error(appI18n.t("errors.storage-blocked")));
    };
    request.onsuccess = () => {
      const database = request.result;
      if (blocked) {
        database.close();
        return;
      }
      database.onversionchange = () => database.close();
      resolve(database);
    };
  });
}

export async function loadCards(): Promise<DiscountCard[]> {
  try {
    const cards = await readCards();
    lastLoadFailed = false;
    return cards;
  } catch (error) {
    loadedSnapshot = undefined;
    lastLoadFailed = true;
    throw error;
  }
}

async function readCards(): Promise<DiscountCard[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, "readonly");
    const request = transaction.objectStore(STORE).get("cards");
    transaction.oncomplete = () => {
      database.close();
      try {
        const cards =
          request.result === undefined ? [] : validateCards(request.result);
        loadedSnapshot = snapshot(request.result);
        resolve(cards);
      } catch {
        reject(new Error(appI18n.t("errors.storage-corrupt")));
      }
    };
    transaction.onabort = () => {
      database.close();
      reject(new Error(appI18n.t("errors.storage-read")));
    };
  });
}

export async function saveCards(cards: DiscountCard[]): Promise<void> {
  if (loadedSnapshot === undefined)
    throw new Error(appI18n.t("errors.load-first"));
  return writeCards(cards, loadedSnapshot);
}

/** Explicit recovery action; never use this for routine edits or imports. */
export async function restoreCardsAfterLoadError(
  cards: DiscountCard[],
): Promise<void> {
  if (!lastLoadFailed)
    throw new Error(appI18n.t("errors.recovery-not-allowed"));
  await writeCards(cards);
  lastLoadFailed = false;
}

async function writeCards(
  cards: DiscountCard[],
  expectedSnapshot?: string,
): Promise<void> {
  const validated = validateCards(cards);
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    let conflict = false;
    if (expectedSnapshot === undefined) {
      store.put(validated, "cards");
    } else {
      const current = store.get("cards");
      current.onsuccess = () => {
        if (snapshot(current.result) !== expectedSnapshot) {
          conflict = true;
          transaction.abort();
          return;
        }
        store.put(validated, "cards");
      };
    }
    transaction.oncomplete = () => {
      database.close();
      loadedSnapshot = snapshot(validated);
      resolve();
    };
    transaction.onabort = () => {
      database.close();
      reject(
        new Error(
          conflict
            ? appI18n.t("errors.storage-conflict")
            : appI18n.t("errors.storage-write"),
        ),
      );
    };
  });
}

export async function requestPersistentStorage(): Promise<boolean> {
  return (await navigator.storage?.persist?.()) ?? false;
}
