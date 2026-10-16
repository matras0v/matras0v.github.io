/* ============================================================================
   THE LANGUAGE ENGINE
   English is the DOM's own native content — it is never stored in a
   dictionary, only read once and cached, so "switch back to EN" is always
   exact and never depends on a translator having typed the English out a
   second time. Russian lives in one small object each page defines for
   itself (window.I18N_RU) and hands to MLang.init().

   Locale priority: explicit URL parameter, stored preference, then English.
   Internal links preserve the locale; external client URLs remain untouched.
   ========================================================================== */
(function(){
  var KEY = 'matrasov_lang';

  function readStored(){
    try { return localStorage.getItem(KEY); } catch(e){ return null; }
  }
  function writeStored(v){
    try { localStorage.setItem(KEY, v); } catch(e){}
  }

  // Shared links can explicitly select either language without changing route.
  function currentLang(){
    var explicit = new URLSearchParams(location.search).get('lang');
    return explicit === 'en' || explicit === 'ru' ? explicit : (readStored() === 'ru' ? 'ru' : 'en');
  }

  var originalHTML = new WeakMap();
  var originalAttr = new WeakMap(); // el -> {attrName: originalValue}

  function applyLang(lang, dict){
    dict = dict || {};
    document.documentElement.lang = lang === 'ru' ? 'ru' : 'en';
    document.documentElement.classList.toggle('lang-ru', lang === 'ru');

    document.querySelectorAll('[data-i18n]').forEach(function(el){
      if(!originalHTML.has(el)) originalHTML.set(el, el.innerHTML);
      if(lang === 'ru'){
        var key = el.getAttribute('data-i18n');
        if(Object.prototype.hasOwnProperty.call(dict, key)){
          el.innerHTML = dict[key];
        }
      } else {
        el.innerHTML = originalHTML.get(el);
      }
    });

    // data-i18n-attr="aria-label:key;title:key2" — same original/dict
    // swap, for attributes rather than innerHTML.
    document.querySelectorAll('[data-i18n-attr]').forEach(function(el){
      if(!originalAttr.has(el)){
        var store = {};
        el.getAttribute('data-i18n-attr').split(';').forEach(function(pair){
          var attr = pair.split(':')[0].trim();
          if(attr) store[attr] = el.getAttribute(attr);
        });
        originalAttr.set(el, store);
      }
      var orig = originalAttr.get(el);
      el.getAttribute('data-i18n-attr').split(';').forEach(function(pair){
        var parts = pair.split(':');
        var attr = parts[0] && parts[0].trim();
        var key  = parts[1] && parts[1].trim();
        if(!attr || !key) return;
        if(lang === 'ru' && Object.prototype.hasOwnProperty.call(dict, key)){
          el.setAttribute(attr, dict[key]);
        } else if(orig[attr] !== undefined){
          el.setAttribute(attr, orig[attr]);
        }
      });
    });

    document.querySelectorAll('.lang-btn').forEach(function(b){
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  var activeDict = null;
  var listeners = [];
  var rootURL = new URL('../', document.currentScript.src);
  function links(lang){
    document.querySelectorAll('a[href]').forEach(function(a){
      var raw=a.getAttribute('href');
      if(!raw || raw[0]==='#') return;
      var u=new URL(raw, location.href);
      if(u.origin===rootURL.origin && u.pathname.startsWith(rootURL.pathname)){
        u.searchParams.set('lang',lang); a.href=u.href;
      }
    });
    document.querySelectorAll('iframe').forEach(function(fr){
      try{fr.contentWindow.postMessage({type:'matrasov-language',lang:lang},location.origin);}catch(e){}
    });
    document.querySelectorAll('.portfolio-exit').forEach(function(a){a.textContent=lang==='ru'?'← Портфолио':'← MATRAS0V / All work';});
    document.querySelectorAll('.burg').forEach(function(b){b.setAttribute('aria-label',lang==='ru'?'Меню':'Menu');});
    document.querySelectorAll('a.brand').forEach(function(b){b.setAttribute('aria-label',lang==='ru'?'MATRAS0V — Главная':'MATRAS0V — Home');});
    document.querySelectorAll('nav[aria-label]').forEach(function(n){n.setAttribute('aria-label',lang==='ru'?'Разделы':'Sections');});
    var skip=document.querySelector('.skip'); if(skip) skip.textContent=lang==='ru'?'Перейти к содержимому':'Skip to content';
  }
  function notify(lang){ links(lang); listeners.forEach(function(fn){fn(lang);}); }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]'); if(!a) return;
    var raw=a.getAttribute('href'); if(!raw || raw[0]==='#') return;
    var u=new URL(raw,location.href);
    if(u.origin===rootURL.origin && u.pathname.startsWith(rootURL.pathname)){u.searchParams.set('lang',currentLang());a.href=u.href;}
  },true);
  addEventListener('message',function(e){
    if(e.origin!==location.origin || e.source!==parent || !e.data || e.data.type!=='matrasov-language') return;
    if(e.data.lang==='en'||e.data.lang==='ru') window.MLang.set(e.data.lang,true);
  });
  addEventListener('popstate',function(){var lang=currentLang();applyLang(lang,activeDict);notify(lang);});

  window.MLang = {
    STORAGE_KEY: KEY,
    get: currentLang,
    /* Switches language, persists the choice, and re-applies. Safe to call
       with the same language the page is already showing. */
    set: function(lang, fromParent){
      lang = lang === 'ru' ? 'ru' : 'en';
      writeStored(lang);
      var u=new URL(location.href);u.searchParams.set('lang',lang);
      history.replaceState(null,'',u);
      applyLang(lang, activeDict);notify(lang);
    },
    /* For a page that renders some of its own content from JS (a product
       list built from a data object, a cart) rather than static markup —
       data-i18n only ever swaps text already sitting in the DOM, so
       anything a script regenerates needs to re-run itself after a
       language switch. Register that re-render here; called after every
       set(), with the new language. */
    onChange: function(fn){ if(typeof fn === 'function') listeners.push(fn); },
    /* Call once per page, after the RU dictionary is defined and the
       .lang-btn elements exist in the DOM. Applies whatever language was
       already chosen (English for a first-time visitor) and wires the
       switcher buttons found on the page. */
    init: function(dict){
      activeDict = dict || {};
      applyLang(currentLang(), activeDict);
      links(currentLang());
      document.querySelectorAll('iframe').forEach(function(fr){fr.addEventListener('load',function(){links(currentLang());});});
      document.querySelectorAll('.lang-btn').forEach(function(b){
        b.addEventListener('click', function(){
          window.MLang.set(b.getAttribute('data-lang'));
        });
      });
    }
  };
})();
