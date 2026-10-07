/* Final presentation uses existing catalog records and leaves all store handlers intact. */
(() => {
  const icons={clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 7v5l3 2',whatsapp:'M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8a8.5 8.5 0 1 1 16.1-4Z M8.2 7.5c.3-.2.6-.1.8.3l.8 1.8c.1.3 0 .5-.3.8l-.6.6c.7 1.6 1.9 2.8 3.6 3.5l.7-.9c.2-.3.5-.4.8-.2l1.8.8c.4.2.5.4.4.8-.2 1.1-.9 1.7-2 1.6-3.5-.4-6.8-3.6-7.2-7-.1-1 .3-1.6 1.2-2.1Z',map:'M12 22s8-8 8-14a8 8 0 0 0-16 0c0 6 8 14 8 14Z M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0',phone:'M5 3h4l2 5-3 2a16 16 0 0 0 6 6l2-3 5 2v4c0 2-2 3-4 2C9 19 5 15 3 7c-1-2 0-4 2-4Z',mail:'M3 5h18v14H3z M3 5l9 7 9-7',chat:'M21 11a9 9 0 0 1-9 9H4l-2 2 1-7a9 9 0 1 1 18-4Z M7 10h10 M7 14h6',box:'M3 7l9-5 9 5v11l-9 5-9-5z M3 7l9 5 9-5 M12 12v11 M7 4l10 5',check:'M4 12l5 5L20 6',list:'M8 5h13 M8 12h13 M8 19h13 M3 5h1 M3 12h1 M3 19h1',card:'M2 5h20v14H2z M2 10h20 M6 15h4'};
  const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]||icons.box}"/></svg>`;
  const imageGroup=ids=>`<div class="editorial-products">${ids.filter(i=>P[i]).map(i=>`<figure><img src="img/${esc(P[i][F.IMG])}" alt="${esc(P[i][F.N])}" width="320" height="320" loading="lazy" decoding="async"><figcaption>${esc(BR[P[i][F.B]])}</figcaption></figure>`).join('')}</div>`;
  const panel=(title,text,ids,link='#/contact-request',label='Помочь с подбором')=>`<aside class="editorial-panel"><div><p class="sf-kicker">Из ассортимента магазина</p><h2>${title}</h2><p>${text}</p><a class="btn ghost" href="${link}">${label} ↗</a></div>${imageGroup(ids)}</aside>`;
  const actionIcons=()=>document.querySelectorAll('.store-location .sf-actions a,.contact-primary .sf-actions a').forEach(a=>{
    if(a.querySelector('svg'))return;
    const href=a.getAttribute('href');let name=href.startsWith('tel:')?'phone':href.startsWith('mailto:')?'mail':href.includes('wa.me')?'whatsapp':href.includes('yandex.ru/maps')?'map':null;
    if(name){a.classList.add('contact-action');a.insertAdjacentHTML('afterbegin',icon(name));}
  });
  document.querySelectorAll('.store-contact-panel .store-address').forEach(el=>{el.classList.add('contact-fact');el.insertAdjacentHTML('afterbegin',icon('map'));const hours=el.nextElementSibling;hours.classList.add('contact-fact');hours.insertAdjacentHTML('afterbegin',icon('clock'));});
  document.querySelectorAll('.store-contact-links a,footer a[href^="tel:"],footer a[href^="mailto:"]').forEach(a=>{a.classList.add('contact-detail');a.insertAdjacentHTML('afterbegin',icon(a.getAttribute('href').startsWith('tel:')?'phone':'mail'));});
  const mapCard=document.querySelector('.store-map');
  mapCard.insertAdjacentHTML('afterbegin','<div class="map-brandbar"><img src="img/logo-honeycomb.png" width="26" height="26" alt="" loading="lazy"><span>Наш магазин · Ерёменко, 45</span></div>');
  const labels=['box','check','chat'];
  document.querySelectorAll('.store-service>span').forEach((el,i)=>{el.textContent=['Оптовые условия','Профессиональный ассортимент','Помощь с подбором'][i];el.insertAdjacentHTML('afterbegin',`<i class="service-icon">${icon(labels[i])}</i>`);});
  const about=document.querySelector('.foot-about');const oldBrand=about?.querySelector('b');
  if(oldBrand){const brand=document.createElement('div');brand.className='foot-brandmark';brand.innerHTML='<img src="img/logo-honeycomb.png" alt="" loading="lazy" width="44" height="44"><strong>Правильные технологии</strong>';oldBrand.replaceWith(brand);}
  function seo(main){
    const heading=main.querySelector('h1,h2')||main.querySelector('.empty h3');
    if(heading && !main.querySelector('h1')){const h=document.createElement('h1');h.className=heading.className;h.innerHTML=heading.innerHTML;heading.replaceWith(h);}
    const title=main.querySelector('h1')?.textContent.trim()||'Автохимия и оборудование для детейлинга';
    const route=location.hash.slice(2).split('?')[0];
    document.title=(route?title:'Автохимия и оборудование для детейлинга')+' — Правильные технологии';
    const desc=main.querySelector('.product-desc,.sf-intro,.contact-intro>p,.hero-copy-zone .sf-lede')?.textContent.trim()||`${title}. Ассортимент Правильных технологий, помощь с подбором и заявки на поставку. Магазин в Ростове-на-Дону.`;
    document.querySelector('meta[name="description"]').content=desc.slice(0,250);
    document.querySelector('meta[property="og:title"]').content=document.title;document.querySelector('meta[property="og:description"]').content=desc.slice(0,250);
    const base=new URL('.',document.baseURI).href;
    const entity={'@context':'https://schema.org','@type':'Store',name:'Правильные технологии',legalName:'ООО «Правильные Технологии»',url:base,email:SHOP_EMAIL,telephone:['+79613011818','+79613011919'],address:{'@type':'PostalAddress',streetAddress:'ул. Ерёменко, 45',addressLocality:'Ростов-на-Дону',addressCountry:'RU'},openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'09:00',closes:'18:00'}]};
    let data=document.getElementById('store-structured-data');if(!data){data=document.createElement('script');data.id='store-structured-data';data.type='application/ld+json';document.head.append(data);}data.textContent=JSON.stringify(entity);
    let product=document.getElementById('product-structured-data');product?.remove();
    const match=route.match(/^product\/(\d+)$/);
    if(match&&P[+match[1]]){const p=P[+match[1]];product=document.createElement('script');product.id='product-structured-data';product.type='application/ld+json';product.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Product',name:p[F.N],sku:p[F.ART],brand:{'@type':'Brand',name:BR[p[F.B]]},image:new URL('img/'+p[F.IMG],base).href,description:desc});document.head.append(product);}
    main.querySelectorAll('.crumbs').forEach(el=>{el.setAttribute('role','navigation');el.setAttribute('aria-label','Хлебные крошки');});
  }
  const previous=render;
  render=function(){
    previous();const main=document.querySelector('#main'),route=location.hash.slice(2).split('?')[0];
    main.classList.toggle('page-wholesale',route==='wholesale');main.classList.toggle('page-delivery',route==='delivery');
    if(route==='account'){const access=main.querySelector('.partner-access');access.classList.add('partner-access-rich');access.insertAdjacentHTML('beforeend',`<div class="partner-visual"><p class="sf-kicker">Из ассортимента магазина</p>${imageGroup([1,503,536])}<p>Автохимия, полировальные материалы и оборудование для ежедневной работы.</p></div>`);}
    if(route==='wholesale')main.querySelector('.two>div:first-child')?.insertAdjacentHTML('beforeend',panel('Ассортимент под задачи вашей студии','Укажите нужные материалы и объём закупки. Менеджер уточнит наличие и подготовит предложение.',[1,503,536],'#/catalog','Посмотреть каталог'));
    if(route==='about'){const text=main.querySelector('.legal-doc'),layout=document.createElement('div');layout.className='about-layout';text.before(layout);layout.append(text);layout.insertAdjacentHTML('beforeend',panel('Материалы для ежедневной работы','Автохимия, оборудование и расходники из ассортимента магазина. Поможем подобрать товары под вашу задачу.',[1,503,536],'#/catalog','Перейти в каталог'));}
    if(route==='delivery'){
      main.querySelectorAll('.dir').forEach((el,i)=>el.insertAdjacentHTML('afterbegin',`<span class="delivery-icon">${icon(['list','check','card','box'][i])}</span>`));
      main.querySelector('.wrap')?.insertAdjacentHTML('beforeend',panel('Уточним наличие и способ получения','Самовывоз — на Ерёменко, 45. Условия отправки транспортной компанией согласуем при подтверждении заявки.',[1,503,222],'#/contacts','Связаться с магазином'));
    }
    if(route.startsWith('catalog')){
      const cat=route.split('/')[1],record=CATS.find(c=>c.id===cat);
      if(record&&!location.hash.includes('q=')){const ids=dedupeVariants(P.map((_,i)=>i).filter(i=>P[i][F.CAT]===cat)).slice(0,3);main.querySelector('.catalog')?.insertAdjacentHTML('beforebegin',panel(esc(record.name),esc(record.note),ids,'#/contact-request','Подобрать материалы'));}
    }
    if(route==='promo')main.querySelectorAll('.promo-card').forEach((el,i)=>{const p=P[[503,1,222][i]];el.insertAdjacentHTML('afterbegin',`<img class="promo-visual" src="img/${esc(p[F.IMG])}" alt="${esc(p[F.N])}" loading="lazy" width="320" height="320">`);});
    main.querySelectorAll('.editorial-products').forEach(el=>el.setAttribute('data-depth',''));
    actionIcons();seo(main);
  };
  render();
})();
