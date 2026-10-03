/* Shared ranked search. No network requests, storage or changes to catalog records. */
const RetailSearch = (() => {
  const aliases = {'кох':'koch','коч':'koch','звиззер':'zvizzer','звизер':'zvizzer','аутеч':'autech','шайнмейт':'shinemate','шайнмате':'shinemate','гейон':'gyeon','геён':'gyeon','хендлекс':'hendlex'};
  const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
  const rows = P.map((p,i) => {
    const title=normalize(p[F.N]), sku=normalize(p[F.ART]), brand=normalize(BR[p[F.B]]), category=normalize(CAT_NAME[p[F.CAT]]);
    const full=[title,sku,brand,category].join(' ');
    return {i,title,sku,brand,full,compact:full.replace(/ /g,''),tokens:full.split(' ')};
  });
  function find(raw) {
    let q=normalize(raw); if(!q)return [];
    q=q.split(' ').map(t=>aliases[t]||t).join(' ');
    const compact=q.replace(/ /g,''), terms=q.split(' ');
    return rows.map(r=>{
      if(!terms.every(t=>r.full.includes(t))&&!r.compact.includes(compact))return null;
      const sku=r.sku.replace(/ /g,'');
      const score=sku===compact?0:sku.startsWith(compact)?1:r.title.startsWith(q)?2:r.brand.startsWith(q)?3:terms.every(t=>r.tokens.some(w=>w.startsWith(t)))?4:5;
      return {i:r.i,score};
    }).filter(Boolean).sort((a,b)=>a.score-b.score||a.i-b.i).map(r=>r.i);
  }
  const form=document.querySelector('#searchForm'), input=form.querySelector('input');
  const panel=document.createElement('div');panel.className='search-suggestions';panel.id='searchSuggestions';panel.hidden=true;
  const list=document.createElement('div');list.id='searchOptions';list.setAttribute('role','listbox');list.setAttribute('aria-label','Товары');
  const status=document.createElement('p');status.className='search-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const all=document.createElement('a');all.className='search-all';
  panel.append(status,list,all);form.append(panel);
  input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls','searchOptions');
  let active=-1, hits=[];
  const close=()=>{panel.hidden=true;active=-1;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');};
  function show(){
    const q=input.value.trim();if(!q){close();return;}
    const found=find(q); hits=found.slice(0,8);active=-1;
    input.removeAttribute('aria-activedescendant');
    list.innerHTML=hits.map((i,n)=>{const p=P[i];return `<a id="searchOption${n}" class="search-option" role="option" aria-selected="false" tabindex="-1" href="#/product/${i}"><img src="img/${esc(p[F.IMG])}" alt="" width="56" height="64"><span><b>${esc(p[F.N])}</b><small>${esc(BR[p[F.B]])}${p[F.ART]?' · '+esc(p[F.ART]):''}</small></span><strong>${priceOnRequest(p)?'По запросу':money(price(p))}</strong></a>`;}).join('');
    status.textContent=found.length?`Найдено позиций: ${found.length}`:'Ничего не найдено. Попробуйте название, бренд или артикул.';
    all.href='#/catalog?q='+encodeURIComponent(q);all.textContent='Все результаты →';all.hidden=!found.length;
    panel.hidden=false;input.setAttribute('aria-expanded','true');
  }
  input.addEventListener('input',show); input.addEventListener('focus',()=>{if(input.value.trim())show();});
  input.addEventListener('keydown',e=>{
    if(e.isComposing)return;
    if(e.key==='Escape'){e.preventDefault();close();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();if(panel.hidden)show();if(!hits.length)return;
      active=active<0?(e.key==='ArrowDown'?0:hits.length-1):(active+(e.key==='ArrowDown'?1:-1)+hits.length)%hits.length;
      [...list.children].forEach((el,n)=>el.setAttribute('aria-selected',String(n===active)));
      input.setAttribute('aria-activedescendant','searchOption'+active);list.children[active].scrollIntoView({block:'nearest'});
    }else if(e.key==='Enter'&&!panel.hidden&&active>=0){e.preventDefault();location.hash='#/product/'+hits[active];close();}
    else if(e.key==='Tab')close();
  });
  panel.addEventListener('click',e=>{if(e.target.closest('a'))close();});
  form.addEventListener('submit',close);document.addEventListener('click',e=>{if(!form.contains(e.target))close();});
  window.addEventListener('hashchange',close);
  // Mobile has the same always-visible search field, not a second search engine.
  const nav=document.querySelector('.mainnav'), navLinks=document.querySelector('#nav');
  const toggle=document.createElement('button');toggle.type='button';toggle.className='mobile-menu';toggle.textContent='Меню';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','nav');
  toggle.setAttribute('aria-label','Меню');nav.prepend(toggle);
  function shutMenu(){nav.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');}
  toggle.addEventListener('click',()=>{const open=nav.classList.toggle('menu-open');toggle.setAttribute('aria-expanded',String(open));});
  navLinks.addEventListener('click',e=>{if(e.target.closest('a'))shutMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')shutMenu();});
  return {find,normalize};
})();
