import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwind from 'tailwindcss';

const root = new URL('../', import.meta.url);
process.chdir(fileURLToPath(root));
const source = new URL('src/styles/portal.source.css', root);
const scope = ':where(html:has(cb-portal))';
const isolate = {
  postcssPlugin: 'isolate-portal',
  OnceExit(css) {
    css.walkRules(rule => {
      if (rule.parent.type === 'atrule' && rule.parent.name.endsWith('keyframes')) return;
      rule.selectors = [...new Set(rule.selectors.map(selector => {
        if (selector === ':host') return 'html' + scope;
        if (selector === 'html' || selector.startsWith('html ')) {
          return 'html' + scope + selector.slice(4);
        }
        return scope + ' ' + selector;
      }))];
    });
  },
};
const result = await postcss([tailwind('./tools/tailwind.config.cjs'), isolate])
  .process(await readFile(source, 'utf8'), { from: fileURLToPath(source) });
await writeFile(new URL('src/styles/portal.css', root), '/* Generado con npm run styles:portal. */\n' + result.css);

