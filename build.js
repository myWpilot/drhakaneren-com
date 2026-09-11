// build.js
// Vercel deploy sırasında çalışır: partials/header.html ve partials/footer.html
// içeriğini her sayfadaki <div id="site-header">/<div id="site-footer"> yerine
// gömer, sonucu dist/ klasörüne yazar. Kaynak dosyalar (index.html, blog/*,
// partials/*) hiç değişmez — siz GitHub'da hep aynı dosyaları düzenlersiniz.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const SKIP_TOP_LEVEL = new Set([
  'dist', 'node_modules', '.git', 'partials',
  'build.js', 'package.json', 'package-lock.json',
  'README.md', '.gitignore'
]);

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const headerHtml = fs.readFileSync(path.join(ROOT, 'partials', 'header.html'), 'utf8');
const footerHtml = fs.readFileSync(path.join(ROOT, 'partials', 'footer.html'), 'utf8');
const analyticsHtml = fs.readFileSync(path.join(ROOT, 'partials', 'analytics.html'), 'utf8');

function inlinePartials(html) {
  return html
    .replace('<div id="site-header"></div>', headerHtml)
    .replace('<div id="site-footer"></div>', footerHtml)
    .replace('<!--ANALYTICS-->', analyticsHtml);
}

function walk(dir, relBase) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (relBase === '' && SKIP_TOP_LEVEL.has(entry.name)) continue;

    const srcPath = path.join(dir, entry.name);
    const relPath = path.join(relBase, entry.name);
    const destPath = path.join(DIST, relPath);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      walk(srcPath, relPath);
    } else if (entry.name.endsWith('.html')) {
      const raw = fs.readFileSync(srcPath, 'utf8');
      fs.writeFileSync(destPath, inlinePartials(raw), 'utf8');
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

walk(ROOT, '');

console.log('Build tamamlandı: dist/ klasörü hazır.');
