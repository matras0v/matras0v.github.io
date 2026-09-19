/* ============================================================================
   THE LANGUAGE ENGINE
   English is the DOM's own native content — it is never stored in a
   dictionary, only read once and cached, so "switch back to EN" is always
   exact and never depends on a translator having typed the English out a
   second time. Russian lives in one small object each page defines for
   itself (window.I18N_RU) and hands to MLang.init().

   The choice a visitor makes is remembered (localStorage) and carried
   across every page on the site, but the page never opens in Russian on
   its own — only an explicit click ever sets the stored language, so a
   fresh visitor from a shared link always sees English first.
   ========================================================================== */
(function(){
  var KEY = 'matrasov_lang';

  function readStored(){
    try { return localStorage.getItem(KEY); } catch(e){ return null; }
  }
  function writeStored(v){
    try { localStorage.setItem(KEY, v); } catch(e){}
  }

  // Only 'ru' is ever explicitly stored; anything else (including no
  // stored value at all, a fresh visitor) means English.
  function currentLang(){
    return readStored() === 'ru' ? 'ru' : 'en';
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

  window.MLang = {
    STORAGE_KEY: KEY,
    get: currentLang,
    /* Switches language, persists the choice, and re-applies. Safe to call
       with the same language the page is already showing. */
    set: function(lang){
      lang = lang === 'ru' ? 'ru' : 'en';
      writeStored(lang);
      applyLang(lang, activeDict);
      listeners.forEach(function(fn){ try{ fn(lang); }catch(e){} });
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
      document.querySelectorAll('.lang-btn').forEach(function(b){
        b.addEventListener('click', function(){
          window.MLang.set(b.getAttribute('data-lang'));
        });
      });
    }
  };
})();
