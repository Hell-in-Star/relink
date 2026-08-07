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

  // ВАЖЛИВО: не чіпати inline transform/height, які виставляє scaleSlides() —
  // примусовий transform:none!important на .slide через addStyleTag ламає масштаб
  // усередині Chromium PDF-рендера (Skia/PDF стискає вміст сторінки до ~2/3).
  // Тут лише додаємо розрив сторінки після кожного слайда.
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
  });

  await browser.close();
  console.log('OK:', PDF_PATH);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
