/* Small reliability layer; catalog records and purchase rules are unchanged. */
(() => {
  const validId = id => /^\d+$/.test(String(id)) && Array.isArray(P[id]);
  // A stale/corrupt non-sensitive browser basket must never crash the storefront.
  store.cart = Object.fromEntries(Object.entries(store.cart && typeof store.cart==='object' ? store.cart : {}).filter(([id,q])=>validId(id)&&Number.isFinite(q)&&q>0).map(([id,q])=>[id,Math.max(1,Math.min(9999,Math.floor(q)))]));
  store.fav = [...new Set((Array.isArray(store.fav)?store.fav:[]).filter(validId).map(Number))];
  save('pt_cart',store.cart);save('pt_fav',store.fav);
  const fallback = img => {
    if(img.dataset.fallback)return;
    img.dataset.fallback='true';img.src='img/photo-unavailable.svg';
    img.alt='Фото уточняется у менеджера';
  };
  document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement)fallback(e.target);},true);
  const previous=render;
  render=function(){
    previous();
    const main=document.querySelector('#main');
    main.querySelectorAll('img').forEach(img=>{if(img.complete&&!img.naturalWidth)fallback(img);});
    const heading=main.querySelector('h1,h2');
    const label=heading?.textContent.trim()||'Автохимия и оборудование для детейлинга';
    document.title=location.hash==='#/'||!location.hash?'Правильные технологии — автохимия и оборудование для детейлинга':label+' — Правильные технологии';
    const description=main.querySelector('.product-desc,.sf-intro,.contact-intro>p')?.textContent.trim()||'Автохимия, оборудование и расходники. Подбор товаров, доставка и оптовые заявки в Правильных технологиях.';
    document.querySelector('meta[name="description"]').content=description;
    document.querySelector('meta[property="og:title"]').content=document.title;
    document.querySelector('meta[property="og:description"]').content=description;
    const match=location.hash.match(/^#\/product\/(\d+)$/);
    if(match&&validId(match[1])){
      const id=+match[1],info=main.querySelector('.product-info');
      const button=document.createElement('button');button.className='btn ghost product-favorite';button.dataset.fav=id;button.type='button';
      const selected=store.fav.includes(id);button.textContent=selected?'Убрать из избранного':'В избранное';button.setAttribute('aria-pressed',String(selected));
      info?.querySelector('.buy')?.append(button);
    }
  };
  // Modal locking follows the real open/close state, including Escape and backdrop.
  const modal=document.querySelector('#cityModal');let locked=false,scroll=0;
  new MutationObserver(()=>{
    const open=modal.classList.contains('on');if(open===locked)return;locked=open;
    if(open){scroll=window.scrollY;document.body.style.setProperty('--city-scroll',-scroll+'px');document.body.classList.add('city-scroll-lock');}
    else{document.body.classList.remove('city-scroll-lock');document.body.style.removeProperty('--city-scroll');window.scrollTo(0,scroll);}
  }).observe(modal,{attributes:true,attributeFilter:['class']});
  render();
})();
