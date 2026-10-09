/* Visual storefront. Existing SKU indexes, cart and variant groups stay intact. */
const SF = (() => {
  // Verified exact article on koch.ru; do not change SKU, price or stock.
  P.forEach(p => {if (p[F.ART] === '77704750') p[F.IMG] = 'editorial/koch-77704750.png';});
  P.forEach(p => {if (p[F.ART] === '405001' && BR[p[F.B]] === 'Koch Chemie') p[F.IMG] = 'editorial/koch-fine-405001.webp';});
  P.forEach(p => {if (p[F.N].startsWith('TOP STAR') && p[F.VOL] === '1 л') p[F.IMG] = 'editorial/koch-topstar-1l.png';});
  const verifiedPackshots={'Koch Chemie|405250|250 мл':'studio/koch-f6-405250.webp','Koch Chemie|403250|250 мл':'studio/koch-m3-403250.webp'};
  P.forEach(p=>{const match=verifiedPackshots[BR[p[F.B]]+'|'+p[F.ART]+'|'+p[F.VOL]];if(match)p[F.IMG]=match;});
  const all = () => P.map((_, i) => i);
  const byBrand = name => all().filter(i => BR[P[i][F.B]] === name);
  const select = (cat, n = 4) => dedupeVariants(all().filter(i => P[i][F.CAT] === cat).sort((a,b) => P[b][F.ST] - P[a][F.ST])).slice(0, n);
  const image = (i, eager = false) => `<img src="img/${esc(P[i][F.IMG])}" alt="${esc(P[i][F.N])}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="600" height="600">`;
  const extras = [
    ['Glitz', 'Автохимия и уход за автомобилем'],
    ['Dry Monster', 'Товары для детейлинга'],
    ['ShineMate', 'Полировальные машины и оснастка'],
    ['Ultra Technology', 'Ассортимент по запросу'],
    ['Space Cosmetics', 'Автокосметика и уход']
  ];
  const brands = [...BR.map(name => ({name, ids: byBrand(name)})), ...extras.filter(([name]) => !BR.includes(name)).map(([name, note]) => ({name, note, ids: []}))];
  const href = name => '#/brand/' + encodeURIComponent(name);
  const query = name => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Здравствуйте! Пришлите ассортимент и цены ' + name)}`;
  const sectionHead = (title, url = '#/catalog', label = 'Смотреть всё') => `<div class="sf-heading"><h2>${title}</h2><a href="${url}">${label} <span aria-hidden="true">↗</span></a></div>`;
  const label = name => MeetingContent.labels[name] || name;
  const logo = name => BRAND_LOGO[name] ? `<img class="meeting-brand-logo" src="img/${BRAND_LOGO[name]}" alt="${esc(label(name))}" loading="lazy" width="180" height="60">` : `<strong class="meeting-brand-name">${esc(label(name))}</strong>`;
  const family = (ids, name='', eager=false) => `<div class="meeting-family" data-visual-brand="${esc(name)}">${ids.map(i=>{if(name&&BR[P[i][F.B]]!==name)throw Error('Brand image mismatch');return `<span class="meeting-product">${image(i,eager).replace('<img ',`<img data-product-id="${i}" data-brand="${esc(BR[P[i][F.B]])}" `)}</span>`;}).join('')}</div>`;
  const photo = (file,alt,eager=false) => `<img class="studio-photo" src="img/${file}" alt="${esc(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" width="1280" height="800">`;
  const composition=(ids,name='',kind='collection',eager=false)=>`<div class="campaign-composition campaign-${kind}" data-visual-brand="${esc(name)}">${ids.map((id,n)=>`<figure class="campaign-item campaign-item-${n}">${image(id,eager)}${kind==='store'?`<figcaption>${esc(label(BR[P[id][F.B]]))}</figcaption>`:''}</figure>`).join('')}<span class="campaign-caption">${kind==='store'?'Ассортимент магазина · разные бренды':esc(label(name))}</span></div>`;
  const campaignLogo=(brand)=>`<img class="campaign-logo" src="img/${BRAND_LOGO[brand]}" alt="${esc(label(brand))}" width="180" height="55" loading="lazy">`;
  const storeCampaign=()=>`<div class="assortment-stage" aria-label="Ассортимент магазина: автохимия, оборудование и материалы разных брендов"><div class="assortment-light"></div><img class="assortment-machine" src="img/shinemate/ex620.webp" alt="Полировальная машина ShineMate EX620" width="676" height="676" fetchpriority="high"><img class="assortment-koch" src="img/editorial/koch-fine-405001.webp" alt="Паста Koch Chemie F6.01" width="500" height="500" fetchpriority="high"><img class="assortment-zv" src="img/studio/zv-mc3000.webp" alt="Паста ZviZZer MC3000" width="500" height="500" fetchpriority="high"><img class="assortment-pad" src="img/shinemate/foam-flat-t40.webp" alt="Полировальный круг ShineMate" width="797" height="797"><img class="assortment-cloth" src="img/shinemate/towel.webp" alt="Микрофибра ShineMate" width="900" height="579"><span>Ассортимент магазина · разные бренды</span></div>`;
  const colourCampaign=()=>`<div class="colour-campaign">${photo('final/cl-15.webp','Очистка автомобильной кожи COLOURLOCK')}<img class="colour-signature" src="img/brands/colourlock.svg" alt="COLOURLOCK" width="240" height="65"></div>`;
  const kochCampaign=()=>`<div class="koch-campaign" role="img" aria-label="Koch Chemie — полировальные пасты и круги, ExcellenceForExperts"><div class="koch-campaign-products"></div><div class="koch-campaign-identity"></div></div>`;
  const shinemateCampaign=()=>`<div class="shinemate-campaign">${campaignLogo('ShineMate')}${photo('editorial/shinemate.webp','Машинки, кейсы, аккумуляторы и оборудование ShineMate')}</div>`;
  const adviceCampaign=()=>`<div class="advice-campaign advice-photo">${photo('final/compound-apply.webp','Подготовка полировального круга к работе')}</div>`;
  const dealerArt=b=>photo(({'Koch Chemie':'final/kc-40.webp','ShineMate':'final/polisher-holders.webp','ColourLock':'final/cl-16.webp','Space Cosmetics':'studio/space-quazar.webp'})[b.name],label(b.name));
  const discovery=b=>`<a class="discovery-card discovery-${b.name.replace(/[^a-z]/gi,'').toLowerCase()}" href="${href(b.name)}"><div class="discovery-art">${BRAND_LOGO[b.name]?logo(b.name):b.name==='Cyclone'?image(326):''}</div><div><h3>${esc(label(b.name))}</h3><p>${esc(specialties[b.name]||b.note||'Ассортимент по запросу')}</p><span>${b.ids.length?'Открыть товары':'Связаться с магазином'} ↗</span></div></a>`;
  const brandArt = b => {
    const files={'ShineMate':'studio/polishing-tool.webp','Space Cosmetics':'studio/space-quazar.webp'};
    if(files[b.name])return photo(files[b.name],label(b.name));
    const ids=MeetingContent.families[b.name] || dedupeVariants(b.ids).slice(0,1);
    if(ids.length)return `<div class="studio-range studio-range-${b.name==='Koch Chemie'?'koch':'other'}">${family(ids,b.name)}</div>`;
    return `<div class="studio-wordmark"><strong>${esc(label(b.name))}</strong><span>Подбор ассортимента с менеджером ↗</span></div>`;
  };
  const specialties = {'Koch Chemie':'Мойка, полировка и уход за кузовом и салоном.','Zvizzer':'Полировальные пасты и круги для коррекции и финиша.','AuTech':'Оборудование, круги и принадлежности для работы.','Cyclone':'Инструмент для химчистки.','Marolex':'Помповые опрыскиватели.','ColourLock':'Уход за кожей и восстановление цвета.','Finisher':'Мойка и финишная обработка.','PACA':'Смазки и очистители.','Joybond':'Глина для подготовки кузова.','Gyeon':'Защитные покрытия и уход.','Hendlex':'Защитные покрытия.','ShineMate':'Роторные, эксцентриковые, аккумуляторные и компактные машинки.'};
  const brandCard = b => `<a class="studio-brand ${!b.ids.length&&b.name!=='Space Cosmetics'?'studio-brand-text':''}" href="${href(b.name)}"><div class="studio-brand-media">${dealerArt(b)}</div><div class="studio-brand-caption"><h3>${esc(label(b.name))}</h3><p>${esc(specialties[b.name] || b.note || '')}</p><span>${b.ids.length?'Смотреть товары':'Уточнить ассортимент'} ↗</span></div></a>`;
  const officialBrands=MeetingContent.official.map(name=>brands.find(b=>b.name===name));
  const otherBrands=brands.filter(b=>!MeetingContent.official.includes(b.name)).sort((a,b)=>{const o=['Zvizzer','AuTech','Dry Monster','Glitz','Ultra Technology'];return (o.includes(a.name)?o.indexOf(a.name):99)-(o.includes(b.name)?o.indexOf(b.name):99);});
  const category = (c,k) => `<a class="studio-category" href="#/catalog/${c.id}"><div class="studio-category-photo">${StudioMedia.art(c.id)}</div><div><small>0${k+1} / ${P.filter(p=>p[F.CAT]===c.id).length} позиций</small><h3>${esc(c.name)} <span>↗</span></h3></div></a>`;
  const story = name => {const b=brands.find(b=>b.name===name),st=MeetingContent.stories[name],ids=MeetingContent.families[name]||[];return `<section class="sf-section meeting-story"><div class="wrap"><div class="meeting-story-intro"><div><p class="sf-kicker">${esc(label(name))}</p><h2>${st.title}</h2><p class="sf-intro">${st.text}</p><div class="meeting-tags">${st.tags.map(t=>`<span>${t}</span>`).join('')}</div><a class="btn ghost" href="${href(name)}">${ids.length?'Смотреть товары':'Уточнить ассортимент'} ${esc(label(name))} ↗</a></div><div class="meeting-story-art" data-depth>${brandArt(b)}</div></div>${ids.length?gridHTML(ids.slice(0,4)):''}</div></section>`;};
  // Marketing images are tied to real catalog records, including brand identity.
  const sceneProduct = (id, brand, eager=false) => {
    if (!P[id] || BR[P[id][F.B]] !== brand) throw new Error('Marketing brand mismatch: '+brand+' / '+id);
    return `<span class="hero-product-layer">${image(id,eager).replace('<img ',`<img data-product-id="${id}" data-brand="${esc(brand)}" `)}</span>`;
  };
  const ep820 = P.findIndex(p=>BR[p[F.B]]==='ShineMate' && p[F.N].startsWith('EP820'));
  const storeGroup = (id, brand) => `<figure class="hero-store-group">${sceneProduct(id,brand,true)}<figcaption>${esc(label(brand))}</figcaption></figure>`;
  const scenes = [
    {title:'Всё для ухода<br>за автомобилем.',text:'Автохимия, полировальные материалы и профессиональное оборудование. Для мойки, детейлинга и ухода за автомобилем.',link:'#/catalog',cta:'Открыть каталог',alt:'Ассортимент магазина: разные бренды',style:'all',media:storeCampaign()},
    {title:'Koch Chemie<br>для каждого этапа ухода',text:'Мойка, полировка, интерьер и Marine. Подберите средства для нужной поверхности и этапа работы.',link:href('Koch Chemie'),cta:'Смотреть Koch Chemie',alt:'Ассортимент Koch Chemie',style:'koch',media:kochCampaign()},
    {title:'ShineMate<br>инструмент для детейлинга',text:'Роторные, эксцентриковые и аккумуляторные машинки. Мини-инструмент для сложных зон и оборудование для шлифовки.',link:href('ShineMate'),cta:'Смотреть ShineMate',alt:'Инструменты ShineMate',style:'machines',media:shinemateCampaign()},
    {title:'ZviZZer<br>пасты и круги',text:'Пасты HC4000, MC3000 и FC2000. Круги разной жёсткости для режущего, промежуточного и финишного этапов.',link:href('Zvizzer'),cta:'Смотреть ZviZZer',alt:'Круги и наборы ZviZZer',style:'zvizzer',media:composition([648,649,650,55,57,60],'Zvizzer','polish')},
    {title:'COLOURLOCK<br>Уход и восстановление автомобильной кожи',text:'Составы для ухода и восстановления цвета. Материалы для работы с кожаным салоном — с подбором по типу поверхности.',link:href('ColourLock'),cta:'Смотреть COLOURLOCK',alt:'Материалы COLOURLOCK',style:'wash',media:colourCampaign()}
  ];
  let slide = 0, timer, observer, paused = false;
  function go(n) {
    const slides = [...document.querySelectorAll('.hero-slide')];
    if (!slides.length) return;
    slide = (n + slides.length) % slides.length;
    slides.forEach((el, i) => { el.classList.toggle('active', i === slide); el.inert = i !== slide; el.setAttribute('aria-hidden', String(i !== slide)); });
    document.querySelectorAll('[data-sf-slide]').forEach((el, i) => {el.classList.toggle('active', i === slide); el.setAttribute('aria-pressed', String(i === slide));});
  }
  view.home = () => `<div class="sf-home studio-home">
    <section class="sf-hero hex-bg" aria-label="Подбор товаров">
      <div class="wrap hero-layout-shell">
        ${scenes.map((s, i) => `<div class="hero-slide ${i === 0 ? 'active' : ''}" ${i ? 'inert aria-hidden="true"' : ''}><div class="hero-copy-zone"><p class="sf-kicker">Правильные технологии / Детейлинг</p><h1 class="hero-title">${s.title}</h1><p class="sf-lede">${s.text}</p><div class="sf-actions"><a class="btn sf-primary" href="${s.link}">${s.cta} ↗</a><a class="sf-text-link" href="#/wholesale">Оптовым клиентам ↗</a></div></div><div class="hero-media-zone hero-media-${s.style}" data-depth>${s.media}</div></div>`).join('')}
        <div class="sf-hero-bottom"><div class="sf-hero-stats"><span><b>${P.length}</b> позиций в каталоге</span><span>Подбор для моек и студий</span></div><div class="sf-controls"><button data-sf-prev aria-label="Предыдущий слайд">←</button>${scenes.map((s,i) => `<button class="sf-dot ${i ? '' : 'active'}" data-sf-slide="${i}" aria-label="${s.alt}" aria-pressed="${i === 0}"></button>`).join('')}<button data-sf-next aria-label="Следующий слайд">→</button></div></div>
      </div>
    </section>
    <section class="sf-section meeting-official"><div class="wrap">${sectionHead('Официальный дилер', '#/brands', 'Все бренды')}<p class="sf-intro">Четыре направления, с которыми работает наш магазин.</p><div class="studio-brand-grid">${officialBrands.map(brandCard).join('')}</div></div></section>
    <section class="sf-section sf-categories"><div class="wrap">${sectionHead('От мойки до финишного ухода')}<p class="sf-intro">Выберите этап работы. Внутри — составы, инструмент и материалы из ассортимента магазина.</p><div class="studio-category-grid">${CATS.map(category).join('')}</div></div></section>
    <section class="sf-section"><div class="wrap">${sectionHead('Товары для ежедневной работы')}<p class="sf-intro">Полировальные пасты и проверенные составы для ухода за пластиком и дисками.</p>${gridHTML(MeetingContent.daily)}</div></section>
    <section class="sf-section studio-feature"><div class="wrap studio-feature-grid"><div class="studio-feature-photo">${composition([649,650,59,60,70],'Zvizzer','finish')}</div><div><p class="sf-kicker">ZviZZer / Полировка</p><h2>Убрать риску.<br>Вернуть глубину цвета.</h2><p class="sf-intro">От коррекции к чистому финишу. Состав и жёсткость круга выбирают вместе — с учётом лака, дефектов и оборудования.</p><a class="btn" href="${href('Zvizzer')}">Пасты и круги ZviZZer ↗</a></div></div></section>
    <section class="sf-section"><div class="wrap">${sectionHead('Пять шагов ухода')}<div class="studio-process">${[['wash','Мойка','Смыть дорожную плёнку и бережно очистить кузов'],['supplies','Подготовка','Убрать стойкие загрязнения и подготовить поверхность'],['polish','Полировка','Выбрать пасту и круг по состоянию лака'],['wash','Защита','Нанести подходящий консервирующий состав'],['interior','Уход','Поддерживать чистоту кузова и салона']].map((x,i)=>`<a href="#/catalog/${x[0]}"><div class="step-photo">${photo(['final/cl-5.webp','final/cl-7.webp','final/ex605.webp','studio/coating-application.webp','final/step-finish.webp'][i],x[1])}<b>0${i+1}</b></div><h3>${x[1]}</h3><span>${x[2]}</span><em>Выбрать материалы ↗</em></a>`).join('')}</div></div></section>
    <section class="sf-section meeting-other"><div class="wrap">${sectionHead('Марки, с которыми мы работаем','#/brands','Все бренды')}<div class="studio-other">${otherBrands.slice(0,6).map(discovery).join('')}</div></div></section>
    <section class="sf-section"><div class="wrap studio-help"><div>${adviceCampaign()}</div><div><p class="sf-kicker">Магазин в Ростове-на-Дону</p><h2>Поможем выбрать<br>состав и оснастку.</h2><p class="sf-intro">Расскажите, что планируете делать. Подберём составы, круги и оборудование с учётом совместимости и наличия.</p><div class="sf-actions"><a class="btn" href="#/contact-request">Получить консультацию ↗</a><a class="btn ghost" href="#/wholesale">Опт и партнёрам ↗</a></div></div></div></section>
  </div>`;
  view.brands = () => `<section class="sf-section"><div class="wrap"><p class="crumbs"><a href="#/">Главная</a> / Бренды</p><h1 class="sf-page-title">Бренды в нашем магазине</h1><h2>Официальный дилер</h2><div class="studio-brand-grid">${officialBrands.map(b=>`<a class="brand-directory-dealer" href="${href(b.name)}"><div class="directory-scene">${b.name==='Space Cosmetics'?photo('studio/space-apollo.webp','Space Cosmetics Apollo'):dealerArt(b)}</div><h2>${esc(label(b.name))}</h2><p>${esc(specialties[b.name]||b.note)}</p><span>Перейти к бренду ↗</span></a>`).join('')}</div><h2 class="meeting-section-title">Другие бренды</h2><div class="studio-other brand-directory">${otherBrands.map(discovery).join('')}</div></div></section>`;
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
        document.querySelector('#main').innerHTML = `<section class="sf-section"><div class="wrap"><p class="crumbs"><a href="#/brands">Бренды</a> / ${esc(b.name)}</p><div class="sf-brand-hero"><div><p class="sf-kicker">${MeetingContent.official.includes(b.name)?'Официальный дилер':'Бренд в нашем магазине'}</p><h1 class="sf-page-title">${esc(label(b.name))}</h1><p class="sf-intro">${esc(MeetingContent.stories[b.name]?.text || (b.ids.length ? `Позиций: ${b.ids.length}. Выберите нужный объём или размер.` : b.note + '. Ассортимент уточнит менеджер.'))}</p><a class="btn sf-primary" href="${b.ids.length ? '#/catalog?brand=' + encodeURIComponent(b.name) : query(b.name)}" ${b.ids.length ? '' : 'target="_blank" rel="noopener"'}>${b.ids.length ? 'В каталог бренда' : 'Запросить ассортимент'} ↗</a></div><div class="sf-brand-hero-art">${brandArt(b)}</div></div>${b.ids.length ? gridHTML(dedupeVariants(b.ids)) : `<div class="sf-brand-request"><h2>Подберём нужные позиции</h2><p>Напишите название товара, объём или задачу. Менеджер уточнит цену, наличие и срок поставки.</p>${b.name === 'ShineMate' ? '<a class="sf-text-link" href="https://shinemate-russia.ru" target="_blank" rel="noopener">Полный каталог ShineMate ↗</a>' : ''}</div>`}</div></section>`;
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
    hero?.addEventListener('touchend', e => {const delta = e.changedTouches[0].clientX - startX;if(Math.abs(delta)>60){paused=true;go(slide + (delta<0?1:-1));}}, {passive:true});
  }
  document.addEventListener('click', e => {
    const target = e.target.closest('button'); if(!target)return;
    if(target.hasAttribute('data-sf-slide')){paused=true;go(Number(target.dataset.sfSlide));}
    if(target.hasAttribute('data-sf-prev')){paused=true;go(slide-1);}
    if(target.hasAttribute('data-sf-next')){paused=true;go(slide+1);}
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
