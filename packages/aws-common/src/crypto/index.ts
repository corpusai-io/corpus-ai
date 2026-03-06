import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.DATABASE_ENCRYPTION_KEY;
  if (!key) throw new Error('DATABASE_ENCRYPTION_KEY env var is required');
  const buf = Buffer.from(key, 'hex');
  if (buf.length !== 32) throw new Error('DATABASE_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  return buf;
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  const key = getKey();
  const parts = encryptedText.split(':');
  if (parts.length !== 3) return encryptedText; // not encrypted (legacy plain text)
  const [ivBase64, authTagBase64, dataBase64] = parts;
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(dataBase64, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
