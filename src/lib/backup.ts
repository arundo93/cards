import { appI18n } from "../i18n";
import { type DiscountCard, validateCards } from "./cards";

export const MAX_BACKUP_BYTES = 8 * 1024 * 1024;
const ITERATIONS = 600_000;
const encoder = new TextEncoder();

function serializeBackup(value: unknown): string {
  const text = JSON.stringify(value, null, 2);
  if (encoder.encode(text).byteLength > MAX_BACKUP_BYTES)
    throw new Error(appI18n.t("errors.export-too-large"));
  return text;
}

function encode64(bytes: Uint8Array): string {
  let result = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    result += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return btoa(result);
}

function decode64(value: unknown): Uint8Array<ArrayBuffer> {
  if (typeof value !== "string")
    throw new Error(appI18n.t("errors.invalid-backup-file"));
  try {
    return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  } catch {
    throw new Error(appI18n.t("errors.invalid-backup-file"));
  }
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle)
    throw new Error(appI18n.t("errors.crypto-unavailable"));
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function exportBackup(
  cards: DiscountCard[],
  password?: string,
): Promise<string> {
  const payload = {
    app: "discount-cards",
    version: 1,
    exportedAt: new Date().toISOString(),
    cards: validateCards(cards),
  };
  if (!password) return serializeBackup(payload);
  if (password.length < 8 || password.length > 1024)
    throw new Error(appI18n.t("errors.password-length"));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(payload)),
  );
  return serializeBackup({
    app: "discount-cards",
    version: 1,
    encrypted: true,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: encode64(salt),
    iv: encode64(iv),
    data: encode64(new Uint8Array(encrypted)),
  });
}

function parseEnvelope(text: string): Record<string, unknown> {
  if (encoder.encode(text).byteLength > MAX_BACKUP_BYTES)
    throw new Error(appI18n.t("errors.import-too-large"));
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(appI18n.t("errors.invalid-json"));
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(appI18n.t("errors.invalid-backup"));
  const envelope = value as Record<string, unknown>;
  if (envelope.app !== "discount-cards" || envelope.version !== 1)
    throw new Error(appI18n.t("errors.unsupported-backup"));
  return envelope;
}

export function isEncryptedBackup(text: string): boolean {
  return parseEnvelope(text).encrypted === true;
}

export async function importBackup(
  text: string,
  password?: string,
): Promise<DiscountCard[]> {
  let envelope = parseEnvelope(text);
  if (envelope.encrypted === true) {
    if (!password) throw new Error(appI18n.t("errors.password-required"));
    if (password.length > 1024)
      throw new Error(appI18n.t("errors.password-too-long"));
    if (
      envelope.algorithm !== "AES-256-GCM" ||
      envelope.kdf !== "PBKDF2-SHA256" ||
      envelope.iterations !== ITERATIONS
    ) {
      throw new Error(appI18n.t("errors.unsupported-encryption"));
    }
    const salt = decode64(envelope.salt);
    const iv = decode64(envelope.iv);
    const data = decode64(envelope.data);
    if (salt.length !== 16 || iv.length !== 12 || data.length < 16)
      throw new Error(appI18n.t("errors.encrypted-file-corrupt"));
    const key = await deriveKey(password, salt);
    let decrypted: ArrayBuffer;
    try {
      decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data,
      );
    } catch {
      throw new Error(appI18n.t("errors.decrypt-failed"));
    }
    envelope = parseEnvelope(new TextDecoder().decode(decrypted));
    if (envelope.encrypted) throw new Error(appI18n.t("errors.invalid-backup"));
  }
  return validateCards(envelope.cards);
}
