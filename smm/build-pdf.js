/**
 * Генерує 4 PDF дослідження SMM ReLink у smm/pdf/ з markdown-джерел через
 * Playwright (переюзаний install з presentation/node_modules — без повторного
 * npm install). Той самий рушій, що presentation/build-pdf.js.
 *
 * Запуск: node build-pdf.js   (з теки smm/)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', 'presentation', 'node_modules', 'playwright'));
const { mdToHtml, stripStatusBlockquote } = require('./lib/md');

const ROOT = path.join(__dirname, '..');
const SMM = __dirname;
const OUT_DIR = path.join(SMM, 'pdf');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

function read(rel) { return fs.readFileSync(path.join(SMM, rel), 'utf8'); }
function fontUrl(rel) {
  return 'file:///' + path.join(ROOT, 'assets', 'source', 'шрифти', rel).replace(/\\/g, '/');
}

const zvedeneMd = read('дослідження-зведене.md');
const fbDoslMd = read('facebook/дослідження.md');
const igDoslMd = read('instagram/дослідження.md');
const thDoslMd = read('threads/дослідження.md');

const FONT_FACE = `
@font-face{font-family:'Geologica';src:url('${fontUrl('geologica/Geologica-Regular.ttf')}') format('truetype');font-weight:400}
@font-face{font-family:'Geologica';src:url('${fontUrl('geologica/Geologica-Medium.ttf')}') format('truetype');font-weight:500}
@font-face{font-family:'Onest';src:url('${fontUrl('onest/Onest-Light.ttf')}') format('truetype');font-weight:300}
@font-face{font-family:'Onest';src:url('${fontUrl('onest/Onest-Regular.ttf')}') format('truetype');font-weight:400}
@font-face{font-family:'Onest';src:url('${fontUrl('onest/Onest-Medium.ttf')}') format('truetype');font-weight:500}
`;

const STYLE = `
${FONT_FACE}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Onest',sans-serif;font-weight:300;font-size:10.5pt;line-height:1.55;color:#2A2F3A}
.cover{background:linear-gradient(157deg,#394050,#C6D7FF);color:#EBEAE8;padding:70pt 44pt;border-radius:10pt;margin-bottom:26pt}
.cover .kicker{font-family:'Geologica',sans-serif;font-weight:500;font-size:9.5pt;letter-spacing:.16em;text-transform:uppercase;color:#DEA102;margin-bottom:14pt}
.cover h1{font-family:'Geologica',sans-serif;font-weight:500;font-size:26pt;line-height:1.18;margin-bottom:10pt}
.cover .sub{font-size:11.5pt;color:#DCE0EA;max-width:420pt}
.cover .meta{font-family:'Geologica',sans-serif;font-weight:400;font-size:9pt;letter-spacing:.06em;color:#B7BCC7;margin-top:18pt}
.doc-meta{background:#F4F3F1;border-left:3pt solid #DEA102;border-radius:0 6pt 6pt 0;padding:8pt 12pt;font-size:9pt;color:#4E5566;margin:0 0 14pt}
.doc-meta code{background:#fff;font-family:ui-monospace,Consolas,monospace;font-size:.92em;padding:0 3pt}
h1.doc-h1{font-family:'Geologica',sans-serif;font-weight:500;font-size:19pt;color:#394050;margin:0 0 12pt;padding-top:2pt}
.network-section{page-break-before:always}
.network-section:first-of-type{page-break-before:auto}
h2{font-family:'Geologica',sans-serif;font-weight:500;font-size:14pt;color:#394050;border-bottom:2pt solid #DEA102;padding-bottom:5pt;margin:20pt 0 10pt;page-break-after:avoid}
h3{font-family:'Geologica',sans-serif;font-weight:500;font-size:11.5pt;color:#394050;margin:14pt 0 6pt;page-break-after:avoid}
h4{font-family:'Geologica',sans-serif;font-weight:500;font-size:10.5pt;color:#4E5566;margin:10pt 0 5pt}
p{margin:0 0 8pt}
ul,ol{margin:0 0 9pt 16pt}
li{margin-bottom:4pt}
strong{font-weight:500;color:#394050}
em{color:#4E5566}
code{font-family:ui-monospace,Consolas,monospace;font-size:.92em;background:#F4F3F1;border-radius:3pt;padding:0 3pt}
a{color:#8A6400;word-break:break-all}
hr{border:none;border-top:1pt solid #D8D6D2;margin:14pt 0}
.table-wrap{margin:8pt 0 12pt;page-break-inside:avoid}
table{border-collapse:collapse;width:100%;font-size:9pt}
th{font-family:'Geologica',sans-serif;font-weight:500;font-size:8pt;letter-spacing:.03em;text-transform:uppercase;text-align:left;background:#394050;color:#EBEAE8;padding:5pt 7pt}
td{padding:5pt 7pt;border-top:0.5pt solid #D8D6D2;vertical-align:top}
tr:nth-child(even) td{background:#F7F6F4}
footer.pf{font-family:'Geologica',sans-serif;font-size:8pt;color:#9AA0AB;text-align:center;margin-top:20pt}
`;

function coverHtml(kicker, title, sub, meta) {
  return `<div class="cover"><div class="kicker">${kicker}</div><h1>${title}</h1><p class="sub">${sub}</p><div class="meta">${meta}</div></div>`;
}

function docSection(md, isFirst) {
  const html = mdToHtml(stripStatusBlockquote(md), { headingOffset: 0 });
  // перший h1 файлу піднімаємо в окремий великий заголовок, решта — як є
  return `<div class="network-section">${html.replace(/^<h1>(.*?)<\/h1>/, '<h1 class="doc-h1">$1</h1>')}</div>`;
}

async function renderPdf(browser, bodyHtml, outPath) {
  const page = await browser.newPage();
  const doc = `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><style>${STYLE}</style></head><body>${bodyHtml}<footer class="pf">ReLink · SMM-стратегія · Серпень 2026 · Конфіденційно</footer></body></html>`;
  await page.setContent(doc, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', bottom: '16mm', left: '16mm', right: '16mm' },
    scale: 1.5, // компенсація масштабного бага Chromium/Skia на цій машині — див. presentation/build-pdf.js
  });
  await page.close();
  console.log('OK:', outPath);
}

(async () => {
  const browser = await chromium.launch();

  // 1) Зведене дослідження
  const cover = coverHtml(
    'SMM ReLink · Зведене дослідження',
    'Зведене дослідження соцмереж',
    'Порівняльний зріз чотирьох мереж і повні тексти досліджень Facebook, Instagram, Threads.',
    'Серпень 2026 · Конфіденційно'
  );
  const zvedeneBody = cover + `<div class="network-section" style="page-break-before:auto">${mdToHtml(stripStatusBlockquote(zvedeneMd), { headingOffset: 0 }).replace(/^<h1>(.*?)<\/h1>/, '<h1 class="doc-h1">$1</h1>')}</div>`
    + docSection(fbDoslMd)
    + docSection(igDoslMd)
    + docSection(thDoslMd);
  await renderPdf(browser, zvedeneBody, path.join(OUT_DIR, 'smm-doslidzhennya-zvedene.pdf'));

  // 2) Facebook
  await renderPdf(browser,
    coverHtml('SMM ReLink · Facebook', 'Дослідження Facebook', 'Ринок, алгоритм, аудиторія і роль каналу у воронці ReLink.', 'Серпень 2026 · Конфіденційно')
    + `<div class="network-section" style="page-break-before:auto">${mdToHtml(stripStatusBlockquote(fbDoslMd), { headingOffset: 0 }).replace(/^<h1>(.*?)<\/h1>/, '<h1 class="doc-h1">$1</h1>')}</div>`,
    path.join(OUT_DIR, 'facebook-doslidzhennya.pdf'));

  // 3) Instagram
  await renderPdf(browser,
    coverHtml('SMM ReLink · Instagram', 'Дослідження Instagram', 'Аудиторія, алгоритм і роль каналу як вітрини та рекламного плейсменту.', 'Серпень 2026 · Конфіденційно')
    + `<div class="network-section" style="page-break-before:auto">${mdToHtml(stripStatusBlockquote(igDoslMd), { headingOffset: 0 }).replace(/^<h1>(.*?)<\/h1>/, '<h1 class="doc-h1">$1</h1>')}</div>`,
    path.join(OUT_DIR, 'instagram-doslidzhennya.pdf'));

  // 4) Threads
  await renderPdf(browser,
    coverHtml('SMM ReLink · Threads', 'Дослідження Threads', 'Алгоритм, роль «голосу агенції» і стартовий місяць текстів.', 'Серпень 2026 · Конфіденційно')
    + `<div class="network-section" style="page-break-before:auto">${mdToHtml(stripStatusBlockquote(thDoslMd), { headingOffset: 0 }).replace(/^<h1>(.*?)<\/h1>/, '<h1 class="doc-h1">$1</h1>')}</div>`,
    path.join(OUT_DIR, 'threads-doslidzhennya.pdf'));

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
