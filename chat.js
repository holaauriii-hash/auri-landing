/* Chat de la web: respuestas rápidas + mensaje directo a Patricia (llega a su Telegram). */
(function(){
  var API = 'https://eqgkelepbznnemweczhc.supabase.co/functions/v1/chat-web';
  var WA = 'https://wa.me/595981887409?text=' + encodeURIComponent('Hola Patricia, quisiera agendar una primera consulta.');
  var KEY = 'auri_chat_token', KEYID = 'auri_chat_desde';
  var nombre = '', correo = '', token = '', desde = 0, timer = null, abierto = false, modoHumano = false;
  function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k) || ''; if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){ return ''; } }
  token = ls(KEY); nombre = ls('auri_chat_nombre'); correo = ls('auri_chat_correo'); desde = parseInt(ls(KEYID), 10) || 0;

  var RESP = [
    { p: '¿Cuánto cuesta una sesión?', r: 'El valor es de Gs 200.000 por sesión (US$ 35 si nos escribís desde otro país). También hay una tarifa social de Gs 100.000 por sesión; podés postularte desde la sección correspondiente de esta página.' },
    { p: '¿Cómo agendo una primera consulta?', r: 'La atención es solo con cita previa. Lo más simple es escribirme por WhatsApp y coordinamos el día y el horario.', wa: true },
    { p: '¿Es presencial u online?', r: 'Atiendo de las dos maneras: presencial en Minga Guazú y online. Lo vemos juntas según lo que te quede más cómodo.' },
    { p: 'Tengo otra consulta', humano: true }
  ];

  var css = '#ac-btn{position:fixed;right:max(1rem,env(safe-area-inset-right,0px));bottom:max(1rem,env(safe-area-inset-bottom,0px));z-index:45;display:flex;align-items:center;gap:.5rem;padding:.8rem 1.1rem;border:0;border-radius:999px;background:#3F5440;color:#F2EFE4;font:500 .95rem Jost,system-ui,sans-serif;cursor:pointer;box-shadow:0 12px 28px -12px rgba(31,46,34,.6)}' +
  '#ac-btn svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}' +
  '#ac-panel{position:fixed;right:max(1rem,env(safe-area-inset-right,0px));bottom:max(1rem,env(safe-area-inset-bottom,0px));z-index:46;width:min(380px,calc(100vw - 2rem));height:min(560px,calc(100dvh - 2rem));display:none;flex-direction:column;background:#FFFDF8;border:1px solid rgba(31,46,34,.16);border-radius:18px;box-shadow:0 24px 60px -20px rgba(31,46,34,.5);overflow:hidden;font:400 .95rem/1.5 Jost,system-ui,sans-serif;color:#1F2E22}' +
  '#ac-panel.abierto{display:flex}' +
  '#ac-cab{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1rem;background:#3F5440;color:#F2EFE4}' +
  '#ac-cab b{font-weight:500}#ac-cab small{display:block;opacity:.8;font-size:.78rem}' +
  '#ac-x{background:none;border:0;color:inherit;font-size:1.5rem;line-height:1;cursor:pointer;padding:.2rem .5rem}' +
  '#ac-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.55rem;background:#F2EFE4}' +
  '.ac-m{max-width:86%;padding:.55rem .8rem;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}' +
  '.ac-m.yo{align-self:flex-end;background:#3F5440;color:#F2EFE4;border-bottom-right-radius:4px}' +
  '.ac-m.ella{align-self:flex-start;background:#fff;border:1px solid rgba(31,46,34,.12);border-bottom-left-radius:4px}' +
  '.ac-m.sis{align-self:center;background:#F6E7D2;color:#5a3d10;font-size:.85rem;text-align:center;max-width:94%}' +
  '.ac-q{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.2rem}' +
  '.ac-q button,.ac-wa{border:1px solid #3F5440;background:#fff;color:#3F5440;border-radius:999px;padding:.4rem .8rem;font:500 .85rem Jost,system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-block}' +
  '.ac-q button:hover,.ac-wa:hover{background:#3F5440;color:#F2EFE4}' +
  '#ac-aviso{font-size:.74rem;color:#46563F;padding:.4rem 1rem;background:#FFFDF8;border-top:1px solid rgba(31,46,34,.1)}' +
  '#ac-form{display:flex;gap:.5rem;padding:.6rem;border-top:1px solid rgba(31,46,34,.12);background:#FFFDF8}' +
  '#ac-txt{flex:1;resize:none;border:1px solid rgba(31,46,34,.25);border-radius:12px;padding:.5rem .7rem;font:400 16px Jost,system-ui,sans-serif;max-height:90px;background:#fff;color:#1F2E22}' +
  '#ac-env{border:0;border-radius:12px;background:#3F5440;color:#F2EFE4;padding:0 1rem;font:500 .9rem Jost,system-ui,sans-serif;cursor:pointer}#ac-env:disabled{opacity:.5}' +
  '#ac-reg{display:flex;flex-direction:column;gap:.5rem;background:#fff;border:1px solid rgba(31,46,34,.12);border-radius:14px;padding:.8rem}#ac-reg input{border:1px solid rgba(31,46,34,.25);border-radius:10px;padding:.55rem .7rem;font:400 16px Jost,system-ui,sans-serif;background:#fff;color:#1F2E22}#ac-reg button{border:0;border-radius:10px;background:#3F5440;color:#F2EFE4;padding:.6rem;font:500 .95rem Jost,system-ui,sans-serif;cursor:pointer}#ac-reg small{font-size:.75rem;color:#46563F}#ac-err{color:#9b2c1d;font-size:.8rem;min-height:1em}' +
  '#ac-hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}' +
  '@media(max-width:700px){#ac-btn{bottom:calc(max(1rem,env(safe-area-inset-bottom,0px)) + 4rem)}#ac-panel{bottom:max(.5rem,env(safe-area-inset-bottom,0px));right:.5rem;width:calc(100vw - 1rem);height:calc(100dvh - 1rem)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var raiz = document.createElement('div');
  raiz.innerHTML =
    '<button id="ac-btn" type="button" aria-label="Abrir chat"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Escribime</button>' +
    '<section id="ac-panel" role="dialog" aria-label="Chat con Patricia Chena"><div id="ac-cab"><div><b>Patricia Chena</b><small>Psicóloga · te respondo dentro de 24 h hábiles</small></div><button id="ac-x" type="button" aria-label="Cerrar">×</button></div>' +
    '<div id="ac-msgs" aria-live="polite"></div>' +
    '<div id="ac-aviso">Por favor no compartas datos clínicos ni sensibles por acá. Si es una urgencia, llamá al 911 o a la línea 155 de Salud Mental.</div>' +
    '<form id="ac-form" hidden><input id="ac-hp" tabindex="-1" autocomplete="off" aria-hidden="true"><textarea id="ac-txt" rows="1" maxlength="1000" placeholder="Escribí tu mensaje…"></textarea><button id="ac-env" type="submit">Enviar</button></form></section>';
  document.body.appendChild(raiz);

  var $ = function(id){ return document.getElementById(id); };
  var msgs = $('ac-msgs'), form = $('ac-form'), txt = $('ac-txt'), env = $('ac-env');

  function burbuja(clase, texto){ var d = document.createElement('div'); d.className = 'ac-m ' + clase; d.textContent = texto; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; }
  function preguntas(){
    var q = document.createElement('div'); q.className = 'ac-q';
    RESP.forEach(function(x){
      var b = document.createElement('button'); b.type = 'button'; b.textContent = x.p;
      b.onclick = function(){
        q.remove(); burbuja('yo', x.p);
        if(x.humano){ activarHumano(); return; }
        burbuja('ella', x.r);
        if(x.wa){ var a = document.createElement('a'); a.className = 'ac-wa'; a.href = WA; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Escribir por WhatsApp'; var w = document.createElement('div'); w.className = 'ac-q'; w.appendChild(a); msgs.appendChild(w); }
        preguntas();
      };
      q.appendChild(b);
    });
    msgs.appendChild(q); msgs.scrollTop = msgs.scrollHeight;
  }
  function activarHumano(){
    modoHumano = true; form.hidden = false;
    burbuja('ella', 'Dejame tu mensaje y te respondo por acá dentro de las próximas 24 h hábiles. Si querés que te contacte por otro medio, indicámelo en el mensaje.');
    txt.focus();
  }
  function registro(){
    var f = document.createElement('form'); f.id = 'ac-reg'; f.noValidate = true;
    f.innerHTML = '<input id="ac-nom" type="text" placeholder="Tu nombre" autocomplete="name" maxlength="80" required><input id="ac-cor" type="email" placeholder="Tu correo electrónico" autocomplete="email" maxlength="120" required><div id="ac-err" role="alert"></div><button type="submit">Comenzar</button><small>Uso tu nombre y correo solo para responderte. Se borran a los 30 días.</small>';
    f.onsubmit = function(e){
      e.preventDefault();
      var n = f.querySelector('#ac-nom').value.replace(/\s+/g, ' ').trim(), c = f.querySelector('#ac-cor').value.trim();
      if(n.length < 2){ f.querySelector('#ac-err').textContent = 'Escribí tu nombre.'; return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)){ f.querySelector('#ac-err').textContent = 'Revisá tu correo electrónico.'; return; }
      nombre = n; correo = c; ls('auri_chat_nombre', n); ls('auri_chat_correo', c);
      f.remove(); burbuja('yo', n); burbuja('ella', 'Gracias, ' + n.split(' ')[0] + '. ¿En qué te puedo ayudar?'); preguntas();
    };
    msgs.appendChild(f); msgs.scrollTop = msgs.scrollHeight;
  }
  function inicio(){
    msgs.innerHTML = '';
    if(token){ modoHumano = true; form.hidden = false; burbuja('ella', 'Hola de nuevo. Podés seguir escribiendo por acá.'); cargar(); return; }
    if(nombre && correo){ burbuja('ella', 'Hola, ' + nombre.split(' ')[0] + '. ¿En qué te puedo ayudar? Elegí una opción o escribime directamente.'); preguntas(); return; }
    burbuja('ella', 'Hola, soy Patricia 🌿 Para empezar, contame tu nombre y tu correo así puedo responderte.');
    registro();
  }
  function post(cuerpo){
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) }).then(function(r){ return r.json(); });
  }
  function pintar(lista){
    lista.forEach(function(m){
      if(m.id <= desde) return;
      desde = m.id; ls(KEYID, String(desde));
      if(m.de === 'patricia') burbuja('ella', m.texto);
      else if(m.de === 'sistema') burbuja('sis', m.texto);
      else if(m.de === 'visitante' && !msgs.querySelector('[data-id="' + m.id + '"]')) { var d = burbuja('yo', m.texto); d.setAttribute('data-id', m.id); }
    });
  }
  function cargar(){
    if(!token) return;
    post({ accion: 'leer', token: token, desde: 0 }).then(function(d){
      if(d.vencida){ ls(KEY, null); ls(KEYID, null); token = ''; desde = 0; inicio(); return; }
      pintar(d.mensajes || []);
    }).catch(function(){});
  }
  function sondear(){
    if(!abierto || !token) return;
    post({ accion: 'leer', token: token, desde: desde }).then(function(d){ pintar((d.mensajes || []).filter(function(m){ return m.de !== 'visitante'; })); }).catch(function(){});
  }
  function enviar(e){
    e.preventDefault();
    var t = txt.value.trim(); if(!t) return;
    env.disabled = true;
    post({ accion: 'enviar', token: token, nombre: nombre, correo: correo, texto: t, hp: $('ac-hp').value }).then(function(d){
      env.disabled = false;
      if(d.ok){
        if(!token){ token = d.token; ls(KEY, token); }
        var b = burbuja('yo', t); if(d.id) { b.setAttribute('data-id', d.id); if(d.id > desde){ desde = d.id; ls(KEYID, String(desde)); } }
        txt.value = ''; txt.style.height = 'auto';
        if(!d.avisado && d.avisado !== undefined) burbuja('sis', 'Tu mensaje quedó guardado. Si es algo urgente, escribime por WhatsApp.');
        if(!sondeo) sondeo = setInterval(sondear, 8000);
      } else if(d.error === 'datos'){
        ls('auri_chat_nombre', null); ls('auri_chat_correo', null); nombre = ''; correo = ''; form.hidden = true; inicio();
      } else if(d.error === 'limite'){
        burbuja('sis', 'Se alcanzó el límite de mensajes por ahora. Podés escribirme por WhatsApp.');
      } else { burbuja('sis', 'No se pudo enviar. Probá de nuevo o escribime por WhatsApp.'); }
    }).catch(function(){ env.disabled = false; burbuja('sis', 'No se pudo enviar. Revisá tu conexión o escribime por WhatsApp.'); });
  }
  var sondeo = null;
  txt.addEventListener('input', function(){ txt.style.height = 'auto'; txt.style.height = Math.min(txt.scrollHeight, 90) + 'px'; });
  form.addEventListener('submit', enviar);

  function abrir(){
    abierto = true; $('ac-panel').classList.add('abierto'); $('ac-btn').style.display = 'none';
    if(!msgs.childNodes.length) inicio();
    if(token && !sondeo) sondeo = setInterval(sondear, 8000);
    if(window.auriEvento) try{ window.auriEvento('chat_abierto'); }catch(e){}
  }
  function cerrar(){ abierto = false; $('ac-panel').classList.remove('abierto'); $('ac-btn').style.display = ''; if(sondeo){ clearInterval(sondeo); sondeo = null; } }
  $('ac-btn').onclick = abrir; $('ac-x').onclick = cerrar;
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && abierto) cerrar(); });
})();
