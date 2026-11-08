// Štýly appky sa načítajú bez blokovania vykreslenia (namiesto inline onload, ktorý by CSP zablokovala)
(function () {
  var l = document.getElementById('app-css');
  if (!l) return;
  var done = function () {
    if (l.media === 'all') return;
    l.media = 'all';
    document.documentElement.classList.add('css-ready');
    window.dispatchEvent(new Event('cssready'));
  };
  if (l.sheet) done(); else l.addEventListener('load', done);
})();
