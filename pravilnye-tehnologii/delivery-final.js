/* Verified store location. Public map embed loads when approaching the visible contact block. */
(() => {
  const location = document.createElement('section');
  location.className='store-location';location.setAttribute('aria-label','Магазин и самовывоз');
  location.innerHTML=`<div class="wrap"><div class="store-service"><span>↗ Работа с оптовыми клиентами</span><span>✓ Профессиональный ассортимент</span><span>＋ Консультация и подбор материалов</span></div>
    <div class="store-location-grid"><div class="store-contact-panel"><div class="store-signature"><img src="img/brands/pt-client-mark.svg" alt="" width="48" height="48" loading="lazy"><span>Правильные технологии<small>Автохимия · оборудование · материалы</small></span></div><p class="sf-kicker">Магазин и самовывоз</p><h2>Магазин<br>в Ростове-на-Дону</h2><p class="store-address">Ростов-на-Дону<br>ул. Ерёменко, 45</p><p>Пн–Пт 09:00–18:00<br>Сб–Вс — выходной</p>
    <div class="store-contact-links"><a href="tel:+79613011919">+7 (961) 301-19-19</a><a href="tel:+79613011818">+7 (961) 301-18-18</a><a href="mailto:iq_technologii@mail.ru">iq_technologii@mail.ru</a></div>
    <div class="sf-actions"><a class="btn" href="tel:+79613011919">Позвонить</a><a class="btn ghost" href="https://wa.me/79613011919" target="_blank" rel="noopener">WhatsApp ↗</a><a class="btn ghost" href="mailto:iq_technologii@mail.ru">Email ↗</a><a class="btn ghost" href="https://yandex.ru/maps/org/pravilnyye_tekhnologii/81518304967/" target="_blank" rel="noopener">Маршрут ↗</a></div></div>
    <div class="store-map location-preview"><div class="location-illustration" role="img" aria-label="Адрес магазина: Ростов-на-Дону, улица Ерёменко, 45"><span class="location-city">РОСТОВ-НА-ДОНУ</span><div class="location-road">ул. Ерёменко</div><div class="location-pin"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-8 8-14A8 8 0 0 0 4 8c0 6 8 14 8 14Z"/><circle cx="12" cy="8" r="3"/></svg><strong>45</strong><span>Правильные технологии</span></div><small>Адресная иллюстрация · не карта местности</small></div><div class="location-preview-actions"><a class="btn" href="https://yandex.ru/maps/org/pravilnyye_tekhnologii/81518304967/" target="_blank" rel="noopener">Открыть в Яндекс Картах ↗</a><a class="btn ghost" href="https://yandex.ru/maps/?rtext=~47.232628,39.630769&amp;rtt=auto" target="_blank" rel="noopener">Построить маршрут ↗</a></div></div></div></div>`;
  document.querySelector('footer').before(location);
  const previous=render;
  function closeFilters(){const side=document.querySelector('#sideWrap');side?.classList.remove('open','on');document.body.classList.remove('filter-sheet-lock');document.querySelector('#filtersToggle')?.setAttribute('aria-expanded','false');}
  render=function(){
    document.body.classList.remove('filter-sheet-lock');previous();
    const side=document.querySelector('#sideWrap'),toggle=document.querySelector('#filtersToggle');
    if(side){
      const close=document.createElement('button');close.type='button';close.className='filter-close';close.textContent='Показать товары · Закрыть фильтры';close.addEventListener('click',()=>{closeFilters();toggle.focus();});side.prepend(close);
      const reset=document.createElement('a');reset.className='btn ghost';reset.href='#/catalog';reset.textContent='Сбросить фильтры';reset.addEventListener('click',e=>{if(window.location.hash==='#/catalog'){e.preventDefault();applyHash();document.querySelector('#filtersToggle')?.focus();}});side.querySelector('.side').prepend(reset);
      side.querySelectorAll('[data-f]').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-pressed',String(el.classList.contains('on')));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
      toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','sideWrap');
    }
  };
  document.addEventListener('click',e=>{if(e.target.closest('#filtersToggle')){const open=document.querySelector('#sideWrap')?.classList.contains('open');document.body.classList.toggle('filter-sheet-lock',open&&matchMedia('(max-width:767px)').matches);document.querySelector('#filtersToggle')?.setAttribute('aria-expanded',String(open));if(open)document.querySelector('.filter-close')?.focus();}});
  document.addEventListener('keydown',e=>{
    if(!document.body.classList.contains('filter-sheet-lock'))return;
    if(e.key==='Escape'){closeFilters();document.querySelector('#filtersToggle')?.focus();}
    if(e.key==='Tab'){const nodes=[...document.querySelectorAll('#sideWrap button,#sideWrap a,#sideWrap input')].filter(n=>n.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });
  matchMedia('(max-width:767px)').addEventListener('change',closeFilters);
  render();
})();
