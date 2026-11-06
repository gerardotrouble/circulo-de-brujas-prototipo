import { copyFile, writeFile } from 'node:fs/promises';

const site = new URL('../docs/', import.meta.url);
await copyFile(new URL('index.html', site), new URL('404.html', site));
await writeFile(new URL('.nojekyll', site), '');
