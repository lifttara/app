'use strict';

/* =========================================================
   Miniatúry cvikov – moderné piktogramy (SVG) v štýle športových piktogramov
   Postava: plná hlava, hrubý trup, zaoblené končatiny; vzdialenejšia ruka a noha
   sú priesvitnejšie (hĺbka). Náradie (.eq) a podlaha (.fl) majú tyrkysový prechod.
   Kľúč = názov cviku bez diakritiky a malými písmenami; ak cvik nemá vlastný
   obrázok, použije sa piktogram jeho partie, inak všeobecná činka.
   ========================================================= */
const EXERCISE_ICONS = (() => {
  // rámček 48 × 48, body zadávané ako [x, y]
  // Postava je plná silueta: časti tela sú zúžené „kapsuly“ (hrubšie stehno, tenšie lýtko…),
  // ktoré sa prekrývajú do jedného tvaru – ako siluety na fitness plagátoch.
  const r1 = (v) => Math.round(v * 10) / 10;
  const dot = ([x, y], r) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}"/>`;
  const cap = (a, b, ra, rb) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 0.001;
    const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const s = Math.max(-0.95, Math.min(0.95, (ra - rb) / L)), c = Math.sqrt(1 - s * s);
    const pt = (o, r, sg) => [r1(o[0] + r * (sg * nx * c + ux * s)), r1(o[1] + r * (sg * ny * c + uy * s))];
    const [a1, b1, b2, a2] = [pt(a, ra, 1), pt(b, rb, 1), pt(b, rb, -1), pt(a, ra, -1)];
    // lichobežník medzi dotyčnicami + kruhy na koncoch (zaoblené kĺby)
    return `<path d="M${a1}L${b1}L${b2}L${a2}Z"/>`.replace(/,/g, ' ') + dot(a, ra) + dot(b, rb);
  };
  const add = (p, dx, dy) => [p[0] + dx, p[1] + dy];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  // ruka: rameno → lakeť → dlaň (ramenný sval, predlaktie, päsť)
  const arm = (s, [e, hnd]) => cap(s, e, 2.3, 1.7) + cap(e, hnd, 1.7, 1.25) + dot(hnd, 1.6);
  // noha: bedro → koleno → členok + chodidlo smerom „dopredu“
  const leg = (hp, [k, f], dir) => {
    const ux = f[0] - k[0], uy = f[1] - k[1], L = Math.hypot(ux, uy) || 1;
    const toe = Math.abs(uy / L) > 0.6 ? [f[0] + dir * 3.4, f[1] + 0.4] : [f[0] + (ux / L) * 2.6, f[1] + 1.8];
    return cap(hp, k, 3.1, 2.1) + cap(k, f, 2.1, 1.25) + cap(f, toe, 1.25, 1.05);
  };
  // postava: h hlava, n ramená (krk), p panva; a1/l1 bližšia ruka/noha [lakeť/koleno, dlaň/chodidlo], a2/l2 vzdialenejšia
  // front: pohľad spredu (a1/l1 = ľavá strana obrázka); dir: kam smerujú chodidlá pri pohľade zboku
  // Postava v štýle športových piktogramov: končatiny rovnako hrubé čiary so zaoblenými koncami,
  // okrúhla hlava oddelená od tela medzerou, vzdialenejšia ruka a noha oddelené tenkým obrysom.
  const LW = 5;                                         // hrúbka končatín
  const pth = (pts, w) => `<path d="M${pts.map((q) => `${r1(q[0])} ${r1(q[1])}`).join('L')}" stroke-width="${w}"/>`;
  const fig = ({ h, n, p, a1, a2, l1, l2, front = false }) => {
    const part = [], back = [];
    if (front) {
      const sl = add(n, -4.6, 1.6), sr = add(n, 4.6, 1.6), hl = add(p, -2.6, 0), hr = add(p, 2.6, 0);
      part.push(pth([add(n, 0, 2.8), add(p, 0, -0.4)], 11.5) + pth([add(n, -3.4, 1.8), add(n, 3.4, 1.8)], 4.6));
      if (l1) part.push(pth([hl, ...l1], LW + 0.4)); if (l2) part.push(pth([hr, ...l2], LW + 0.4));
      if (a1) part.push(pth([sl, ...a1], LW)); if (a2) part.push(pth([sr, ...a2], LW));
    } else {
      const sh = lerp(n, p, 0.08);
      if (a2) back.push(pth([sh, ...a2], LW)); if (l2) back.push(pth([p, ...l2], LW + 0.4));
      part.push(pth([n, p], 9.4));
      if (l1) part.push(pth([p, ...l1], LW + 0.4)); if (a1) part.push(pth([sh, ...a1], LW));
    }
    const body = part.join('');
    const halo = body.replace(/stroke-width="([\d.]+)"/g, (m, w) => `stroke-width="${r1(Number(w) + 2.6)}"`);
    const head = `<circle class="gap-f" cx="${h[0]}" cy="${h[1]}" r="6.4"/><circle class="hd" cx="${h[0]}" cy="${h[1]}" r="4.9"/>`;
    return (back.length ? `<g class="fg">${back.join('')}</g><g class="gap">${body}</g>` : '') + `<g class="fg">${body}</g>` + head;
  };
  const eq = (inner) => `<g class="eq">${inner}</g>`;
  const plate = (x, y, r = 5) => eq(`<circle class="pl" cx="${x}" cy="${y}" r="${r}"/>`);            // činka zboku (kotúč)
  const dumbbell = (x, y) => eq(`<rect class="pl" x="${x - 3.4}" y="${y - 2.4}" width="6.8" height="4.8" rx="2"/>`);
  const barFront = (x1, x2, y) => eq(`<path d="M${x1} ${y}H${x2}" stroke-width="2.4"/><rect class="pl" x="${x1 - 2.2}" y="${y - 4.5}" width="4.4" height="9" rx="1.6"/><rect class="pl" x="${x2 - 2.2}" y="${y - 4.5}" width="4.4" height="9" rx="1.6"/>`);
  const floor = '<path class="fl" d="M6 42.5h36"/>';

  const icons = {
    // Nohy
    'drep': plate(25, 14.5, 5.4) + fig({ h: [31, 11], n: [27, 17], p: [15, 28], a1: [[21, 21], [24, 15]], a2: [[23, 22], [26, 16]], l1: [[29, 29], [27, 43]], l2: [[27, 31], [23, 43]] }) + floor,
    'leg press': eq('<path d="M5 39h12L10 22"/><path d="M34 13l5 19M37 22l7 5" />') + fig({ h: [8, 17], n: [11, 22], p: [16, 34], a1: [[13, 30], [17, 34]], l1: [[24, 23], [35, 22]], l2: [[25, 26], [36, 26]] }) + floor,
    'vypady': fig({ h: [24, 8], n: [24, 14], p: [22, 27], a1: [[25, 21], [25, 28]], a2: [[23, 21], [22, 28]], l1: [[32, 28], [33, 42]], l2: [[14, 37], [6, 41]] }) + dumbbell(25, 30) + floor,
    'rumunsky mrtvy tah': fig({ h: [35, 15], n: [30, 18], p: [18, 24], a1: [[30, 25], [29, 31]], a2: [[28, 25], [27, 31]], l1: [[20, 33], [19, 41]], l2: [[22, 33], [22, 41]] }) + plate(29, 32, 4.8) + floor,
    // Zadok
    'hip thrust': eq('<path d="M3 30h11v12"/>') + fig({ h: [8, 24], n: [12, 28], p: [25, 25], a1: [[18, 24], [24, 21]], l1: [[34, 26], [34, 41]], l2: [[32, 27], [31, 41]] }) + plate(24, 19.5, 4.6) + floor,
    // Chrbát
    'mrtvy tah': fig({ h: [33, 11], n: [28, 17], p: [16, 24], a1: [[27, 24], [25, 32]], a2: [[25, 25], [23, 32]], l1: [[26, 31], [24, 43]], l2: [[23, 32], [20, 43]] }) + plate(24, 33, 5.8) + floor,
    'pritahy na hrazde': eq('<path d="M3 4.5h42" stroke-width="3"/>') + fig({ front: true, h: [24, 9], n: [24, 15], p: [24, 28], a1: [[13, 11], [15, 4]], a2: [[35, 11], [33, 4]], l1: [[20, 35], [24, 42]], l2: [[28, 35], [31, 41]] }) + floor,
    'veslovanie s cinkou': eq('<path d="M4 31h15M7 31v11M16 31v11"/>') + fig({ h: [9, 16], n: [15, 20], p: [29, 21], a1: [[23, 15], [22, 25]], a2: [[12, 25], [12, 30]], l1: [[29, 31], [30, 41]], l2: [[33, 31], [35, 41]] }) + dumbbell(22, 26) + floor,
    'stiahnutie kladky': eq('<path d="M24 1.5v5.5M11 7.5h26" stroke-width="2.6"/><path d="M14 34h20"/>') + fig({ front: true, h: [24, 15], n: [24, 21], p: [24, 33], a1: [[13, 16], [14, 8]], a2: [[35, 16], [34, 8]], l1: [[18, 37], [18, 44]], l2: [[30, 37], [30, 44]] }),
    // Hrudník
    'bench press': eq('<path d="M5 34h31M9 34v9M32 34v9"/>') + fig({ h: [9, 28], n: [14, 30], p: [28, 30], a1: [[15, 21], [16, 12]], a2: [[17, 21], [18, 12]], l1: [[36, 29], [39, 43]], l2: [[34, 31], [36, 43]] }) + plate(17, 11, 5.4) + floor,
    'kliky': fig({ h: [40, 20], n: [35, 24], p: [18, 30], a1: [[34, 32], [34, 40]], a2: [[32, 32], [32, 40]], l1: [[12, 35], [6, 40]], l2: [[13, 36], [8, 41]] }) + floor,
    // Ramená
    'tlaky nad hlavu': barFront(5, 43, 4.5) + fig({ front: true, h: [24, 12], n: [24, 18], p: [24, 30], a1: [[14, 13], [12, 5]], a2: [[34, 13], [36, 5]], l1: [[18, 36], [14, 43]], l2: [[30, 36], [34, 43]] }) + floor,
    'upazovanie': fig({ front: true, h: [24, 10], n: [24, 16], p: [24, 29], a1: [[15, 15], [7, 13]], a2: [[33, 15], [41, 13]], l1: [[20, 36], [17, 43]], l2: [[28, 36], [31, 43]] }) + dumbbell(6, 13) + dumbbell(42, 13) + floor,
    // Ruky
    'bicepsovy zdvih': fig({ front: true, h: [24, 9], n: [24, 15], p: [24, 28], a1: [[16, 23], [13, 15]], a2: [[32, 22], [34, 30]], l1: [[19, 35], [16, 43]], l2: [[29, 35], [32, 43]] }) + dumbbell(13, 14) + dumbbell(34, 31) + floor,
    'tricepsove stlacenie': eq('<path d="M32 2v4M31 6L29 25" stroke-width="2.2"/><path d="M26 26h6" stroke-width="2.8"/>') + fig({ h: [21, 10], n: [21, 16], p: [20, 29], a1: [[23, 23], [29, 26]], a2: [[21, 23], [27, 27]], l1: [[22, 35], [22, 42]], l2: [[19, 35], [18, 42]] }) + floor,
    // Core
    'plank': fig({ h: [41, 22], n: [36, 25], p: [19, 29], a1: [[36, 33], [36, 41]], a2: [[34, 33], [34, 41]], l1: [[12, 34], [4, 39]], l2: [[13, 35], [6, 40]] }) + floor,
    'dead bug': fig({ h: [8, 36], n: [13, 37], p: [26, 37], a1: [[14, 29], [15, 21]], a2: [[8, 31], [3, 27]], l1: [[27, 28], [35, 28]], l2: [[34, 35], [43, 34]] }) + floor,
    // Celé telo
    'kettlebell swing': fig({ h: [21, 10], n: [21, 16], p: [20, 28], a1: [[28, 18], [35, 19]], a2: [[27, 19], [34, 20]], l1: [[23, 35], [23, 42]], l2: [[19, 35], [17, 42]] }) + eq('<circle class="pl" cx="38" cy="23.5" r="4.2"/><path d="M35.2 20a2.8 2.8 0 0 1 5.6 0"/>') + floor,
    'burpees': fig({ front: true, h: [24, 8], n: [24, 14], p: [24, 26], a1: [[18, 8], [16, 2]], a2: [[30, 8], [32, 2]], l1: [[20, 32], [20, 38]], l2: [[28, 32], [28, 38]] }) + eq('<path d="M15 41.5l-3 2M33 41.5l3 2" opacity=".7"/>') + floor,
    // Kardio
    'veslovaci trenazer': eq('<path d="M4 41h40M39 41V30"/><circle cx="40" cy="26" r="4.2"/><path d="M17 25L36 26" stroke-width="1.8" opacity=".8"/>') + fig({ h: [11, 16], n: [12, 22], p: [14, 35], a1: [[9, 28], [17, 25]], l1: [[24, 26], [33, 34]], l2: [[25, 28], [34, 36]] })
  };
  const run = fig({ h: [27, 8], n: [26, 14], p: [22, 26], a1: [[31, 18], [35, 14]], a2: [[19, 20], [14, 17]], l1: [[30, 31], [28, 40]], l2: [[16, 33], [10, 30]] }) + floor;
  const categories = {
    'nohy': icons['drep'], 'zadok': icons['hip thrust'], 'chrbat': icons['mrtvy tah'], 'hrudnik': icons['bench press'],
    'ramena': icons['tlaky nad hlavu'], 'ruky': icons['bicepsovy zdvih'], 'core': icons['plank'],
    'cele telo': icons['kettlebell swing'], 'kardio': run
  };
  const generic = barFront(8, 40, 24) + eq('<path d="M13 17v14M35 17v14" stroke-width="3"/>');
  const fold = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  // prechody farieb (gradient) – definované raz v dokumente, súradnice v rámčeku 48 × 48
  // (userSpaceOnUse: funguje aj pre vodorovné/zvislé čiary, ktoré nemajú výšku/šírku)
  const defs = () => {
    if (typeof document === 'undefined' || !document.body || document.getElementById('exg-defs')) return;
    document.body.insertAdjacentHTML('beforeend', `<svg id="exg-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="exg-body" gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="40"><stop offset="0" class="exg-b0"/><stop offset="1" class="exg-b1"/></linearGradient>
      <linearGradient id="exg-eq" gradientUnits="userSpaceOnUse" x1="6" y1="4" x2="42" y2="44"><stop offset="0" class="exg-e0"/><stop offset="1" class="exg-e1"/></linearGradient>
    </defs></svg>`);
  };
  const svg = (inner) => `<svg class="ex-thumb" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  return (exercise) => (defs(), svg(icons[fold(exercise?.name)] || categories[fold(exercise?.category)] || generic));
})();

/* =========================================================
   Technika cvikov – krátke rady pre základné cviky (keď tréner nenapísal vlastný popis)
   Kľúč = názov cviku bez diakritiky a malými písmenami.
   ========================================================= */
const EXERCISE_TIPS = {
  'drep': ['Chodidlá na šírku ramien, špičky mierne von.', 'Zadok dozadu a dole, kolená idú v smere špičiek.', 'Chrbát rovný, hrudník hore, päty celý čas na zemi.', 'Choď aspoň do paralely, hore sa odraz celým chodidlom.'],
  'leg press': ['Chodidlá na plošine na šírku ramien, celé chodidlo na plošine.', 'Spúšťaj pomaly, kým stehná nie sú zhruba v pravom uhle.', 'Driek ostáva pritlačený k operadlu.', 'Hore nezamykaj kolená úplne.'],
  'vypady': ['Krok dopredu dlhší, trup vzpriamený.', 'Zadné koleno ide kolmo dole takmer k zemi.', 'Predné koleno nad členkom, nepadá dovnútra.', 'Odraz cez pätu prednej nohy.'],
  'rumunsky mrtvy tah': ['Kolená len mierne pokrčené, celý čas rovnako.', 'Pohyb ide z bokov – zadok tlač dozadu.', 'Činka tesne pri stehnách, chrbát rovný.', 'Choď len kým cítiš ťah v zadnej strane stehien.'],
  'hip thrust': ['Lopatky opreté o lavičku, chodidlá na šírku bokov.', 'Bradu drž pri hrudi, rebrá dole.', 'Hore zatni zadok, boky v jednej línii s kolenami a ramenami.', 'Neprehýbaj sa v driekovej chrbtici.'],
  'mrtvy tah': ['Činka nad stredom chodidla, ramená mierne pred činkou.', 'Pred ťahom napni chrbát a „odlomi“ činku zo zeme.', 'Činka ide tesne po holeniach a stehnách.', 'Hore vystri boky, nezakláňaj sa.'],
  'pritahy na hrazde': ['Úchop trochu širší ako ramená.', 'Začni stiahnutím lopatiek dole a k sebe.', 'Ťahaj lakte k bokom, brada nad hrazdu.', 'Spúšťaj sa kontrolovane do takmer vystretých rúk.'],
  'veslovanie s cinkou': ['Opri sa rukou a kolenom o lavičku, chrbát rovno.', 'Ťahaj lakeť dozadu k boku, nie hore k uchu.', 'Hore stiahni lopatku, chvíľu podrž.', 'Neotáčaj trup, pohyb ide len z ruky a lopatky.'],
  'stiahnutie kladky': ['Úchop trochu širší ako ramená, sed vzpriamene.', 'Ťahaj tyč k hornej časti hrudníka.', 'Lakte smerujú dole k bokom, lopatky dole.', 'Nezakláňaj sa a nehojdaj trupom.'],
  'bench press': ['Lopatky stiahnuté a pritlačené k lavičke.', 'Chodidlá pevne na zemi, malý oblúk v chrbte je v poriadku.', 'Činka ide na spodnú časť hrudníka, lakte asi 45° od tela.', 'Tlač hore a mierne k hlave.'],
  'kliky': ['Ruky trochu širšie ako ramená, telo v jednej línii.', 'Zatni brucho a zadok, boky nepadajú.', 'Lakte smerujú šikmo dozadu, nie do strán.', 'Hrudník ide takmer k zemi.'],
  'tlaky nad hlavu': ['Zatni brucho a zadok, nezakláňaj sa.', 'Činka ide tesne okolo tváre rovno hore.', 'Hore sú ruky vedľa uší, hlava mierne vpred.', 'Spúšťaj kontrolovane k hornej časti hrudníka.'],
  'upazovanie': ['Mierne pokrčené lakte, ramená dole od uší.', 'Dvíhaj do strán len po výšku ramien.', 'Vedie lakeť, nie dlaň.', 'Spúšťaj pomaly, bez hojdania.'],
  'bicepsovy zdvih': ['Lakte pri tele, nehýbu sa dopredu.', 'Zdvihni s výdychom, hore zatni biceps.', 'Spúšťaj pomaly do takmer vystretých rúk.', 'Nehojdaj trupom.'],
  'tricepsove stlacenie': ['Lakte pri bokoch, nehýbu sa.', 'Tlač dole až do vystretých rúk.', 'Dole chvíľu podrž, hore pomaly.', 'Trup mierne naklonený, ramená dole.'],
  'plank': ['Lakte pod ramenami, telo v jednej línii.', 'Zatni brucho a zadok, boky nepadajú ani netrčia.', 'Hlava v predĺžení chrbta, pozeraj do zeme.', 'Dýchaj pokojne, nezadržiavaj dych.'],
  'dead bug': ['Ľahni na chrbát, ruky hore, kolená nad bokmi v 90°.', 'Driek pritlačený k zemi celý čas.', 'Pomaly vystri opačnú ruku a nohu.', 'Vráť sa a vymeň strany, s výdychom.'],
  'kettlebell swing': ['Pohyb ide z bokov, nie z drepu.', 'Kettlebell pošli dozadu medzi nohy, chrbát rovný.', 'Výbušne vystri boky a zatni zadok.', 'Ruky len vedú, kettlebell letí do výšky hrudníka.'],
  'burpees': ['Z drepu polož ruky na zem a vyskoč do kliku.', 'Telo v kliku rovné, boky nepadajú.', 'Nohy vráť k rukám a vyskoč s rukami hore.', 'Dopadaj mäkko na celé chodidlá.'],
  'veslovaci trenazer': ['Poradie: nohy – trup – ruky, späť naopak.', 'Odraz nohami, trup mierne dozadu.', 'Ťahaj rukoväť k spodným rebrám.', 'Chrbát rovný, ramená dole.']
};
const EXERCISE_TIP_KEY = (name) => String(name ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const exerciseTips = (exercise) => EXERCISE_TIPS[EXERCISE_TIP_KEY(exercise?.name)] || null;
// odkaz na video: YouTube → adresa na vloženie (bez sledovacích cookies), iné https odkazy ostanú odkazom
function exerciseVideo(url) {
  const u = String(url || '').trim();
  if (!/^https:\/\/[^\s"'<>]+$/.test(u)) return null;
  const m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? { embed: `https://www.youtube-nocookie.com/embed/${m[1]}`, url: u } : { embed: '', url: u };
}
