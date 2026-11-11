import crypto from "crypto";

function stripWrappingQuotes(value?: string): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "").trim();
}

/**
 * Resolves the server signing/encryption secret from standard environment variables.
 */
export function getJwtSecretValue(): string | null {
  const secret =
    stripWrappingQuotes(process.env.JWT_SECRET) ||
    stripWrappingQuotes(process.env.AUTH_SECRET) ||
    stripWrappingQuotes(process.env.NEXTAUTH_SECRET) ||
    stripWrappingQuotes(process.env.SESSION_SECRET);
  return secret || null;
}

function getEncryptionKey(): Buffer {
  const secret = getJwtSecretValue();
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing in server configuration.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted secret format");
  }
  const [ivHex, tagHex, dataHex] = parts;
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
