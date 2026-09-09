import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import type { AgentEnv } from '@nextbeat/shared';

const COOKIE_NAME = 'nb_human';
const HUMAN_TTL_MS = 60 * 60 * 1000;

export type Slot3Sponsor = 'none' | 'world' | 'ens' | 'bazantic';

export function isWorldGateActive(env: AgentEnv): boolean {
  if (env.SLOT_3_SPONSOR !== 'world') return false;
  return isWorldConfigured(env) || env.WORLD_DEMO_GATE;
}

export function isWorldConfigured(env: AgentEnv): boolean {
  return Boolean(env.WORLD_APP_ID && env.WORLD_RP_ID && env.WORLD_SIGNING_KEY_HEX);
}

function cookieSecret(env: AgentEnv): string {
  return env.WORLD_SIGNING_KEY_HEX ?? env.HEDERA_AGENT_PRIVATE_KEY ?? 'nextbeat-demo-gate';
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const eq = part.indexOf('=');
        if (eq < 0) return [part, ''];
        return [part.slice(0, eq), decodeURIComponent(part.slice(eq + 1))];
      }),
  );
}

export function hasValidHumanCookie(req: Request, env: AgentEnv): boolean {
  const raw = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!raw) return false;
  const [expStr, sig] = raw.split('.');
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = createHmac('sha256', cookieSecret(env)).update(expStr).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function issueHumanCookie(res: Response, env: AgentEnv): void {
  const exp = Date.now() + HUMAN_TTL_MS;
  const sig = createHmac('sha256', cookieSecret(env)).update(String(exp)).digest('hex');
  const value = `${exp}.${sig}`;
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(HUMAN_TTL_MS / 1000)}`,
  );
}

export async function createRpSignature(env: AgentEnv) {
  if (!env.WORLD_SIGNING_KEY_HEX) {
    throw new Error('WORLD_SIGNING_KEY_HEX not configured');
  }
  const { signRequest } = await import('@worldcoin/idkit-core/signing');
  const sig = signRequest({
    signingKeyHex: env.WORLD_SIGNING_KEY_HEX,
    action: env.WORLD_ACTION,
  });
  return {
    sig: sig.sig,
    nonce: sig.nonce,
    created_at: sig.createdAt,
    expires_at: sig.expiresAt,
  };
}

export async function verifyWithWorld(env: AgentEnv, body: unknown): Promise<boolean> {
  if (!env.WORLD_RP_ID) return false;
  const response = await fetch(`https://developer.world.org/api/v4/verify/${env.WORLD_RP_ID}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) return false;
  const data = (await response.json()) as { success?: boolean };
  return Boolean(data.success);
}
