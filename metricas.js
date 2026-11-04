// Métricas anónimas de la web: sin cookies, sin IP, sin datos personales.
// Cuenta visitas, clics en WhatsApp/admisión y el uso del test gratuito.
(function () {
  var URL_EVENTOS = 'https://eqgkelepbznnemweczhc.supabase.co/functions/v1/registrar-evento';
  // Respeta "No rastrear" del navegador.
  // Tampoco cuenta las pruebas locales (localhost / archivos abiertos desde el disco).
  var h = location.hostname;
  if (!h || h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || location.protocol === 'file:') { window.auriEvento = function () {}; return; }
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
    // Además, desde qué parte de la página se hizo el clic (portada, cierre, tarifa social…)
    var zona = a.closest('header') ? 'menu' : (a.closest('section[id]') ? a.closest('section[id]').id : (a.closest('.hero') ? 'portada' : (a.closest('.cierre') ? 'cierre' : (a.closest('#dlgAdmision') ? 'ventana' : 'otro'))));
    window.auriEvento(('clic_' + (a.matches('[data-admision]') ? 'adm' : 'wa') + '_' + zona).replace(/[^a-z0-9_]/g, '_').slice(0, 40));
  });

  // ── Más detalle, siempre anónimo ──
  // Preguntas frecuentes abiertas: faq_1, faq_2… (orden en que aparecen en la página)
  try {
    var faqs = document.querySelectorAll('#preguntas details');
    faqs.forEach(function (d, i) {
      d.addEventListener('toggle', function () { if (d.open) window.auriEvento('faq_' + (i + 1)); });
    });
  } catch (e) {}
  // Secciones vistas (una vez por visita): ver_sobre_mi, ver_pasos, ver_contacto…
  try {
    if ('IntersectionObserver' in window) {
      var visto = {};
      var io = new IntersectionObserver(function (items) {
        items.forEach(function (it) {
          if (!it.isIntersecting || visto[it.target.id]) return;
          visto[it.target.id] = 1;
          window.auriEvento(('ver_' + it.target.id).replace(/[^a-z0-9_]/g, '_').slice(0, 40));
        });
      }, { threshold: 0.4 });
      document.querySelectorAll('main section[id], section[id]').forEach(function (sec) { io.observe(sec); });
    }
  } catch (e) {}
  // Tiempo en la página: 30 y 90 segundos con la pestaña visible
  try {
    [30, 90].forEach(function (seg) {
      setTimeout(function () { if (!document.hidden) window.auriEvento('tiempo_' + seg + 's'); }, seg * 1000);
    });
  } catch (e) {}
})();
