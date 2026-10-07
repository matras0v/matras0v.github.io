/* Visual storefront. Existing SKU indexes, cart and variant groups stay intact. */
const SF = (() => {
  // Verified exact article on koch.ru; do not change SKU, price or stock.
  P.forEach(p => {if (p[F.ART] === '77704750') p[F.IMG] = 'editorial/koch-77704750.png';});
  P.forEach(p => {if (p[F.ART] === '405001' && BR[p[F.B]] === 'Koch Chemie') p[F.IMG] = 'editorial/koch-fine-405001.webp';});
  P.forEach(p => {if (p[F.N].startsWith('TOP STAR') && p[F.VOL] === '1 л') p[F.IMG] = 'editorial/koch-topstar-1l.png';});
  const all = () => P.map((_, i) => i);
  const byBrand = name => all().filter(i => BR[P[i][F.B]] === name);
  const select = (cat, n = 4) => dedupeVariants(all().filter(i => P[i][F.CAT] === cat).sort((a,b) => P[b][F.ST] - P[a][F.ST])).slice(0, n);
  const image = (i, eager = false) => `<img src="img/${esc(P[i][F.IMG])}" alt="${esc(P[i][F.N])}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="600" height="600">`;
  const extras = [
    ['Glitz', 'Автохимия и уход за автомобилем'],
    ['Dry Monster', 'Товары для детейлинга'],
    ['ShineMate', 'Полировальные машины и оснастка'],
    ['Little Joe', 'Ароматы для салона'],
    ['Ultra', 'Ассортимент по запросу'],
    ['Space Cosmetics', 'Автокосметика и уход']
  ];
  const brands = [...BR.map(name => ({name, ids: byBrand(name)})), ...extras.filter(([name]) => !BR.includes(name)).map(([name, note]) => ({name, note, ids: []}))];
  const href = name => '#/brand/' + encodeURIComponent(name);
  const query = name => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Здравствуйте! Пришлите ассортимент и цены ' + name)}`;
  const sectionHead = (title, url = '#/catalog', label = 'Смотреть всё') => `<div class="sf-heading"><h2>${title}</h2><a href="${url}">${label} <span aria-hidden="true">↗</span></a></div>`;
  const brandArt = b => {
    if(b.name==='ShineMate')return '<img src="img/editorial/shinemate.webp" alt="Оборудование ShineMate" loading="lazy" width="800" height="600">';
    if(b.ids.length){
      const ids=dedupeVariants(b.ids).slice(0,3);
      return `<div class="sf-brand-family">${BRAND_LOGO[b.name]?`<img class="sf-brand-logo" src="img/${BRAND_LOGO[b.name]}" alt="${esc(b.name)}" loading="lazy">`:''}<div class="sf-brand-products">${ids.map(i=>image(i)).join('')}</div></div>`;
    }
    return ['Little Joe','Space Cosmetics'].includes(b.name) ? `<img src="img/editorial/${b.name === 'Little Joe' ? 'little-joe.webp' : 'space.png'}" alt="${esc(b.name)}" loading="lazy" width="600" height="600">` : `<span class="sf-brand-type">${esc(b.name)}</span>`;
  };
  const specialties = {'Koch Chemie':'Химия для кузова и салона','Zvizzer':'Пасты и полировальные круги','AuTech':'Оборудование и расходники','Cyclone':'Инструмент для химчистки','Marolex':'Помповые опрыскиватели','ColourLock':'Уход за кожей','Finisher':'Мойка и финишная обработка','PACA':'Смазки и очистители','Joybond':'Глина для подготовки кузова','Gyeon':'Покрытия и уход','Hendlex':'Защитные покрытия','ShineMate':'Машинки и оснастка'};
  const brandCard = b => `<a class="sf-brand-card" href="${href(b.name)}"><div class="sf-brand-art">${brandArt(b)}</div><div class="sf-brand-caption"><h3>${esc(b.name)}</h3><p class="brand-specialty">${esc(specialties[b.name] || b.note || "")}</p><span>${b.ids.length ? b.ids.length + ' позиций' : 'Запросить ассортимент'} <b aria-hidden="true">↗</b></span></div></a>`;
  const categoryImages = {polish: 0, wash:503, interior:222, wheels:258, equipment:P.findIndex(p => BR[p[F.B]] === 'ShineMate' && p[F.N].startsWith('EP820')), supplies:339, marine:P.findIndex(p => p[F.CAT] === 'marine')};
  const categoryLabels = {polish:'Полировальные материалы',wash:'Мойка и уход за кузовом',interior:'Автокосметика для салона',equipment:'Оборудование для детейлинга'};
  const category = (c, k) => `<a class="category-tile category-tile-${k}" href="#/catalog/${c.id}"><div class="category-content"><h3>${esc(categoryLabels[c.id] || c.name)}</h3><p>${esc(c.note)}</p><span>${P.filter(p => p[F.CAT] === c.id).length} позиций <b aria-hidden="true">↗</b></span></div><div class="category-media">${image(categoryImages[c.id] ?? select(c.id, 1)[0])}</div></a>`;
  // Marketing images are tied to real catalog records, including brand identity.
  const sceneProduct = (id, brand, eager=false) => {
    if (!P[id] || BR[P[id][F.B]] !== brand) throw new Error('Marketing brand mismatch: '+brand+' / '+id);
    return `<span class="hero-product-layer">${image(id,eager).replace('<img ',`<img data-product-id="${id}" data-brand="${esc(brand)}" `)}</span>`;
  };
  const ep820 = P.findIndex(p=>BR[p[F.B]]==='ShineMate' && p[F.N].startsWith('EP820'));
  const storeGroup = (id, brand) => `<figure class="hero-store-group">${sceneProduct(id,brand,true)}<figcaption>${esc(brand)}</figcaption></figure>`;
  const scenes = [
    {title:'Автохимия и оборудование<br>для детейлинга', text:'В ассортименте магазина — Koch Chemie, ShineMate, Gyeon и другие бренды. Выберите товары для вашей мойки или студии.', link:'#/catalog', cta:'Открыть каталог', alt:'Ассортимент магазина: разные бренды', style:'all', media:storeGroup(1,'Koch Chemie')+storeGroup(ep820,'ShineMate')+storeGroup(503,'Gyeon')},
    {title:'Пасты для полировки<br>Koch Chemie', text:'Heavy Cut, Fine Cut и Micro Cut. Выберите пасту по задаче и нужному объёму.', link:'#/catalog/polish?brand=Koch%20Chemie', cta:'Смотреть пасты Koch', alt:'Полировальные пасты Koch Chemie', style:'koch', media:[17,1,20].map(i=>sceneProduct(i,'Koch Chemie')).join('')},
    {title:'Полировальные машинки<br>ShineMate', text:'Роторные, эксцентриковые и аккумуляторные модели. Характеристики и комплектация — в карточках товаров.', link:href('ShineMate'), cta:'Смотреть ShineMate', alt:'Оборудование ShineMate', style:'machines', media:sceneProduct(ep820,'ShineMate')+sceneProduct(P.findIndex(p=>BR[p[F.B]]==='ShineMate' && p[F.N].startsWith('EB213')),'ShineMate')},
    {title:'Круги для полировки<br>ZviZZer', text:'Поролоновые и меховые круги. Выбирайте по размеру, материалу и жёсткости.', link:href('Zvizzer'), cta:'Смотреть круги ZviZZer', alt:'Полировальные круги ZviZZer', style:'zvizzer', media:[55,57,60].map(i=>sceneProduct(i,'Zvizzer')).join('')},
    {title:'Мойка и подготовка кузова<br>с Gyeon', text:'Bathe, Foam и Prep: шампунь, пена для предварительной мойки и обезжириватель. Цены и наличие уточнит менеджер.', link:'#/catalog/wash?brand=Gyeon', cta:'Смотреть средства Gyeon', alt:'Мойка и подготовка кузова Gyeon', style:'wash', media:[503,504,505].map(i=>sceneProduct(i,'Gyeon')).join('')}
  ];
  let slide = 0, timer, observer, paused = false;
  function go(n) {
    const slides = [...document.querySelectorAll('.hero-slide')];
    if (!slides.length) return;
    slide = (n + slides.length) % slides.length;
    slides.forEach((el, i) => { el.classList.toggle('active', i === slide); el.inert = i !== slide; el.setAttribute('aria-hidden', String(i !== slide)); });
    document.querySelectorAll('[data-sf-slide]').forEach((el, i) => {el.classList.toggle('active', i === slide); el.setAttribute('aria-pressed', String(i === slide));});
  }
  view.home = () => `<div class="sf-home">
    <section class="sf-hero hex-bg" aria-label="Подбор товаров">
      <div class="wrap hero-layout-shell">
        ${scenes.map((s, i) => `<div class="hero-slide ${i === 0 ? 'active' : ''}" ${i ? 'inert aria-hidden="true"' : ''}><div class="hero-copy-zone"><p class="sf-kicker">Правильные технологии / Детейлинг</p><h1 class="hero-title">${s.title}</h1><p class="sf-lede">${s.text}</p><div class="sf-actions"><a class="btn sf-primary" href="${s.link}">${s.cta} ↗</a><a class="sf-text-link" href="#/wholesale">Оптовым клиентам ↗</a></div></div><div class="hero-media-zone hero-media-${s.style}" data-depth>${s.media}</div></div>`).join('')}
        <div class="sf-hero-bottom"><div class="sf-hero-stats"><span><b>${P.length}</b> позиций в каталоге</span><span>Подбор для моек и студий</span></div><div class="sf-controls"><button data-sf-prev aria-label="Предыдущий слайд">←</button>${scenes.map((s,i) => `<button class="sf-dot ${i ? '' : 'active'}" data-sf-slide="${i}" aria-label="${s.alt}" aria-pressed="${i === 0}"></button>`).join('')}<button data-sf-next aria-label="Следующий слайд">→</button><button data-sf-pause aria-label="Остановить автопрокрутку">Ⅱ</button></div></div>
      </div>
    </section>
    <section class="sf-section sf-categories"><div class="wrap">${sectionHead('Категории товаров')}<div class="sf-category-grid">${CATS.map(category).join('')}</div></div></section>
    <section class="sf-section"><div class="wrap">${sectionHead('Товары для ежедневной работы')}<p class="sf-intro">Полировка, мойка и уход за автомобилем.</p>${gridHTML(dedupeVariants(CATS.flatMap(c => select(c.id, 1))).slice(0, 4))}</div></section>
    <section class="sf-section sf-brand-section"><div class="wrap">${sectionHead('Бренды', '#/brands', 'Все бренды')}<div class="sf-brand-rail">${brands.map(brandCard).join('')}</div></div></section>
    <section class="sf-section sf-story"><div class="wrap sf-story-grid"><div class="sf-story-art" data-depth><img src="img/editorial/shinemate-pads.webp" alt="Круги для полировки ShineMate" width="1000" height="800" loading="lazy"></div><div><p class="sf-kicker">ShineMate</p><h2>Круги и оснастка ShineMate</h2><p class="sf-intro">Меховые, поролоновые и микрофибровые круги. Размеры, крепление и назначение указаны в карточках товаров.</p><div class="sf-process"><a href="#/catalog/equipment?brand=ShineMate"><b>Полировальные машинки</b><span>Смотреть модели ↗</span></a><a href="#/catalog/polish?brand=ShineMate"><b>Круги и пасты ShineMate</b><span>Смотреть материалы ↗</span></a><a href="${href('ShineMate')}"><b>Каталог ShineMate</b><span>Все товары бренда ↗</span></a></div></div></div></section>
    <section class="sf-section"><div class="wrap">${sectionHead('Уход за салоном', '#/catalog/interior')}${gridHTML(select('interior', 4))}</div></section>
    <section class="sf-section sf-aroma"><div class="wrap"><div class="sf-aroma-copy"><h2>Ароматизаторы<br>Little Joe</h2><p>Ароматы для салона автомобиля. Доступные варианты и цены уточнит менеджер.</p><a class="btn ghost" href="${href('Little Joe')}">Запросить ассортимент ↗</a></div><div class="sf-aroma-art"><img src="img/editorial/little-joe.webp" alt="Ароматизатор Little Joe" width="628" height="704" loading="lazy"></div></div></section>
    <section class="sf-section sf-trust"><div class="wrap sf-trust-grid"><h2>Магазин в Ростове-на-Дону</h2><div><p>Отзывы покупателей о магазине, подборе составов и работе команды собраны на Яндекс Картах.</p><a class="btn ghost" href="${YANDEX_REVIEWS_URL}" target="_blank" rel="noopener">Читать отзывы на Яндексе ↗</a><p class="sf-small">Ростов-на-Дону, ул. Ерёменко, 45</p></div></div></section>
    <section class="sf-section"><div class="wrap"><div class="sf-b2b hex-bg"><div><p class="sf-kicker">Для профессионалов</p><h2>Поставки для моек и детейлинг-студий</h2><p>Обсудим ассортимент, объёмы закупок и условия поставки для вашей студии, мойки или магазина.</p></div><a class="btn sf-primary" href="#/wholesale">Получить условия ↗</a></div></div></section>
  </div>`;
  view.brands = () => `<section class="sf-section"><div class="wrap"><p class="crumbs"><a href="#/">Главная</a> / Бренды</p><h1 class="sf-page-title">Бренды в нашем магазине</h1><p class="sf-intro">Автохимия, оборудование, расходники и ароматы. Выберите бренд, чтобы посмотреть товары или запросить ассортимент.</p><div class="sf-brand-grid">${brands.map(brandCard).join('')}</div></div></section>`;
  // No verified campaign dates or discount conditions supplied by the business.
  view.promo = () => `<section class="screen on"><div class="wrap"><p class="crumbs"><a href="#/">Главная</a> / Акции</p><div class="head"><h1 class="sf-page-title">Предложения для вашего бизнеса</h1></div><p class="sf-intro">Действующие скидки и специальные цены уточняйте у менеджера перед заказом.</p><div class="promo-band"><div><h2>Оптовые условия</h2><p>Расскажите, что и в каких объёмах закупаете. Менеджер подготовит предложение для вашей мойки, студии или магазина.</p></div><a class="btn" href="#/wholesale">Получить условия</a></div><div class="promo-grid" style="margin-top:28px"><a class="promo-card" href="#/catalog/wash"><h3>Мойка и уход</h3><p>Шампуни, составы для предварительной мойки и уход за кузовом.</p><span class="more">Смотреть товары ↗</span></a><a class="promo-card" href="#/catalog/polish"><h3>Полировальные материалы</h3><p>Пасты, круги и оснастка. Выбор по бренду, объёму и размеру.</p><span class="more">Смотреть товары ↗</span></a><a class="promo-card" href="#/contacts"><h3>Нужна помощь с выбором?</h3><p>Уточните совместимость материалов и наличие перед оформлением заявки.</p><span class="more">Связаться с магазином ↗</span></a></div></div></section>`;
  const originalCatalog = view.catalog;
  view.catalog = () => originalCatalog().replace('>Популярные</button>', '>Подборка</button>');
  const originalRender = render;
  render = function() {
    clearInterval(timer); observer?.disconnect();
    const match = location.hash.match(/^#\/brand\/(.*)$/);
    if (match) {
      let name; try {name = decodeURIComponent(match[1]);} catch {name = '';}
      const b = brands.find(b => b.name === name);
      if (b) {
        document.body.classList.remove('is-home');
        document.querySelector('#main').innerHTML = `<section class="sf-section"><div class="wrap"><p class="crumbs"><a href="#/brands">Бренды</a> / ${esc(b.name)}</p><div class="sf-brand-hero"><div><p class="sf-kicker">Бренд в Правильных технологиях</p><h1 class="sf-page-title">${esc(b.name)}</h1><p class="sf-intro">${b.ids.length ? `${b.ids.length} позиций. Выберите товар и нужный объём или размер.` : esc(b.note) + '. Запросите доступные позиции и условия у менеджера.'}</p><a class="btn sf-primary" href="${b.ids.length ? '#/catalog?brand=' + encodeURIComponent(b.name) : query(b.name)}" ${b.ids.length ? '' : 'target="_blank" rel="noopener"'}>${b.ids.length ? 'В каталог бренда' : 'Запросить ассортимент'} ↗</a></div><div class="sf-brand-hero-art">${brandArt(b)}</div></div>${b.ids.length ? gridHTML(dedupeVariants(b.ids)) : `<div class="sf-brand-request"><h2>Подберём нужные позиции</h2><p>Напишите название товара, объём или задачу. Менеджер уточнит цену, наличие и срок поставки.</p>${b.name === 'ShineMate' ? '<a class="sf-text-link" href="https://shinemate-russia.ru" target="_blank" rel="noopener">Полный каталог ShineMate ↗</a>' : ''}</div>`}</div></section>`;
        paintChrome(); enhance(); return;
      }
    }
    originalRender(); enhance();
  };
  function enhance() {
    const photo = document.querySelector('.product-photo');
    if (photo) {
      const zoom = document.createElement('button');
      zoom.className = 'sf-zoom'; zoom.textContent = 'Увеличить ↗'; zoom.type = 'button';
      zoom.addEventListener('click', () => {
        const original = photo.querySelector('img');
        const dialog = document.createElement('dialog'); dialog.className = 'sf-lightbox';
        const close = document.createElement('button'); close.textContent = 'Закрыть ×'; close.className = 'btn';
        const img = original.cloneNode(); img.removeAttribute('width'); img.removeAttribute('height');
        dialog.append(close, img); document.body.append(dialog);
        close.onclick = () => dialog.close();
        dialog.addEventListener('click', e => {if(e.target === dialog) dialog.close();});
        dialog.addEventListener('close', () => {dialog.remove();zoom.focus();}, {once:true});
        dialog.showModal();
      });
      photo.append(zoom);
    }
    document.querySelectorAll('.sf-story-art').forEach(el => el.setAttribute('data-depth', ''));
    document.querySelectorAll('.side-link:not([href])').forEach(el => {el.tabIndex = 0; el.setAttribute('role','button'); el.onkeydown = e => {if(e.key === 'Enter' || e.key === ' ') {e.preventDefault(); el.click();}};});
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      observer = new IntersectionObserver(entries => entries.forEach(({target,isIntersecting}) => {if(isIntersecting){target.classList.add('sf-visible');observer.unobserve(target);}}), {threshold: .06});
      document.querySelectorAll('.sf-category,.sf-heading,.sf-process a,.sf-b2b').forEach(el => {el.classList.add('sf-reveal');observer.observe(el);});
      if(document.querySelector('.sf-hero')) timer = setInterval(() => {if(!paused && !document.hidden && !document.querySelector('.sf-hero:hover') && !document.querySelector('.sf-hero:focus-within')) go(slide + 1);},6500);
    }
    slide = 0; paused = false;
    let startX;
    const hero = document.querySelector('.sf-hero');
    hero?.addEventListener('touchstart', e => {startX = e.changedTouches[0].clientX;}, {passive:true});
    hero?.addEventListener('touchend', e => {const delta = e.changedTouches[0].clientX - startX;if(Math.abs(delta)>60)go(slide + (delta<0?1:-1));}, {passive:true});
  }
  document.addEventListener('click', e => {
    const target = e.target.closest('button'); if(!target)return;
    if(target.hasAttribute('data-sf-slide'))go(Number(target.dataset.sfSlide));
    if(target.hasAttribute('data-sf-prev'))go(slide-1);
    if(target.hasAttribute('data-sf-next'))go(slide+1);
    if(target.hasAttribute('data-sf-pause')){paused=!paused;target.textContent=paused?'▷':'Ⅱ';target.setAttribute('aria-label',paused?'Продолжить автопрокрутку':'Остановить автопрокрутку');target.setAttribute('aria-pressed',String(paused));}
  });
  document.addEventListener('pointermove', e => {
    if(!matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches)return;
    const el=e.target.closest('[data-depth]'); if(!el)return;
    const r=el.getBoundingClientRect();el.style.setProperty('--tx',((e.clientX-r.left)/r.width-.5)*16+'px');el.style.setProperty('--ty',((e.clientY-r.top)/r.height-.5)*16+'px');el.style.setProperty('--rx', ((e.clientY-r.top)/r.height-.5)*-3+'deg');el.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*3+'deg');
  });
  document.addEventListener('pointerout',e=>{const el=e.target.closest('[data-depth]');if(el&&!el.contains(e.relatedTarget)){el.style.removeProperty('--rx');el.style.removeProperty('--ry');el.style.removeProperty('--tx');el.style.removeProperty('--ty');}});
  render();
  return {brands};
})();
