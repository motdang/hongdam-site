/* Editing on the page itself, for a page that sets window.EV_PAGE (the demo).
   Everyone with the link sees the saved words; the edit link (#k=…) can change them.
   Saved through /api/page/<page> (functions/api/page/[[path]].js). */
(function(){
  var PAGE=window.EV_PAGE; if(!PAGE) return;
  var API='/api/page/'+PAGE, KEY='ev-key-'+PAGE;
  var W={
    de:{edit:'✎ Seite bearbeiten',hint:'Tippen Sie auf einen Text und schreiben Sie. Zahlen und Daten auch.',save:'Speichern',cancel:'Abbrechen',saved:'Gespeichert',saving:'Speichere …',fail:'Speichern fehlgeschlagen. Bitte nochmals versuchen.',loadFail:'Laden fehlgeschlagen. Zum Bearbeiten die Seite neu laden.',key:'Dieser Link darf nicht bearbeiten.',reset:'Zurück zum Original',resetQ:'Alle Ihre Änderungen auf dieser Seite löschen?',demo:'Muster-Seite: Ihre Änderungen sieht jede Person mit diesem Link.',date:'Datum'},
    en:{edit:'✎ Edit this page',hint:'Tap any text and type. Numbers and dates too.',save:'Save',cancel:'Cancel',saved:'Saved',saving:'Saving …',fail:'Saving failed. Please try again.',loadFail:'Loading failed. Please reload the page to edit.',key:'This link cannot edit.',reset:'Back to the original',resetQ:'Delete all your changes on this page?',demo:'Demo page: anyone with this link sees your changes.',date:'Date'},
    th:{edit:'✎ แก้ไขหน้านี้',hint:'แตะข้อความแล้วพิมพ์ได้เลย ตัวเลขและวันที่ก็แก้ได้',save:'บันทึก',cancel:'ยกเลิก',saved:'บันทึกแล้ว',saving:'กำลังบันทึก …',fail:'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง',loadFail:'โหลดไม่สำเร็จ กรุณาโหลดหน้าใหม่เพื่อแก้ไข',key:'ลิงก์นี้แก้ไขไม่ได้',reset:'กลับไปเป็นต้นฉบับ',resetQ:'ลบการแก้ไขทั้งหมดในหน้านี้?',demo:'หน้าตัวอย่าง: ทุกคนที่มีลิงก์นี้เห็นสิ่งที่คุณแก้',date:'วันที่'}
  };
  function w(k){return (W[lang]||W.en)[k];}
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k); if(v===null)localStorage.removeItem(k); else localStorage.setItem(k,v);}catch(e){return null;}}

  /* the edit key arrives once in the link's #k=…, then lives in this browser */
  var m=location.hash.match(/[#&]k=([A-Za-z0-9_-]{16,})/);
  if(m){ ls(KEY,m[1]); history.replaceState(null,'',location.pathname+location.search); }
  var key=ls(KEY);

  var stats=function(){return document.querySelectorAll('.stat');};
  var dates=function(){return document.querySelectorAll('.date');};
  var NUMK=['num.st1','num.st2'], DATEK=['date.ev1','date.ev2'];

  function setNum(i,n){
    var b=stats()[i]; if(!b||!(n>0)) return;
    b.setAttribute('data-c',n); b.setAttribute('data-from',Math.round(n*0.65));
    b.querySelector('b').textContent=(b.getAttribute('data-p')||'')+n;
  }
  function getNum(i){var b=stats()[i]; return b?b.getAttribute('data-c'):'';}
  function setDate(i,iso){
    var d=dates()[i]; if(!d||!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
    d.setAttribute('data-cd',iso+'T00:00:00+07:00'); d.setAttribute('data-d',iso.replace(/-/g,''));
    d.querySelector('.dnum b').textContent=+iso.slice(8);
    if(i===0) DAYS_END=new Date(iso+'T00:00:00+07:00').getTime();
  }
  function getDate(i){var d=dates()[i], x=d?d.getAttribute('data-d'):''; return x?x.slice(0,4)+'-'+x.slice(4,6)+'-'+x.slice(6):'';}

  function apply(ed){
    ['en','th','de'].forEach(function(l){ var o=ed[l]||{}; Object.keys(o).forEach(function(k){ if(typeof T[l][k]==='string'&&typeof o[k]==='string') T[l][k]=o[k]; }); });
    var g=ed['*']||{};
    NUMK.forEach(function(k,i){ if(g[k]) setNum(i,+g[k]); });
    DATEK.forEach(function(k,i){ if(g[k]) setDate(i,g[k]); });
    applyLang(); counters(); tickAll();
  }
  function ready(f){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(f,0);}); else f(); }
  /* editing waits for the saved words, so a save never covers words it has not shown */
  var loaded=null;
  fetch(API,{cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
    .then(function(j){ if(!j||!j.edits) throw 0; ready(function(){ apply(j.edits); loaded=true; if(window.evReady) evReady(); }); })
    .catch(function(){ loaded=false; if(window.evReady) evReady(); });

  if(!key) return;

  /* ---------- the bar ---------- */
  var on=false, dirty={}, snapT=null, snapG=null;
  var bar=document.createElement('div'); bar.className='evbar'; bar.setAttribute('role','region');
  bar.innerHTML='<p class="evhint" hidden></p><div class="evrow"><button type="button" class="evgo"></button><button type="button" class="evsave" hidden></button><button type="button" class="evcancel" hidden></button></div><p class="evst" aria-live="polite"></p><button type="button" class="evreset" hidden></button>';
  var $b=function(c){return bar.querySelector('.'+c);};
  function words(){
    bar.setAttribute('aria-label',w('edit'));
    $b('evgo').textContent=w('edit'); $b('evsave').textContent=w('save'); $b('evcancel').textContent=w('cancel');
    $b('evreset').textContent=w('reset'); $b('evhint').textContent=w('hint')+' '+w('demo');
    document.querySelectorAll('.evdate span').forEach(function(s){s.textContent=w('date');});
  }
  function status(t){ $b('evst').textContent=t||''; }

  function editable(){
    return Array.prototype.filter.call(document.querySelectorAll('[data-i]'),function(e){
      if(e.closest('button,a,label,.lang,.evbar')||/^(BUTTON|A|LABEL|INPUT)$/.test(e.tagName)) return false;
      return typeof T[lang][e.getAttribute('data-i')]==='string';
    });
  }
  function mark(){
    editable().forEach(function(e){ e.setAttribute('contenteditable','plaintext-only'); if(e.contentEditable!=='plaintext-only') e.setAttribute('contenteditable','true'); e.classList.add('ev-ed'); e.setAttribute('spellcheck','true'); });
    [0,1].forEach(function(i){ var b=stats()[i]; if(!b) return; var n=b.querySelector('b'); n.setAttribute('contenteditable','true'); n.setAttribute('inputmode','numeric'); n.classList.add('ev-ed','ev-num'); n.dataset.ev=NUMK[i]; n.textContent=getNum(i); });
    dates().forEach(function(d,i){
      if(d.querySelector('.evdate')) return;
      var l=document.createElement('label'); l.className='evdate'; l.innerHTML='<span></span><input type="date">';
      l.querySelector('input').value=getDate(i); l.querySelector('input').dataset.ev=DATEK[i];
      l.addEventListener('click',function(e){e.stopPropagation();});
      d.querySelector('.dbody').appendChild(l);
    });
    words();
  }
  function unmark(){
    document.querySelectorAll('.ev-ed').forEach(function(e){ e.removeAttribute('contenteditable'); e.classList.remove('ev-ed','ev-num'); });
    document.querySelectorAll('.evdate').forEach(function(e){ e.remove(); });
  }
  function put(scope,k,v){ (dirty[scope]=dirty[scope]||{})[k]=v; }

  document.addEventListener('input',function(e){
    if(!on) return; var x=e.target;
    if(x.dataset&&x.dataset.ev&&x.classList.contains('ev-num')){ var n=x.textContent.replace(/\D/g,''); if(n) put('*',x.dataset.ev,n); return; }
    if(x.dataset&&x.dataset.ev&&x.type==='date'){ if(x.value){ put('*',x.dataset.ev,x.value); setDate(DATEK.indexOf(x.dataset.ev),x.value); applyLang(); mark(); } return; }
    var k=x.getAttribute&&x.getAttribute('data-i'); if(!k) return;
    var v=x.textContent.replace(/\s+/g,' ').trim(); T[lang][k]=v; put(lang,k,v);
  },true);
  /* while editing, a tap on text is for typing, not for the page's own buttons */
  document.addEventListener('click',function(e){ if(on&&e.target.closest&&e.target.closest('.ev-ed')){ e.stopPropagation(); e.preventDefault(); } },true);
  document.addEventListener('keydown',function(e){ if(on&&e.key==='Enter'&&e.target.closest&&e.target.closest('.ev-ed')){ e.preventDefault(); e.target.blur(); } },true);
  /* a language switch while editing keeps the typing and re-marks the new words */
  ['b-th','b-en','b-de'].forEach(function(id){ var b=document.getElementById(id); if(b) b.addEventListener('click',function(){ if(on) setTimeout(function(){mark(); words();},0); else words(); }); });

  function start(){
    on=true; dirty={}; snapT={}; ['en','th','de'].forEach(function(l){ snapT[l]={}; Object.keys(T[l]).forEach(function(k){ if(typeof T[l][k]==='string') snapT[l][k]=T[l][k]; }); });
    snapG={n:[getNum(0),getNum(1)],d:[getDate(0),getDate(1)]};
    document.documentElement.classList.add('ev-on'); bar.classList.add('on'); mark();
    $b('evgo').hidden=true; $b('evsave').hidden=false; $b('evcancel').hidden=false; $b('evhint').hidden=false; $b('evreset').hidden=false; status('');
  }
  function stop(){
    on=false; unmark(); document.documentElement.classList.remove('ev-on'); bar.classList.remove('on');
    $b('evgo').hidden=false; $b('evsave').hidden=true; $b('evcancel').hidden=true; $b('evhint').hidden=true; $b('evreset').hidden=true;
    applyLang(); counters();
  }
  function send(body){
    return fetch(API,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+key},body:JSON.stringify(body)})
      .then(function(r){ if(r.status===401||r.status===403){ status(w('key')); throw 0; } if(!r.ok){ status(w('fail')); throw 0; } return r.json(); })
      .catch(function(e){ if(e!==0) status(w('fail')); throw 0; });
  }
  $b('evgo').addEventListener('click',start);
  window.evReady=function(){ $b('evgo').disabled=!loaded; status(loaded===false?w('loadFail'):''); };
  $b('evcancel').addEventListener('click',function(){
    ['en','th','de'].forEach(function(l){ Object.keys(snapT[l]).forEach(function(k){ T[l][k]=snapT[l][k]; }); });
    [0,1].forEach(function(i){ setNum(i,+snapG.n[i]); setDate(i,snapG.d[i]); });
    stop(); status('');
  });
  $b('evsave').addEventListener('click',function(){
    if(document.activeElement&&document.activeElement.blur) document.activeElement.blur();
    [0,1].forEach(function(i){ var g=dirty['*']||{}; if(g[NUMK[i]]) setNum(i,+g[NUMK[i]]); });
    if(!Object.keys(dirty).length){ stop(); return; }
    status(w('saving'));
    send({edits:dirty}).then(function(j){ var t=new Date(); stop(); if(j&&j.edits) apply(j.edits); status(w('saved')+' ✓ '+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0')); }).catch(function(){});
  });
  $b('evreset').addEventListener('click',function(){
    if(!confirm(w('resetQ'))) return;
    status(w('saving'));
    send({reset:true}).then(function(){ location.reload(); }).catch(function(){});
  });
  var css=document.createElement('style');
  css.textContent=
    '.evbar{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#ffd23f;color:#000;padding:12px 16px calc(12px + env(safe-area-inset-bottom));box-shadow:0 -4px 18px rgba(0,0,0,.3);font:600 20px/1.35 var(--body)}'+
    '.evbar p{margin:0 0 10px;font-size:20px!important}.evbar .evst{margin:8px 0 0;min-height:0}.evbar .evst:empty{display:none}'+
    '.evrow{display:flex;gap:10px;flex-wrap:wrap}'+
    '.evbar button{min-height:60px;padding:0 22px;border-radius:14px;border:3px solid #000;font:800 21px/1 var(--body)!important;cursor:pointer}'+
    '.evgo,.evsave{background:#000;color:#ffd23f;flex:1}.evcancel{background:#fff;color:#000}.evbar button:disabled{opacity:.45;cursor:default}'+
    '.evbar .evreset{min-height:48px;margin-top:10px;background:transparent;border:0;text-decoration:underline;font-weight:600!important;padding:0}'+
    '.evbar:not(.on){left:auto;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));padding:0;background:none;box-shadow:none}'+
    '.evbar:not(.on) .evst{background:#ffd23f;padding:6px 12px;border-radius:10px;margin-top:8px;text-align:center}'+
    '.evbar:not(.on) .evgo{box-shadow:0 4px 18px rgba(0,0,0,.35);border-color:#ffd23f}'+
    'html.ev-on body{padding-bottom:260px}'+
    '.ev-ed{outline:3px dashed #ffb000;outline-offset:3px;border-radius:4px;cursor:text;-webkit-user-select:text;user-select:text}'+
    '.ev-ed:focus{outline:4px solid #ffb000;background:rgba(255,210,63,.18)}'+
    '.evdate{display:flex;flex-direction:column;gap:4px;margin-top:12px;font:700 18px/1.2 var(--body)}'+
    '.evdate input{min-height:56px;font:700 22px/1 var(--body);padding:6px 10px;border:3px solid #ffb000;border-radius:10px;background:var(--bg);color:var(--ink)}';
  document.head.appendChild(css);
  ready(function(){ document.body.appendChild(bar); words(); evReady(); });
})();
