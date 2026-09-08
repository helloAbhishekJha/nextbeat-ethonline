import { build } from 'esbuild';

await build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: 'api/index.js',
  sourcemap: false,
  logLevel: 'info',
});

console.log('wrote api/index.js');
