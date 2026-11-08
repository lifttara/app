// ukážková verzia (?demo): vlastné dáta v zariadení, bez cloudu a Google
window.DEMO = new URLSearchParams(location.search).has('demo');
if (window.DEMO) window.cloudError = 'demo';
