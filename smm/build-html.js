/**
 * Генерує relink-smm-strategy.html (корінь репо) з markdown-джерел у /smm
 * та контент-плану в /context, і нативно вбудовує вміст
 * relink-linkedin-strategy.html (без iframe, той самий текст один в один).
 * Гарантує повне, дослівне перенесення тексту — замість ручного передруку
 * контент проходить через smm/lib/md.js (перевірено test-md.js: кількість
 * заголовків/пунктів списків/URL у джерелі й на виході збігається).
 *
 * Запуск: node build-html.js   (з теки smm/)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { mdToHtml, stripStatusBlockquote, removeSection } = require('./lib/md');

const ROOT = path.join(__dirname, '..');
const SMM = __dirname;

function read(rel) {
  return fs.readFileSync(path.join(SMM, rel), 'utf8');
}
function readRoot(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function readSvg(rel) {
  return readRoot(rel).replace(/<\?xml[^>]*\?>\s*/, '');
}

function statusOf(md) {
  const m = md.match(/Статус:\s*([^.\n(]+)/);
  return m ? m[1].trim() : '';
}
function badgeClass(status) {
  if (/погоджен[оі]\s*Дмитром/i.test(status) || /затверджен/i.test(status)) return 'ok';
  if (/на погодженні/i.test(status)) return 'pending';
  return '';
}
function render(md, offset) {
  return mdToHtml(stripStatusBlockquote(md), { headingOffset: offset || 1 });
}

// ---------- джерела ----------
const oglyadMd = read('огляд.md');
const fbDoslMd = read('facebook/дослідження.md');
const fbStratMd = read('facebook/стратегія.md');
const igDoslMd = read('instagram/дослідження.md');
const igStratMd = read('instagram/стратегія.md');
const thDoslMd = read('threads/дослідження.md');
const thStratMd = read('threads/стратегія.md');

let planMd = readRoot('context/контент-план.md');
const planStatus = statusOf(planMd);
planMd = stripStatusBlockquote(planMd);
planMd = removeSection(planMd, 'Задачі збору фактури');
planMd = removeSection(planMd, 'Що йде на погодження замовнику');

const logoSvg = readSvg('assets/source/лого/svg/brand-horizontal-light.svg')
  .replace('<svg ', '<svg class="brandmark" ');

// ---------- парсинг таблиць контент-плану для синхронізації з календарем ----------
function parsePlanEntries(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const netMap = { Facebook: 'fb', Instagram: 'ig', Threads: 'th' };
  const entries = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    if (/^\|?\s*:?-{2,}/.test(t)) continue;
    const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells.length < 4) continue;
    const [col1, col2, col3] = cells;
    if (!netMap[col2]) continue;
    const m = col1.match(/(\d{2})\.(\d{2})/);
    if (!m) continue;
    entries.push({ dateKey: '2026-' + m[2] + '-' + m[1], net: netMap[col2], theme: col3 });
  }
  const byDate = {};
  entries.forEach((e) => {
    (byDate[e.dateKey] = byDate[e.dateKey] || []).push({ net: e.net, theme: e.theme });
  });
  return byDate;
}
const planByDate = parsePlanEntries(planMd);

// ---------- рендер мережевої вкладки ----------
function networkTab(id, name, stratMd, doslMd, pdfHref, pdfLabel) {
  const status = statusOf(stratMd);
  const badge = badgeClass(status);
  const stratHtml = render(stratMd);
  const doslHtml = render(doslMd);
  return `
<section class="tab-panel" id="tab-${id}" role="tabpanel" aria-labelledby="navtab-${id}" hidden>
  <div class="wrap">
    <div class="net-head">
      <div class="net-eyebrow">Мережа</div>
      <h1>${name}</h1>
      ${status ? `<span class="badge ${badge}">${status}</span>` : ''}
    </div>

    <div class="net-content">
      ${stratHtml}
    </div>

    <details class="research">
      <summary><span class="tag">Дослідження</span><span class="t">Повний текст дослідження ${name}</span><span class="chev">›</span></summary>
      <div class="research-body">
        ${doslHtml}
      </div>
    </details>

    <div class="dl-row">
      <a class="dl-btn" href="${pdfHref}" download>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9m0 0L4.5 6.5M8 10l3.5-3.5M2 12.5v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        ${pdfLabel}
      </a>
    </div>
  </div>
</section>`;
}

// ---------- вкладка Огляд: календар + контент-план ----------
const oglyadStatus = statusOf(oglyadMd);
const oglyadHtml = render(oglyadMd);
const planHtml = render(planMd, 0); // тут заголовки не зсуваємо — власний h2-блок нижче

const calendarWidget = `
<div class="cal-block">
  <h2>Візуальний календар: 23 серпня – 30 вересня 2026</h2>
  <p class="note">Клітинки днів: спринт активу (23.08–29.08 — інфраструктура, без публікацій), дата запуску реклами (07.09), перший звіт (30.09). З 30.08 мітки — фактичні теми з контент-плану нижче (наведи або клікни на день); Пн/Ср/Чт LinkedIn — за діючою стратегією, з 07.09.</p>
  <div class="cal-legend">
    <span class="cal-tag fb">Facebook</span>
    <span class="cal-tag ig">Instagram</span>
    <span class="cal-tag th">Threads</span>
    <span class="cal-tag li">LinkedIn</span>
    <span class="cal-tag sprint">Спринт / віха</span>
  </div>
  <div id="calendar" class="cal-grid" aria-label="Календар 23 серпня – 30 вересня 2026"></div>
  <div id="cal-detail" class="cal-detail" hidden></div>
</div>`;

const planBlock = `
<div class="plan-block">
  <h2>Контент-план: спринт + вересень</h2>
  <div class="net-content">
    ${planHtml}
  </div>
</div>`;

const oglyadTab = `
<section class="tab-panel" id="tab-oglyad" role="tabpanel" aria-labelledby="navtab-oglyad">
  <header class="hero">
    <div class="wrap">
      <div class="kicker">SMM ReLink · Defence · Production</div>
      <h1>SMM-стратегія ReLink</h1>
      <p class="sub">Присутність агенції в соцмережах на квартал 23 серпня — 31 грудня 2026: LinkedIn, Facebook, Threads, Instagram. Один документ, п'ять вкладок.</p>
      ${oglyadStatus ? `<span class="badge ${badgeClass(oglyadStatus)}">${oglyadStatus}</span>` : ''}
    </div>
  </header>
  <div class="wrap">
    <div class="net-content">
      ${oglyadHtml}
    </div>
    ${calendarWidget}
    ${planBlock}
    <div class="dl-row">
      <a class="dl-btn pri" href="smm/pdf/smm-doslidzhennya-zvedene.pdf" download>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9m0 0L4.5 6.5M8 10l3.5-3.5M2 12.5v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Завантажити зведене дослідження (PDF)
      </a>
    </div>
  </div>
</section>`;

// ---------- вкладка LinkedIn: нативний вміст relink-linkedin-strategy.html ----------
const liSrc = readRoot('relink-linkedin-strategy.html');
const LI_START = '<header class="hero" id="top">';
const LI_END = '<footer>';
const liStartIdx = liSrc.indexOf(LI_START);
const liEndIdx = liSrc.indexOf(LI_END, liStartIdx);
if (liStartIdx === -1 || liEndIdx === -1) {
  throw new Error('Не знайдено межі вмісту в relink-linkedin-strategy.html — перевір маркери LI_START/LI_END');
}
const linkedinBody = liSrc.slice(liStartIdx, liEndIdx).trim();

const linkedinTab = `
<section class="tab-panel" id="tab-linkedin" role="tabpanel" aria-labelledby="navtab-linkedin" hidden>
  <div class="net-content li-native">
    ${linkedinBody}
  </div>
</section>`;

// ---------- мережеві вкладки ----------
const facebookTab = networkTab('facebook', 'Facebook', fbStratMd, fbDoslMd, 'smm/pdf/facebook-doslidzhennya.pdf', 'Завантажити дослідження Facebook (PDF)');
const threadsTab = networkTab('threads', 'Threads', thStratMd, thDoslMd, 'smm/pdf/threads-doslidzhennya.pdf', 'Завантажити дослідження Threads (PDF)');
const instagramTab = networkTab('instagram', 'Instagram', igStratMd, igDoslMd, 'smm/pdf/instagram-doslidzhennya.pdf', 'Завантажити дослідження Instagram (PDF)');

// ---------- фінальна збірка ----------
const html = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SMM-стратегія ReLink · LinkedIn, Facebook, Threads, Instagram</title>
<link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700&family=Onest:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;scroll-padding-top:64px}
:root{
  --amber:#DEA102; --amber-dk:#8A6400; --amber-dim:rgba(222,161,2,.14);
  --graphite:#394050; --grey:#707787; --plat:#EBEAE8;
  --bg:#EBEAE8; --card:#FFFFFF; --soft:#F4F3F1;
  --text:#394050; --text2:#4E5566; --dim:#707787;
  --line:rgba(57,64,80,.14);
  --shadow:0 1px 3px rgba(57,64,80,.06),0 6px 20px rgba(57,64,80,.05);
  --gr-amber:linear-gradient(157deg,#DEA102,#ECC668);
  --gr-graphite:linear-gradient(157deg,#394050,#C6D7FF);
  --gr-grey:linear-gradient(157deg,#707787,#E0EAFF);
  --net-fb:#DEA102; --net-ig:#707787; --net-th:#394050; --net-li:#C6D7FF;
}
body{background:var(--bg);color:var(--text);font-family:'Onest',sans-serif;font-size:16px;line-height:1.65}
.wrap{max-width:880px;margin:0 auto;padding:0 20px}

/* NAV */
nav{position:sticky;top:0;z-index:100;background:var(--graphite);box-shadow:var(--shadow)}
nav .navwrap{max-width:1000px;margin:0 auto;padding:0 20px;display:flex;align-items:center;gap:4px;overflow-x:auto;-webkit-overflow-scrolling:touch;height:56px}
.brandmark{height:22px;width:auto;flex-shrink:0;margin-right:14px}
.navtab{font-family:'Geologica',sans-serif;font-size:12.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#B7BCC7;background:transparent;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;white-space:nowrap}
.navtab:hover{color:var(--plat)}
.navtab.active{color:var(--graphite);background:var(--amber)}

/* HERO (Огляд і LinkedIn) */
.hero{background:var(--gr-graphite);color:var(--plat);padding:52px 0 40px}
.hero .kicker{font-family:'Geologica',sans-serif;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--amber);margin-bottom:16px}
.hero h1{font-family:'Geologica',sans-serif;font-weight:700;font-size:clamp(30px,5vw,44px);line-height:1.12;margin-bottom:12px}
.hero .sub{font-size:16.5px;color:#DCE0EA;max-width:640px;margin-bottom:18px}
.hero .meta{font-family:'Geologica',sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#A8AEBD}
.hero .meta b{color:var(--amber);font-weight:600}

/* TAB PANELS */
.tab-panel{padding-bottom:60px}
.net-head{padding:44px 0 8px;display:flex;flex-wrap:wrap;align-items:center;gap:14px}
.net-eyebrow{width:100%;font-family:'Geologica',sans-serif;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}
h1{font-family:'Geologica',sans-serif;font-weight:700;font-size:clamp(26px,4vw,36px)}
.badge{font-family:'Geologica',sans-serif;font-size:11.5px;font-weight:600;letter-spacing:.04em;padding:5px 12px;border-radius:20px;background:var(--soft);color:var(--text2);border:1px solid var(--line)}
.badge.ok{background:var(--amber-dim);color:var(--amber-dk);border-color:transparent}
.badge.pending{background:rgba(112,119,135,.16);color:var(--graphite);border-color:transparent}

/* CONTENT (з mdToHtml, і нативний вміст LinkedIn) */
.net-content h2{font-family:'Geologica',sans-serif;font-weight:700;font-size:clamp(22px,3vw,27px);line-height:1.22;padding-bottom:8px;border-bottom:3px solid var(--amber);margin:36px 0 16px}
.net-content h2:first-child{margin-top:8px}
.net-content h3{font-family:'Geologica',sans-serif;font-weight:700;font-size:18px;margin:24px 0 10px}
.net-content h4{font-family:'Geologica',sans-serif;font-weight:600;font-size:15.5px;margin:18px 0 8px;color:var(--text2)}
.net-content p{margin-bottom:13px;font-size:15.5px}
.net-content ul,.net-content ol{margin:0 0 14px 22px}
.net-content li{margin-bottom:7px;font-size:15.5px}
.net-content strong,.net-content b{font-weight:600;color:var(--graphite)}
.net-content em,.net-content i{color:var(--text2)}
.net-content code{font-family:ui-monospace,Consolas,monospace;font-size:.9em;background:var(--soft);border-radius:4px;padding:1px 6px}
.net-content a{color:var(--amber-dk)}
.net-content hr{border:none;border-top:1px solid var(--line);margin:26px 0}
.net-content td.num{font-family:'Geologica',sans-serif;font-weight:600;white-space:nowrap}
.doc-meta{background:var(--soft);border-left:4px solid var(--amber);border-radius:0 8px 8px 0;padding:12px 16px;font-size:13.5px;color:var(--text2);margin-bottom:18px}
.doc-meta code{background:var(--card)}
.note{color:var(--dim);font-size:13.5px;margin:6px 0 14px}

/* компоненти, перенесені разом з LinkedIn-стратегією (та сама верстка, перескіновано під v4.0) */
.li-native .part-label{font-family:'Geologica',sans-serif;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);margin:40px 0 4px}
.li-native section{padding:44px 0 8px;border-top:1px solid var(--line)}
.li-native .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:20px 22px;margin-bottom:14px}
.li-native .callout{background:var(--gr-amber);color:var(--graphite);border-radius:10px;padding:16px 20px;margin:18px 0}
.li-native .callout .big{font-family:'Geologica',sans-serif;font-weight:700;font-size:19px;margin-bottom:3px}
.li-native .callout p{margin:0}
.li-native .honesty{background:var(--card);border-left:4px solid var(--amber);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0;font-size:15px}
.li-native .gloss{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin:14px 0 20px}
.li-native .gloss div{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 14px;font-size:13.5px}
.li-native .gloss b{display:block;font-weight:600;margin-bottom:2px}
.li-native .phase{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--amber);border-radius:0 10px 10px 0;padding:18px 22px;margin-bottom:14px}
.li-native .phase .ph-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;margin-bottom:8px}
.li-native .phase .ph-num{font-family:'Geologica',sans-serif;font-weight:600;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--amber);background:var(--graphite);border-radius:4px;padding:3px 10px}
.li-native .phase .ph-title{font-family:'Geologica',sans-serif;font-weight:700;font-size:18px}
.li-native .phase .ph-time{font-family:'Geologica',sans-serif;font-size:13px;color:var(--dim);letter-spacing:.05em}
.li-native .phase p{font-size:15px;margin-bottom:8px}
.li-native .phase .ph-kpi{font-size:14px;background:var(--soft);border-radius:6px;padding:10px 14px;margin-top:10px}
.li-native .kpi-line{font-family:'Geologica',sans-serif;font-size:13px;letter-spacing:.03em;background:var(--soft);border-radius:6px;padding:10px 14px;margin-top:12px;color:var(--graphite)}
.li-native .kpi-line b{color:var(--amber-dk);font-weight:600}
.li-native details{background:var(--card);border:1px solid var(--line);border-radius:10px;margin-bottom:12px;overflow:hidden}
.li-native details summary{cursor:pointer;list-style:none;padding:16px 20px;display:flex;align-items:baseline;gap:12px}
.li-native details summary::-webkit-details-marker{display:none}
.li-native details summary .tag{font-family:'Geologica',sans-serif;font-size:12px;letter-spacing:.06em;color:var(--graphite);background:var(--amber);border-radius:4px;padding:2px 8px;white-space:nowrap}
.li-native details summary .t{font-weight:600;font-size:15.5px;flex:1}
.li-native details summary .chev{color:var(--dim);transition:transform .2s}
.li-native details[open] summary .chev{transform:rotate(90deg)}
.li-native details .body{padding:2px 20px 18px;border-top:1px solid var(--line)}
.li-native details .body p,.li-native details .body ul,.li-native details .body ol{font-size:15px}

/* TABLES */
.table-wrap{overflow-x:auto;margin:14px 0 20px;border:1px solid var(--line);border-radius:10px;background:var(--card)}
table{border-collapse:collapse;width:100%;min-width:520px;font-size:13.5px}
th{font-family:'Geologica',sans-serif;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;text-align:left;background:var(--graphite);color:var(--plat);padding:9px 11px}
td{padding:9px 11px;border-top:1px solid var(--line);vertical-align:top}
tr:nth-child(even) td{background:#F7F6F4}

/* DETAILS / ACCORDION (дослідження мереж) */
details.research{background:var(--card);border:1px solid var(--line);border-radius:10px;margin:24px 0;overflow:hidden}
details.research summary{cursor:pointer;list-style:none;padding:16px 20px;display:flex;align-items:baseline;gap:12px}
details.research summary::-webkit-details-marker{display:none}
details.research summary .tag{font-family:'Geologica',sans-serif;font-size:11px;font-weight:600;letter-spacing:.05em;color:var(--graphite);background:var(--amber);border-radius:4px;padding:3px 9px;white-space:nowrap}
details.research summary .t{font-weight:600;font-size:15px;flex:1}
details.research summary .chev{color:var(--dim);transition:transform .2s}
details.research[open] summary .chev{transform:rotate(90deg)}
.research-body{padding:4px 20px 22px;border-top:1px solid var(--line)}

/* DOWNLOAD BUTTON */
.dl-row{margin:28px 0 8px}
.dl-btn{display:inline-flex;align-items:center;gap:9px;font-family:'Onest',sans-serif;font-size:14px;font-weight:500;text-decoration:none;color:var(--text);background:var(--card);border:1px solid var(--line);border-radius:9px;padding:11px 18px}
.dl-btn:hover{border-color:var(--amber);color:var(--amber-dk)}
.dl-btn.pri{background:var(--amber);border-color:var(--amber);color:var(--graphite);font-weight:600}
.dl-btn.pri:hover{background:var(--amber-dk);color:#fff}

/* CALENDAR */
.cal-block{margin:44px 0 12px}
.cal-block h2{font-family:'Geologica',sans-serif;font-weight:700;font-size:24px;padding-bottom:8px;border-bottom:3px solid var(--amber);margin-bottom:6px}
.cal-legend{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 16px}
.cal-tag{font-family:'Geologica',sans-serif;font-size:11px;font-weight:600;letter-spacing:.03em;padding:4px 10px;border-radius:20px;color:#fff}
.cal-tag.fb{background:var(--net-fb);color:var(--graphite)}
.cal-tag.ig{background:var(--net-ig)}
.cal-tag.th{background:var(--net-th)}
.cal-tag.li{background:var(--net-li);color:var(--graphite)}
.cal-tag.sprint{background:var(--graphite);color:var(--plat)}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px}
.cal-dow{font-family:'Geologica',sans-serif;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);text-align:center;padding-bottom:6px}
.cal-day{min-height:74px;border-radius:8px;background:var(--soft);padding:6px;display:flex;flex-direction:column;gap:3px}
.cal-day.out{opacity:.35}
.cal-day.has-plan{cursor:pointer}
.cal-day.has-plan:hover{outline:2px solid var(--amber)}
.cal-day.is-selected{outline:2px solid var(--graphite)}
.cal-day .d{font-family:'Geologica',sans-serif;font-weight:600;font-size:12.5px}
.cal-day .chip{font-size:9.5px;font-weight:700;border-radius:5px;padding:1.5px 6px;line-height:1.5;color:#fff;align-self:flex-start}
.cal-day .chip.fb{background:var(--net-fb);color:var(--graphite)}
.cal-day .chip.ig{background:var(--net-ig)}
.cal-day .chip.th{background:var(--net-th)}
.cal-day .chip.li{background:var(--net-li);color:var(--graphite)}
.cal-day .chip.sprint{background:var(--graphite);color:var(--amber);align-self:stretch;text-align:center}
.cal-day .chip.milestone{background:var(--amber);color:var(--graphite);align-self:stretch;text-align:center}
.cal-detail{margin-top:14px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 20px}
.cal-detail .cd-date{font-family:'Geologica',sans-serif;font-weight:700;font-size:15px;margin-bottom:8px}
.cal-detail .cd-item{display:flex;gap:10px;align-items:baseline;margin-bottom:6px;font-size:14.5px}
.cal-detail .cd-item .chip{flex-shrink:0}
@media (max-width:640px){
  .cal-grid{grid-template-columns:repeat(7,1fr);gap:4px;padding:8px}
  .cal-day{min-height:54px;padding:4px}
  .cal-day .d{font-size:11px}
  .cal-day .chip{font-size:8px}
}

/* CONTENT-PLAN BLOCK */
.plan-block{margin:44px 0 12px}
.plan-block h2{font-family:'Geologica',sans-serif;font-weight:700;font-size:24px;padding-bottom:8px;border-bottom:3px solid var(--amber);margin-bottom:6px}
.plan-block .net-content h1{display:none} /* h1 файлу дублює заголовок блоку вище — ховаємо */
.plan-block .net-content h2{font-size:19px;margin-top:26px}

/* FOOTER */
footer{background:var(--graphite);color:#A8AEBD;margin-top:20px;padding:26px 0;font-size:13px}
footer .wrap{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between}
footer b{color:var(--amber)}
</style>
</head>
<body>

<nav><div class="navwrap">
  ${logoSvg}
  <button class="navtab active" id="navtab-oglyad" data-tab="oglyad">Огляд</button>
  <button class="navtab" id="navtab-linkedin" data-tab="linkedin">LinkedIn</button>
  <button class="navtab" id="navtab-facebook" data-tab="facebook">Facebook</button>
  <button class="navtab" id="navtab-threads" data-tab="threads">Threads</button>
  <button class="navtab" id="navtab-instagram" data-tab="instagram">Instagram</button>
</div></nav>

${oglyadTab}
${linkedinTab}
${facebookTab}
${threadsTab}
${instagramTab}

<footer><div class="wrap">
  <span><b>Re</b>Link · SMM-стратегія</span>
  <span>Серпень 2026 · Конфіденційно · Джерела: /smm (дослідження і стратегії по мережах), /context/контент-план.md</span>
</div></footer>

<script>
// ---- вкладки ----
(function(){
  var tabs = document.querySelectorAll('.navtab');
  var panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = btn.getAttribute('data-tab');
      tabs.forEach(function(b){ b.classList.toggle('active', b === btn); });
      panels.forEach(function(p){ p.hidden = (p.id !== 'tab-' + id); });
      window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
    });
  });
})();

// ---- календар, синхронізований з контент-планом ----
(function(){
  var el = document.getElementById('calendar');
  var detailEl = document.getElementById('cal-detail');
  if (!el) return;

  var PLAN = ${JSON.stringify(planByDate)};
  var NET_NAME = { fb:'Facebook', ig:'Instagram', th:'Threads', li:'LinkedIn' };

  var SPRINT_START = new Date(2026,7,23); // 23 серпня
  var SPRINT_INFRA_END = new Date(2026,7,29); // 29 серпня — до перших публікацій
  var LAUNCH = new Date(2026,8,7);  // 7 вересня
  var REPORT = new Date(2026,8,30); // 30 вересня
  var RANGE_START = SPRINT_START;
  var RANGE_END = REPORT;

  function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  function inRange(d,a,b){ return d>=a && d<=b; }
  function addDays(d,n){ var r=new Date(d); r.setDate(r.getDate()+n); return r; }
  function mondayOnOrBefore(d){ var dow=(d.getDay()+6)%7; return addDays(d,-dow); }
  function sundayOnOrAfter(d){ var dow=(d.getDay()+6)%7; return addDays(d,6-dow); }
  function dateKey(d){ var mm=String(d.getMonth()+1).padStart(2,'0'); var dd=String(d.getDate()).padStart(2,'0'); return d.getFullYear()+'-'+mm+'-'+dd; }

  var monthShort = ['січ','лют','бер','кві','тра','чер','лип','сер','вер','жов','лис','гру'];
  var dowNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];

  var gridStart = mondayOnOrBefore(RANGE_START);
  var gridEnd = sundayOnOrAfter(RANGE_END);

  var cells = [];
  for (var d = new Date(gridStart); d <= gridEnd; d = addDays(d,1)) {
    var out = d < RANGE_START || d > RANGE_END;
    cells.push({ date: new Date(d), out: out });
  }

  var liWeekday = { 1:'LinkedIn: пост Олени', 3:'LinkedIn: сторінка', 4:'LinkedIn: пост + рекрутер' };

  var html = dowNames.map(function(n){ return '<div class="cal-dow">'+n+'</div>'; }).join('');
  var itemsByKey = {}; // повний список пунктів дня (з LinkedIn) — джерело і для чипів, і для панелі деталей

  cells.forEach(function(c, idx){
    var d = c.date;
    var key = dateKey(d);
    var chips = '';
    var items = (!c.out && PLAN[key]) ? PLAN[key].slice() : [];
    if (!c.out){
      var dow = (d.getDay()+6)%7+1;
      if (d >= LAUNCH && liWeekday[dow]) items.push({ net:'li', theme: liWeekday[dow] });

      if (items.length) {
        var seen = {};
        items.forEach(function(it){
          if (seen[it.net]) return;
          seen[it.net] = true;
          var count = items.filter(function(x){ return x.net===it.net; }).length;
          chips += '<span class="chip '+it.net+'" title="'+NET_NAME[it.net]+': '+it.theme.replace(/"/g,'&quot;')+'">'+NET_NAME[it.net]+(count>1?' ('+count+')':'')+'</span>';
        });
      } else if (inRange(d, SPRINT_START, SPRINT_INFRA_END)) {
        chips += '<span class="chip sprint">Спринт активу</span>';
      }
      if (sameDay(d, LAUNCH)) chips += '<span class="chip milestone">Запуск реклами</span>';
      if (sameDay(d, REPORT)) chips += '<span class="chip milestone">Звіт №1</span>';
    }
    itemsByKey[key] = items;

    var label = String(d.getDate());
    if (d.getDate() === 1 || idx === 0) label += ' ' + monthShort[d.getMonth()];
    var clickable = !c.out && items.length > 0;
    html += '<div class="cal-day'+(c.out?' out':'')+(clickable?' has-plan':'')+'" data-key="'+key+'" data-clickable="'+(clickable?1:0)+'"><span class="d">'+label+'</span>'+chips+'</div>';
  });

  el.innerHTML = html;

  function showDetail(key, dayEl){
    var items = itemsByKey[key] || [];
    if (!items.length) { detailEl.hidden = true; return; }
    var d = dayEl.querySelector('.d').textContent;
    var html = '<div class="cd-date">'+d+'</div>';
    items.forEach(function(it){
      html += '<div class="cd-item"><span class="chip '+it.net+'">'+NET_NAME[it.net]+'</span><span>'+it.theme+'</span></div>';
    });
    detailEl.innerHTML = html;
    detailEl.hidden = false;
    document.querySelectorAll('.cal-day.is-selected').forEach(function(x){ x.classList.remove('is-selected'); });
    dayEl.classList.add('is-selected');
  }

  el.querySelectorAll('.cal-day[data-clickable="1"]').forEach(function(dayEl){
    dayEl.addEventListener('click', function(){ showDetail(dayEl.dataset.key, dayEl); });
  });
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'relink-smm-strategy.html'), html, 'utf8');
console.log('OK: relink-smm-strategy.html (' + html.length + ' bytes)');
