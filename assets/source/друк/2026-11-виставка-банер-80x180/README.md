# Банер ReLink для виставки, листопад 2026

- **ReLink_banner_80x180_CMYK_print.pdf** — файл у друк. 800×1800 мм в розмір, без вильотів, CMYK, шрифти в кривих. Люверси по кутах ставить друкарня.
- **ReLink_banner_80x180_preview.png** — чисте прев'ю для замовника.
- **ReLink_banner_80x180_tech_preview.png** — люверси (приблизно, червоне) і безпечна зона 40 мм (блакитний пунктир). Не для друку.
- **вихідник/ReLink_banner_80x180_RGB_live-text.pdf** — та сама графіка з живим текстом, відкривається в Illustrator / Affinity для правок.
- **вихідник/banner-80x180.html** — вихідний макет (HTML+SVG). Відкрити в Chrome; PDF друкується з розміром сторінки 800×1800 мм, далі конвертація в CMYK через Ghostscript:
  `gs -o out-CMYK.pdf -sDEVICE=pdfwrite -dNoOutputFonts -sColorConversionStrategy=CMYK -sProcessColorModel=DeviceCMYK -dPDFSETTINGS=/prepress in.pdf`
- **вихідник/qr-re-link.svg** — QR на https://re-link.com.ua/ (перевірено декодером).

Тексти: «your recruitment partner»; «Знаходимо людей, що створюють результат»; «Defence · Production · Sales · Back office»; re-link.com.ua.
Шрифти: Geologica Medium/SemiBold, Onest Light. Кольори: графіт #394050→#5E6880, бурштин #DEA102→#ECC668.
