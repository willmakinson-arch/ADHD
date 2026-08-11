import { copyFile, readFile, writeFile } from 'node:fs/promises';

const headTags = `
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Different Minds" />`;

const manifest = {
  name: 'Different Minds',
  short_name: 'Different Minds',
  description: 'ADHD support and guidance',
  start_url: '/',
  display: 'standalone',
  background_color: '#0F1220',
  theme_color: '#0F1220',
  icons: [
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    { src: '/app-icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' },
  ],
};

const indexPath = new URL('../dist/index.html', import.meta.url);
const index = await readFile(indexPath, 'utf8');
await writeFile(indexPath, index.replace('</head>', `${headTags}\n</head>`));
await copyFile(new URL('../assets/apple-touch-icon.png', import.meta.url), new URL('../dist/apple-touch-icon.png', import.meta.url));
await copyFile(new URL('../assets/icon.png', import.meta.url), new URL('../dist/app-icon.png', import.meta.url));
await writeFile(new URL('../dist/manifest.webmanifest', import.meta.url), JSON.stringify(manifest, null, 2));
