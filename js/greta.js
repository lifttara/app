'use strict';

/* =========================================================
   Babka Greta – maskot Lift Tara. Na obrazovke Dnes povie
   krátku hlášku (každý deň inú, počas dňa sa nemení).
   ========================================================= */
const GRETA_IMG = 'icons/greta/avatar.jpg';
const GRETA_TRAINER = [
  'Ráno som odcvičila skôr, než vstali sliepky. Ty máš na to celý deň.',
  'Nevynechávaj. Vymeň. Kto hľadá, nájde spôsob.',
  'Voda, spánok, kroky. Toto som vedela aj bez appky.',
  'Rekordy sa nerobia na gauči.',
  'Aj ja som raz začínala. V roku 1962.',
  'Zjedz niečo poriadne, vyzeráš ako rezanec.',
  'Radšej o jedno opakovanie menej, ale poriadne.',
  'Kolená von, hrudník hore. Ja drepujem hlbšie aj s vrecom zemiakov.'
];
const gretaPick = (list) => {
  const d = new Date();
  const day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  return list[day % list.length];
};
const gretaHtml = (text, cls = '', pose = '') => `<div class="greta${cls ? ' ' + cls : ''}${pose ? ' has-pose' : ''}">
  ${pose ? `<img class="greta-pose" src="${gretaPose(pose)}" alt="Babka Greta" loading="lazy">` : `<img src="${GRETA_IMG}" alt="Babka Greta" width="52" height="52" loading="lazy">`}
  <div class="greta-bubble"><b>Greta</b>${esc(tr(text))}</div>
</div>`;
// Greta v rôznych úlohách (výrezy s priehľadným pozadím)
const gretaPose = (name) => `icons/greta/${name}.webp`;
// Dnes: Greta reaguje na situáciu – dlho necvičil / splnený týždeň / inak denná hláška
function gretaToday() {
  if (typeof doneSessions !== 'function') return { text: gretaPick(GRETA_TRAINER) };
  const done = doneSessions();
  const last = done[done.length - 1];
  const days = last ? Math.round((parseDate(today()) - parseDate(last.date)) / 864e5) : null;
  if (days != null && days >= 7) return { pose: 'ruky-v-bok', text: `${days} dní bez tréningu? Tak toto nie. Dnes ideš cvičiť.` };
  const p = typeof profile === 'function' ? profile() : null;
  const target = Number(p?.days) || 3;
  if (p && weekDone(startOfWeek(today())).length >= target) return { pose: 'tlieska', text: 'Týždeň splnený! Som na teba hrdá.' };
  return { text: gretaPick(GRETA_TRAINER) };
}

const renderWithoutGreta = render;
render = function (...args) {
  const r = renderWithoutGreta.apply(this, args);
  const h = location.hash || '#/';
  if ((h === '#/' || h === '#') && !document.getElementById('greta-home')) {
    const g = gretaToday();
    const html = gretaHtml(g.text, '', g.pose).replace('<div class="greta', '<div id="greta-home" class="greta');
    // Dnes: Greta je prvá v pravom stĺpci (na mobile sa cez CSS order zobrazí hneď pod úvodom)
    const side = document.querySelector('main .today-side');
    const hero = document.querySelector('#main > .hero, main > .hero');
    if (side) side.insertAdjacentHTML('afterbegin', html);
    else if (hero) hero.insertAdjacentHTML('afterend', html);
  }
  if (h === '#/program' && !document.getElementById('greta-program')) {
    const head = document.querySelector('main .page-head');
    if (head) head.insertAdjacentHTML('afterend', gretaHtml('Toto je tvoj plán. Cvič po poradí a nič nevynechaj.', 'greta-side', 'zapisnik').replace('<div class="greta', '<div id="greta-program" class="greta'));
  }
  return r;
};
