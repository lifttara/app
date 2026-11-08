// cloud (Firebase z internetu) sa načíta až po vykreslení obsahu, aby nebrzdil štart;
// ak sa nenačíta, appka ukáže dôvod v Nastaveniach
// Safari pri slabom signáli (napr. hneď po prebudení appky) niekedy modul nestiahne – skúsi sa ešte 2× s pauzou
let cloudTry = 0;
const loadCloud = () => import(`./cloud.js${cloudTry ? `?pokus=${cloudTry}` : ''}`).catch((e) => {
  cloudTry++;
  if (cloudTry < 3) { setTimeout(loadCloud, cloudTry * 2500); return; }
  window.cloudError = (e && (e.message || String(e))) || 'neznáma chyba';
  window.dispatchEvent(new Event('cloud-ready'));
});
if (window.DEMO) { /* v ukážke sa cloud nenačíta */ } else if (document.readyState === 'complete') loadCloud(); else window.addEventListener('load', loadCloud, { once: true });
