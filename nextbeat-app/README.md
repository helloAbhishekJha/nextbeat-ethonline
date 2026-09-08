# NextBeat app

Implementation lives in this folder. **Start at the repo root [README](../README.md)** for what NextBeat is, the flow diagram, and how to run.

```bash
cp .env.example .env   # two ECDSA testnet accounts from portal.hedera.com
npm install
npm test
npm run typecheck
npm run dev
```

- Service: http://127.0.0.1:4021/health  
- Desk: http://127.0.0.1:3001  
- Smoke (expects HTTP 402): `npm run smoke`

Git protocol: [GIT.md](./GIT.md).
