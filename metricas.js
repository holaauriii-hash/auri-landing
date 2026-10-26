// Métricas anónimas de la web: sin cookies, sin IP, sin datos personales.
// Cuenta visitas, clics en WhatsApp/admisión y el uso del test gratuito.
(function () {
  var URL_EVENTOS = 'https://eqgkelepbznnemweczhc.supabase.co/functions/v1/registrar-evento';
  // Respeta "No rastrear" del navegador.
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') { window.auriEvento = function () {}; return; }
  var sesion = '';
  try {
    sesion = sessionStorage.getItem('auri_s') || '';
    if (!sesion) { sesion = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); sessionStorage.setItem('auri_s', sesion); }
  } catch (e) { sesion = ''; }
  var origen = '';
  try {
    var q = new URLSearchParams(location.search);
    origen = q.get('utm_source') || (document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '');
    if (origen === location.hostname) origen = '';
  } catch (e) {}
  window.auriEvento = function (evento) {
    try {
      var cuerpo = JSON.stringify({ fuente: 'web', evento: evento, ruta: location.pathname, origen: origen, sesion: sesion });
      if (navigator.sendBeacon) navigator.sendBeacon(URL_EVENTOS, new Blob([cuerpo], { type: 'text/plain' }));
      else fetch(URL_EVENTOS, { method: 'POST', body: cuerpo, keepalive: true, headers: { 'Content-Type': 'text/plain' } });
    } catch (e) {}
  };
  window.auriEvento('visita');
  // Clics en botones de WhatsApp y de admisión (la página los marca con data-wa / #btnAdmision)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-evento], [data-wa], a[href*="wa.me"], #btnAdmision, [data-admision]');
    if (!a) return;
    window.auriEvento(a.getAttribute('data-evento') || (a.matches('#btnAdmision, [data-admision]') ? 'clic_admision' : 'clic_whatsapp'));
  });
})();
