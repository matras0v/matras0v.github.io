/* ShineMate case only; existing MLang and preview remain unchanged. */
MLang.init({
  "kicker": "КЕЙС 02 · РЕАЛЬНЫЙ КЛИЕНТ · РОССИЯ",
  "intro": "Профессиональное оборудование для полировки. Сайт официального дистрибьютора в России с акцентом на продукцию.",
  "scope": "Дизайн · Фронтенд · Продуктовый UX · Каталог",
  "open-live": "Смотреть живой сайт ↗",
  "opening-note": "Витрина адаптирована под язык портфолио. Оригинальный сайт работает на русском.",
  "equipment-label": "03 / Оборудование",
  "equipment-title": "Создано<br>для работы.",
  "equipment-copy": "Машинки, питание и расходные материалы. Единый визуальный язык для всей линейки.",
  "action-label": "Эксцентриковая машинка в работе. ↗",
  "rotary": "Роторная машинка",
  "cordless": "Аккумуляторная роторная · 18 В",
  "power": "Аккумуляторная платформа",
  "pads": "Полировальные круги",
  "system-label": "04 / Подбор системы",
  "system-title": "От машинки<br>до результата.",
  "system-copy": "Логика выбора видна сразу: привод, крепление, круг и состав.",
  "step0": "01 / Машинка",
  "step-desc0": "Привод + обороты",
  "step1": "02 / Подложка",
  "step-desc1": "Резьба + диаметр",
  "step2": "03 / Круг",
  "step-desc2": "Градация + задача",
  "step3": "04 / Паста",
  "step-desc3": "Материал + стадия",
  "system-note": "Последовательность подбора из живого каталога. Размеры, градации и крепления раскрыты в карточках товаров.",
  "shopping-label": "05 / Покупательский опыт",
  "shopping-title": "Детали, которые<br>помогают выбрать.",
  "shopping-copy": "Понятная карточка: платформа, подложка, комплектация и прямой переход к запросу.",
  "shopping-note": "Адаптация настоящей карточки EB251-5 для портфолио. Реальная модель и характеристики; актуальные цены — на живом сайте.",
  "mobile-label": "06 / Мобильная версия",
  "catalog-open": "Смотреть весь каталог ↗",
  "live-original": "Оригинальный живой сайт · русский язык",
  "nav-allwork": "Все работы",
  "nav-contacts": "Контакты",
  "nav-cta-open-full": "Открыть живой сайт",
  "nav-cta-open-short": "Открыть сайт",
  "live-go": "Открыть",
  "next-h2": "Понятная подача<br>вашего ассортимента.",
  "next-p": "Расскажите о линейке и её покупателях. Продумаем каталог, визуальную подачу и запуск.",
  "cta-message-wa": "Написать в WhatsApp",
  "rail-cap": "Или выберите канал",
  "chan-telegram": "Telegram",
  "chan-instagram": "Instagram",
  "chan-email": "Почта",
  "more-link": "Смотреть остальные работы",
  "foot-note": "ShineMate Russia · живой сайт"
});
(function(){
  /* The preview is a still: size it to the frame the same way the other case
     pages size theirs, and never pan it. */
  var liveFrame = document.getElementById('liveFrame');
  var liveSite  = document.getElementById('liveSite');
  var desktop   = matchMedia('(min-width: 760px)');
  function fitLive(){
    var win = liveFrame.querySelector('.live-window');
    var sw  = desktop.matches ? 1400 : 430;
    var sh  = desktop.matches ? 820 : 740;
    liveSite.style.setProperty('--srcw', sw + 'px');
    liveSite.style.setProperty('--srch', sh + 'px');
    liveSite.style.transform = 'scale(' + (win.clientWidth / sw) + ')';
  }
  new IntersectionObserver(function(en, o){
    if(!en[0].isIntersecting) return;
    liveSite.src = liveSite.dataset.src+'?lang='+MLang.get();
    o.disconnect();
  }, {rootMargin:'400px'}).observe(liveFrame);
  fitLive();
  liveSite.addEventListener('load', function(){
    // This ordering applies only inside this case's local, same-origin preview.
    // The preview source and homepage artboards are intentionally unchanged.
    var doc=liveSite.contentDocument;
    if(doc&&!doc.getElementById('sm-case-portrait')){
      var style=doc.createElement('style');style.id='sm-case-portrait';
      style.textContent='@media(max-width:759px){.hero>img{order:-1}.hero{gap:14px}.hero>img{height:245px}}';
      doc.head.appendChild(style);
    }
    fitLive();
  });
  var t;
  addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(fitLive, 140); }, {passive:true});
})();

function smArt(){document.querySelectorAll("[data-sm-art]").forEach(function(i){i.src="media/case-product-"+MLang.get()+"-"+i.dataset.smArt+".webp";});}
MLang.onChange(smArt);smArt();
