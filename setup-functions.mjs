import { mkdirSync, copyFileSync } from 'node:fs';
mkdirSync('netlify/functions', { recursive: true });
copyFileSync('api.ts', 'netlify/functions/api.ts');
copyFileSync('redirect.ts', 'netlify/functions/redirect.ts');
console.log('functions ready');
