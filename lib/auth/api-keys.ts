import { randomBytes, createHash } from 'crypto';
import { db, workspaceApiKeys } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

// API keys resolve a caller to a workspace server-side (this file), so a
// tool/route never has to trust a client-supplied workspaceId — closing the
// gap flagged in the "Motor GrowthOS" report: today, anyone holding a shared
// secret plus a guessed/leaked workspace UUID could read/write any tenant.
//
// Plaintext keys are shown exactly once, at creation. Only a sha256 hash is
// persisted. This is the same model Stripe/GitHub use for API keys — unlike
// passwords, a random 24-byte key already has enough entropy that a slow
// hash (bcrypt/scrypt) buys nothing; a fast hash + unique DB lookup is fine.

const KEY_PREFIX = 'gos_live_';
const PREFIX_VISIBLE_CHARS = KEY_PREFIX.length + 6;

export interface GeneratedApiKey {
  plaintext: string;
  keyPrefix: string;
  keyHash: string;
}

export function hashApiKey(plaintext: string): string {
  return createHash('sha256').update(plaintext.trim()).digest('hex');
}

export function generateApiKey(): GeneratedApiKey {
  const secret = randomBytes(24).toString('base64url');
  const plaintext = `${KEY_PREFIX}${secret}`;
  return {
    plaintext,
    keyPrefix: plaintext.slice(0, PREFIX_VISIBLE_CHARS),
    keyHash: hashApiKey(plaintext),
  };
}

export async function createWorkspaceApiKey(
  workspaceId: string,
  name: string
): Promise<{ plaintext: string; keyPrefix: string }> {
  const { plaintext, keyPrefix, keyHash } = generateApiKey();

  await db.insert(workspaceApiKeys).values({ workspaceId, name, keyPrefix, keyHash });

  // Returned only here — the caller (a CLI script) must show/store it now.
  return { plaintext, keyPrefix };
}

// Server-side resolution: hash the presented key, look it up, return the
// workspace it belongs to (or null). Never accept workspaceId from the caller.
export async function resolveWorkspaceFromApiKey(
  rawKey: string | null | undefined
): Promise<string | null> {
  if (!rawKey || !rawKey.trim()) return null;

  const keyHash = hashApiKey(rawKey);
  const row = await db.query.workspaceApiKeys.findFirst({
    where: eq(workspaceApiKeys.keyHash, keyHash),
  });

  if (!row || row.revokedAt) return null;

  // Best-effort — a slow/failed write here should never block the caller.
  void db
    .update(workspaceApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(workspaceApiKeys.id, row.id))
    .catch((err) => console.error('[api-keys] failed to update lastUsedAt:', err));

  return row.workspaceId;
}

// Scoped to workspaceId so one tenant can never revoke another's key by
// guessing/enumerating ids — the UI only ever calls this with an id it just
// listed for the caller's own workspace.
export async function revokeWorkspaceApiKey(workspaceId: string, keyId: string): Promise<boolean> {
  const result = await db
    .update(workspaceApiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(workspaceApiKeys.id, keyId), eq(workspaceApiKeys.workspaceId, workspaceId)))
    .returning({ id: workspaceApiKeys.id });

  return result.length > 0;
}
