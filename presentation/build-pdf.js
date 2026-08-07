/**
 * Рендерить presentation/relink-presentation.html у presentation/relink-presentation.pdf.
 * Один слайд (1280x720px) = одна сторінка PDF. Шрифти Geologica/Onest вбудовуються
 * автоматично, бо HTML підключає їх через @font-face з локальних TTF (assets/source/шрифти/).
 *
 * Запуск: node build-pdf.js   (з теки presentation/, після `npm install`)
 */
const path = require('path');
const { chromium } = require('playwright');

const HTML_PATH = path.join(__dirname, 'relink-presentation.html');
const PDF_PATH = path.join(__dirname, 'relink-presentation.pdf');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto('file:///' + HTML_PATH.replace(/\\/g, '/'), { waitUntil: 'load' });
  // чекаємо, поки довантажаться локальні TTF-шрифти (document.fonts.ready)
  await page.evaluate(() => document.fonts.ready);

  await page.addStyleTag({
    content: `
      .slide-outer { page-break-after: always; page-break-inside: avoid; }
      .slide-outer:last-child { page-break-after: auto; }
    `,
  });

  await page.pdf({
    path: PDF_PATH,
    width: 1280,
    height: 720,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    // ВАЖЛИВО: без scale:1.5 вміст сторінки стабільно рендериться в ~0.667
    // від правильного розміру (сторінка 960x540pt лишається коректною, але
    // намальований вміст займає тільки її центральну/верхню частину).
    // Перевірено аналізом сирого PDF content stream: Skia на цій машині
    // компонує масштаб через проміжний крок 300dpi -> 144dpi замість
    // очікуваних 300dpi -> 96dpi (72/300 * 300/144 = 0.5 замість 72/300 *
    // 300/96 = 0.75) — тобто "думає", що CSS-піксель відповідає 144dpi
    // (= 96dpi * 1.5, ознака невірно підхопленого 150% масштабування
    // Windows на рівні друкованого рендер-пайплайна). Ні --force-device-
    // scale-factor=1, ні --window-size, ні зняття resize-обробника
    // scaleSlides() цього не виправляють (перевірено, стабільно
    // відтворюється 4/4 запусків) — це внутрішній Skia/PDF баг рівня
    // Chromium, недоступний для правки ззовні. scale:1.5 компенсує його
    // множенням наперед: 1.5 * 0.667 = 1.0. Перевірено 4/4 стабільних
    // прогонів після фіксу — вміст точно заповнює сторінку 1:1.
    scale: 1.5,
  });

  await browser.close();
  console.log('OK:', PDF_PATH);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
