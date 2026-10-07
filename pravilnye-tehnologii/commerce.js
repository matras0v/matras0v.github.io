/* Shopping presentation: reuse existing routes, product state, search and delegated controls. */
(() => {
  const svg=path=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  const gridIcon=svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>');
  const listIcon=svg('<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>');
  const header=document.querySelector('.masthead'),logo=header.querySelector('.logo'),search=document.querySelector('#searchForm'),phone=document.querySelector('#topPhone'),city=document.querySelector('#cityBtn');
  const cart=header.querySelector('a[href="#/cart"]'),favorite=header.querySelector('a[href="#/favorites"]'),profile=header.querySelector('a[href="#/account"]');
  header.classList.add('shop-header');
  search.querySelector('button[type="submit"]').remove();search.querySelector('input').placeholder='Что вы ищете?';search.insertAdjacentHTML('afterbegin',svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'));
  const catalog=document.createElement('button');catalog.type='button';catalog.className='shop-catalog';catalog.innerHTML=gridIcon+'<span>Каталог</span>';catalog.setAttribute('aria-label','Каталог');catalog.setAttribute('aria-expanded','false');catalog.setAttribute('aria-controls','shop-catalog-panel');
  const more=document.createElement('button');more.type='button';more.className='shop-icon';more.innerHTML=svg('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>');more.setAttribute('aria-label','Меню и информация');more.title='Меню и информация';more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls','shop-more-panel');
  for(const [el,label] of [[cart,'Корзина'],[favorite,'Избранное'],[profile,'Оптовым клиентам']]){el.className='shop-icon';el.setAttribute('aria-label',label);el.title=label;for(const n of [...el.childNodes])if(n.nodeType===3)n.remove();}
  const bar=document.createElement('div');bar.className='shop-bar';const actions=document.createElement('div');actions.className='shop-actions';actions.append(favorite,cart,profile,more);bar.append(logo,catalog,search,phone,actions);header.replaceChildren(bar);
  document.querySelector('.mainnav').remove();
  const mega=document.createElement('section');mega.id='shop-catalog-panel';mega.className='shop-panel shop-mega';mega.hidden=true;mega.setAttribute('aria-label','Разделы каталога');
  mega.innerHTML=`<div class="shop-panel-head"><h2>Каталог товаров</h2><button type="button" data-shop-close aria-label="Закрыть каталог">×</button></div><div class="shop-categories">${CATS.map(c=>`<a href="#/catalog/${c.id}"><img src="img/${esc(catThumb(c.id))}" alt="" width="68" height="76" loading="lazy"><span><b>${esc(c.name)}</b><small>${esc(c.note)}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</div><div class="shop-panel-foot"><a class="btn" href="#/catalog">Весь каталог</a><a href="#/brands">Бренды ↗</a><a href="#/promo">Акции ↗</a><a href="#/favorites">Избранное ↗</a></div>`;
  const info=document.createElement('section');info.id='shop-more-panel';info.className='shop-panel shop-info';info.hidden=true;info.setAttribute('aria-label','Информация и город');
  info.innerHTML='<div class="shop-panel-head"><h2>Информация</h2><button type="button" data-shop-close aria-label="Закрыть меню">×</button></div><div class="shop-info-links"><a href="#/about">О компании</a><a href="#/contacts">Контакты</a><a href="#/delivery">Доставка и оплата</a><a href="#/returns">Возврат</a><a href="#/offer">Документы и оферта</a><a href="#/privacy">Политика конфиденциальности</a></div><div class="shop-location"><span>Ваш город</span></div>';
  info.querySelector('.shop-location').append(city);header.append(mega,info);
  let opened=null,owner=null;
  const close=(focus=false)=>{if(!opened)return;opened.hidden=true;owner.setAttribute('aria-expanded','false');document.body.classList.remove('shop-panel-open');const prev=owner;opened=null;owner=null;if(focus)prev.focus();};
  const toggle=(panel,button,keyboard=false)=>{const was=opened===panel;close();if(was)return;opened=panel;owner=button;panel.hidden=false;button.setAttribute('aria-expanded','true');document.body.classList.add('shop-panel-open');if(keyboard)panel.querySelector('a,button').focus();};
  for(const [button,panel] of [[catalog,mega],[more,info]]){button.addEventListener('click',()=>toggle(panel,button));button.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();if(opened!==panel)toggle(panel,button,true);else panel.querySelector('a,button').focus();}});}
  header.addEventListener('click',e=>{if(e.target.closest('[data-shop-close]'))close(true);else if(e.target.closest('.shop-panel a,#cityBtn'))close();});
  document.addEventListener('click',e=>{if(!header.contains(e.target))close();});
  search.querySelector('input').addEventListener('focus',()=>close());
  document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();close(true);}if(e.key==='Tab'){const all=[owner,...opened.querySelectorAll('a,button')].filter(e=>e.getClientRects().length),first=all[0],last=all.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  window.addEventListener('hashchange',()=>close());
  const size=()=>{const h=header.getBoundingClientRect().height;document.documentElement.style.setProperty('--header-clearance',(h+16)+'px');document.documentElement.style.setProperty('--shop-header-height',h+'px');};new ResizeObserver(size).observe(header);size();
  let frame=0;const scroll=()=>{frame=0;header.classList.toggle('is-scrolled',scrollY>80);};window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(scroll);},{passive:true});scroll();
  // One wholesale entry in the header; retain the existing account route as the honest access flow.
  document.querySelector('footer a[href="#/account"]')?.closest('li')?.remove();
  let mode='grid';try{if(localStorage.getItem('pt_catalog_view')==='list')mode='list';}catch{}
  function applyView(){const grid=document.querySelector('.catalog-results>.grid');if(grid){grid.classList.toggle('catalog-list',mode==='list');document.querySelectorAll('[data-catalog-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.catalogView===mode)));}}
  const previous=render;
  render=function(){
    const old=document.querySelector('#sideWrap'),keepOpen=old?.classList.contains('open')&&matchMedia('(max-width:767px)').matches,sideScroll=old?.scrollTop||0;
    previous();const side=document.querySelector('#sideWrap'),catalogEl=document.querySelector('.catalog');
    if(!catalogEl)return;
    const results=side.nextElementSibling;results.classList.add('catalog-results');
    const toolbar=results.querySelector('.toolbar'),sort=toolbar.querySelector('.sort'),select=document.createElement('select');select.className='catalog-sort';select.setAttribute('aria-label','Сортировка');
    select.innerHTML=[['pop','Сначала в наличии'],['hit','Подборка'],['asc','Сначала дешевле'],['desc','Сначала дороже']].map(([v,n])=>`<option value="${v}">${n}</option>`).join('');select.value=filters.sort;select.addEventListener('change',()=>{filters.sort=select.value;filters.page=1;render();});sort.replaceWith(select);
    const switcher=document.createElement('div');switcher.className='catalog-view';switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Вид товаров');switcher.innerHTML=`<button type="button" data-catalog-view="grid" aria-label="Плитка" title="Плитка">${gridIcon}</button><button type="button" data-catalog-view="list" aria-label="Список" title="Список">${listIcon}</button>`;toolbar.append(switcher);
    const pager=results.querySelector('.pager');if(pager){pager.setAttribute('aria-label','Страницы каталога снизу');pager.setAttribute('role','navigation');pager.querySelectorAll('[data-page]').forEach(b=>{if(b.classList.contains('on'))b.setAttribute('aria-current','page');if(!b.getAttribute('aria-label'))b.setAttribute('aria-label','Страница '+b.dataset.page);});const top=pager.cloneNode(true);top.classList.add('pager-top');top.setAttribute('aria-label','Страницы каталога сверху');toolbar.after(top);}
    if(side){side.scrollTop=sideScroll;if(keepOpen){side.classList.add('open');document.body.classList.add('filter-sheet-lock');document.querySelector('#filtersToggle').setAttribute('aria-expanded','true');}side.querySelector('.filter-close').textContent='Показать товары';}
    applyView();
  };
  document.addEventListener('click',e=>{const button=e.target.closest('[data-catalog-view]');if(!button)return;mode=button.dataset.catalogView;try{localStorage.setItem('pt_catalog_view',mode);}catch{}applyView();});
  render();
})();
