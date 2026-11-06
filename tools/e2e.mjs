import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname } from 'node:path';

const root = new URL('../', import.meta.url);
const build = new URL('dist/circulo-de-brujas-prototipo/browser/', root);
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
};

let server;
try {
  let baseURL = process.env.PORTAL_E2E_URL;
  if (!baseURL) {
    const index = await readFile(new URL('index.html', build)).catch(error => {
      throw new Error('Ejecuta npm run build antes de las pruebas de navegador.', { cause: error });
    });
    server = createServer(async (request, response) => {
      try {
        const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
        const ext = extname(pathname);
        const file = new URL('.' + pathname, build);
        if (!file.href.startsWith(build.href)) throw new Error('Ruta inválida.');
        const content = ext ? await readFile(file) : index;
        response.writeHead(200, { 'content-type': types[ext || '.html'] ?? 'application/octet-stream' });
        response.end(content);
      } catch {
        response.writeHead(404).end();
      }
    });
    const listening = once(server, 'listening');
    server.listen(0, '127.0.0.1');
    await listening;
    baseURL = 'http://127.0.0.1:' + server.address().port;
  }

  const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PORTAL_E2E_URL: baseURL },
  });
  const [status] = await once(child, 'exit');
  process.exitCode = status ?? 1;
} finally {
  if (server?.listening) {
    server.close();
    server.closeAllConnections();
  }
}

