import { copyFile, writeFile } from 'node:fs/promises';

await Promise.all([
  copyFile(new URL('./pages-404.html', import.meta.url), new URL('../docs/404.html', import.meta.url)),
  writeFile(new URL('../docs/.nojekyll', import.meta.url), ''),
  copyFile(
    new URL('../LICENSE-LUCIDE.txt', import.meta.url),
    new URL('../docs/LICENSE-LUCIDE.txt', import.meta.url),
  ),
]);
