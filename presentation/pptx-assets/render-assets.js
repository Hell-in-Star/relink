/**
 * Рендерить усі растрові допоміжні активи для збірки PPTX (build-pptx.py):
 *  - 4 фонові підложки слайдів (2560x1440, PNG, без прозорості)
 *  - складна векторна графіка слайда 1 (дуга + коло-схема), прозорий PNG
 *  - маленька лого-мітка в центрі кола (слайд 1), прозорий PNG
 *  - усі іконки-гліфи (прозорий фон), що використовуються в картках/пігулках/колах
 *
 * Джерело правди для кольорів/шляхів — сам relink-presentation.html
 * (копіюємо фрагменти CSS/SVG звідти, файл НЕ змінюємо).
 *
 * Запуск: node render-assets.js   (з теки presentation/pptx-assets/)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('../node_modules/playwright');

const OUT = __dirname;
const MAIN_HTML = path.join(__dirname, '..', 'relink-presentation.html');

const AMBER = '#DEA102';
const GRAPHITE = '#394050';
const LIGHT = '#EBEAE8';

// ---------- каталог іконок: {name, color, strokeWidth, inner svg} ----------
const ICONS = [
  { name: 'link-amber', color: AMBER, sw: 1.6, inner: `<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/>` },
  { name: 'link-graphite', color: GRAPHITE, sw: 1.5, inner: `<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/>` },
  { name: 'briefcase-graphite', color: GRAPHITE, sw: 1.5, inner: `<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="3" y1="13" x2="21" y2="13"/>` },
  { name: 'people-graphite', color: GRAPHITE, sw: 1.5, inner: `<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.3 2.2-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><circle cx="17.5" cy="9" r="2.1"/><path d="M15.3 20c0-2.3 1.1-4 3.2-4.4"/>` },
  { name: 'people-amber', color: AMBER, sw: 1.4, inner: `<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.3 2.2-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><circle cx="17.5" cy="9" r="2.1"/><path d="M15.3 20c0-2.3 1.1-4 3.2-4.4"/>` },
  { name: 'veteran-graphite', color: GRAPHITE, sw: 1.5, inner: `<circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 6 21l6-3 6 3-2.5-8.5"/>` },
  { name: 'gear-graphite', color: GRAPHITE, sw: 1.5, inner: `<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"/>` },
  { name: 'book-graphite', color: GRAPHITE, sw: 1.5, inner: `<path d="M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-2a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h3z"/>` },
  { name: 'clock-graphite', color: GRAPHITE, sw: 1.5, inner: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>` },
  { name: 'envelope-amber', color: AMBER, sw: 1.4, inner: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>` },
  { name: 'clipboard-amber', color: AMBER, sw: 1.4, inner: `<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/>` },
  { name: 'search-amber', color: AMBER, sw: 1.4, inner: `<circle cx="10" cy="10" r="6"/><line x1="20" y1="20" x2="14.5" y2="14.5"/>` },
  { name: 'chat-amber', color: AMBER, sw: 1.4, inner: `<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.35 0-2.6-.3-3.7-.85L3 21l1.85-5.55A8.47 8.47 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/>` },
  { name: 'checkmark-amber', color: AMBER, sw: 1.4, inner: `<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>` },
  { name: 'checkmark-graphite', color: GRAPHITE, sw: 1.7, inner: `<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>` },
  { name: 'checkmark-light', color: LIGHT, sw: 1.7, inner: `<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>` },
  { name: 'document-check-amber', color: AMBER, sw: 1.4, inner: `<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m9 13 2 2 4-4"/>` },
  { name: 'shield-amber', color: AMBER, sw: 1.4, inner: `<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z"/>` },
  { name: 'target-graphite', color: GRAPHITE, sw: 1.5, inner: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>` },
  { name: 'lightning-graphite', color: GRAPHITE, sw: 1.5, inner: `<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>` },
  { name: 'database-graphite', color: GRAPHITE, sw: 1.5, inner: `<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>` },
  { name: 'monitor-graphite', color: GRAPHITE, sw: 1.5, inner: `<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>` },
  { name: 'globe-amber', color: AMBER, sw: 1.6, inner: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z"/>` },
];

const ICON_PAGE = (color, sw, inner) => `<!DOCTYPE html><html><head><style>
  html,body{margin:0;padding:0;background:transparent}
  svg{display:block}
</style></head><body>
<svg width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>
</body></html>`;

// ---------- фони: 2 повторювані (bg-light/bg-dark) + 2 унікальні (slide-1, slide-2) ----------
const BG_LIGHT_CSS = `background:
    radial-gradient(ellipse 120% 90% at 5% 100%, rgba(222,161,2,0.42), transparent 68%),
    radial-gradient(ellipse 105% 80% at 100% 0%, rgba(198,215,255,0.62), transparent 68%),
    #EFEEEC;`;
const BG_DARK_CSS = `background:
    radial-gradient(ellipse 105% 80% at 8% 95%, rgba(222,161,2,0.32), transparent 66%),
    radial-gradient(ellipse 90% 70% at 92% 5%, rgba(112,119,135,0.60), transparent 66%),
    #394050;`;

const BG_PLAIN_PAGE = (css) => `<!DOCTYPE html><html><head><style>
  html,body{margin:0;padding:0}
  .s{width:1280px;height:720px;${css}}
</style></head><body><div class="s"></div></body></html>`;

(async () => {
  const browser = await chromium.launch();

  // ---- 1) прості повторювані фони (bg-light-plain, bg-dark-plain) ----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
    await page.setContent(BG_PLAIN_PAGE(BG_LIGHT_CSS));
    await page.locator('.s').screenshot({ path: path.join(OUT, 'bg-light-plain.png') });
    await page.setContent(BG_PLAIN_PAGE(BG_DARK_CSS));
    await page.locator('.s').screenshot({ path: path.join(OUT, 'bg-dark-plain.png') });
    await page.close();
  }

  // ---- 2) унікальні фони слайдів 1 і 2 (з реального HTML, приховуємо передній план) ----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
    await page.goto('file:///' + MAIN_HTML.replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    // слайд 1: лишаємо тільки .slide(bg-light) + .col-right(графіт+glow+ring), ховаємо решту
    await page.evaluate(() => {
      const s1 = document.getElementById('slide-1');
      const hide = ['.top-strip', '.arc-frame', '.left-bottom', '.schema', '.leader-label', '.center-logo', '.right-logo', '.right-bottom', '.footer .logo-mark', '.footer .page-num'];
      hide.forEach(sel => s1.querySelectorAll(sel).forEach(el => el.style.visibility = 'hidden'));
    });
    await page.locator('#slide-1').screenshot({ path: path.join(OUT, 'bg-slide1.png') });

    // повертаємо видимість перед тим, як ховати слайд-2 елементи (незалежні слайди, але про всяк випадок)
    await page.goto('file:///' + MAIN_HTML.replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      const s2 = document.getElementById('slide-2');
      const hide = ['.col-left', '.div-main', '.top-zone p', '.top-zone .core', '.top-zone .task', '.div-h2', '.chain', '.geo-corner', '.footer .logo-mark', '.footer .page-num'];
      hide.forEach(sel => s2.querySelectorAll(sel).forEach(el => el.style.visibility = 'hidden'));
    });
    await page.locator('#slide-2').screenshot({ path: path.join(OUT, 'bg-slide2.png') });

    await page.close();
  }

  // ---- 3) складна графіка слайда 1: дуга + коло-схема (без тексту, без лого, без arc-icon) ----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
    await page.goto('file:///' + MAIN_HTML.replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      const s1 = document.getElementById('slide-1');
      // ховаємо все, крім .arc/.arc-dash (лишаємо) і .schema (лишаємо, але без тексту-виносок)
      const hide = ['.top-strip', '.arc-icon', '.left-bottom', '.leader-label', '.center-logo', '.col-right', '.footer'];
      hide.forEach(sel => s1.querySelectorAll(sel).forEach(el => el.style.visibility = 'hidden'));
      // прибираємо фон самого слайда і .col-left, щоб лишились тільки лінії на прозорому тлі
      s1.style.background = 'transparent';
      s1.querySelector('.col-left').style.background = 'transparent';
      document.body.style.background = 'transparent';
      document.documentElement.style.background = 'transparent';
    });
    await page.locator('#slide-1').screenshot({ path: path.join(OUT, 'slide1-graphic.png'), omitBackground: true });
    await page.close();
  }

  // ---- 4) маленька лого-мітка в центрі кола (слайд 1, .center-logo) ----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 4 });
    await page.goto('file:///' + MAIN_HTML.replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#slide-1 .center-logo').screenshot({ path: path.join(OUT, 'center-logo.png'), omitBackground: true });
    await page.close();
  }

  // ---- 5) іконки-гліфи ----
  {
    const page = await browser.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 2 });
    for (const icon of ICONS) {
      await page.setContent(ICON_PAGE(icon.color, icon.sw, icon.inner));
      await page.locator('svg').screenshot({ path: path.join(OUT, `icon-${icon.name}.png`), omitBackground: true });
    }
    await page.close();
  }

  await browser.close();
  console.log('OK: усі активи згенеровано в', OUT);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
