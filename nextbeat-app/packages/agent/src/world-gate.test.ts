import { describe, expect, it } from 'vitest';
import type { AgentEnv } from '@nextbeat/shared';
import {
  clearHumanCookie,
  hasValidHumanCookie,
  isWorldGateActive,
  issueHumanCookie,
} from './world-gate.js';

const baseEnv: AgentEnv = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  AGENT_PORT: 3001,
  LOG_LEVEL: 'error',
  PAYCALL_PRICE_TINYBARS: 1000n,
  PAYCALL_BUDGET_TINYBARS: 5_000_000n,
  SERVICE_PUBLIC_URL: 'http://127.0.0.1:4021',
  SLOT_3_SPONSOR: 'world',
  WORLD_ACTION: 'nextbeat-desk',
  WORLD_DEMO_GATE: false,
  DESK_UI: 'classic',
};

describe('world gate', () => {
  it('activates when world credentials or demo flag are set', () => {
    expect(isWorldGateActive({ ...baseEnv, SLOT_3_SPONSOR: 'none' })).toBe(false);
    expect(isWorldGateActive({ ...baseEnv, WORLD_DEMO_GATE: true })).toBe(true);
    expect(
      isWorldGateActive({
        ...baseEnv,
        WORLD_APP_ID: 'app_test',
        WORLD_RP_ID: 'rp_test',
        WORLD_SIGNING_KEY_HEX: '0x' + '11'.repeat(32),
      }),
    ).toBe(true);
  });

  it('issues and validates a human cookie', () => {
    const env = {
      ...baseEnv,
      WORLD_SIGNING_KEY_HEX: '0x' + '22'.repeat(32),
    };
    const headers: Record<string, string | string[]> = {};
    const res = {
      setHeader(name: string, value: string) {
        headers[name.toLowerCase()] = value;
      },
    };
    issueHumanCookie(res as never, env);
    const cookie = String(headers['set-cookie']);
    const req = { headers: { cookie: cookie.split(';')[0] } };
    expect(hasValidHumanCookie(req as never, env)).toBe(true);
  });

  it('clears a human cookie', () => {
    const env = {
      ...baseEnv,
      WORLD_SIGNING_KEY_HEX: '0x' + '33'.repeat(32),
    };
    const headers: Record<string, string | string[]> = {};
    const res = {
      setHeader(name: string, value: string) {
        headers[name.toLowerCase()] = value;
      },
    };
    issueHumanCookie(res as never, env);
    const issued = String(headers['set-cookie']);
    const req = { headers: { cookie: issued.split(';')[0] } };
    expect(hasValidHumanCookie(req as never, env)).toBe(true);
    clearHumanCookie(res as never);
    const cleared = String(headers['set-cookie']);
    expect(cleared).toContain('Max-Age=0');
  });
});
