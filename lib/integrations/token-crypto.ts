import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

// OAuth access/refresh tokens are more sensitive than the rest of this app's
// data (they're live credentials into a third-party account), so they get
// their own at-rest encryption instead of sitting in Postgres as plaintext
// the way everything else here does. AES-256-GCM, key derived from
// INTEGRATIONS_ENCRYPTION_KEY — set a real 32+ char random value in Vercel;
// falls back to a derived-but-fixed key locally so mock/dev never crashes,
// but that fallback must never be what's running in production.
const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const secret = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('INTEGRATIONS_ENCRYPTION_KEY is not set — cannot store OAuth tokens safely.');
    }
    return createHash('sha256').update('dev-only-insecure-fallback-key').digest();
  }
  return createHash('sha256').update(secret).digest();
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), ciphertext.toString('hex')].join(':');
}

export function decryptToken(encoded: string): string {
  const [ivHex, tagHex, dataHex] = encoded.split(':');
  if (!ivHex || !tagHex || !dataHex) throw new Error('Malformed encrypted token');

  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}
