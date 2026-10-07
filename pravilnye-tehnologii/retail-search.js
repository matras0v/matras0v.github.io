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
  const requestBrands=['Glitz','Dry Monster','Ultra Technology','Space Cosmetics'];
  const close=()=>{panel.hidden=true;active=-1;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');};
  function show(){
    const q=input.value.trim();if(!q){close();return;}
    const found=find(q); hits=found.slice(0,8);active=-1;
    const brandHits=requestBrands.filter(b=>normalize(b).includes(normalize(q))).slice(0,3);
    input.removeAttribute('aria-activedescendant');
    list.innerHTML=hits.map((i,n)=>{const p=P[i];return `<a id="searchOption${n}" class="search-option" role="option" aria-selected="false" tabindex="-1" href="#/product/${i}"><img src="img/${esc(p[F.IMG])}" alt="" width="56" height="64"><span><b>${esc(p[F.N])}</b><small>${esc(BR[p[F.B]])}${p[F.ART]?' · '+esc(p[F.ART]):''}</small></span><strong>${priceOnRequest(p)?'По запросу':money(price(p))}</strong></a>`;}).join('');
    list.insertAdjacentHTML('beforeend',brandHits.map((b,n)=>`<a id="searchOption${hits.length+n}" class="search-option" role="option" aria-selected="false" tabindex="-1" href="#/brand/${encodeURIComponent(b)}"><span><b>${esc(b)}</b><small>Ассортимент бренда — по запросу</small></span><strong>Открыть →</strong></a>`).join(''));
    status.textContent=found.length?`Найдено позиций: ${found.length}`:brandHits.length?'Найден бренд. Наличие и цены уточнит менеджер.':'Ничего не найдено. Попробуйте название, бренд или артикул.';
    all.href='#/catalog?q='+encodeURIComponent(q);all.textContent='Все результаты →';all.hidden=!found.length;
    panel.hidden=false;input.setAttribute('aria-expanded','true');
  }
  input.addEventListener('input',show); input.addEventListener('focus',()=>{if(input.value.trim())show();});
  input.addEventListener('keydown',e=>{
    if(e.isComposing)return;
    if(e.key==='Escape'){e.preventDefault();close();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();if(panel.hidden)show();const count=list.children.length;if(!count)return;
      active=active<0?(e.key==='ArrowDown'?0:count-1):(active+(e.key==='ArrowDown'?1:-1)+count)%count;
      [...list.children].forEach((el,n)=>el.setAttribute('aria-selected',String(n===active)));
      input.setAttribute('aria-activedescendant','searchOption'+active);list.children[active].scrollIntoView({block:'nearest'});
    }else if(e.key==='Enter'&&!panel.hidden&&active>=0){e.preventDefault();location.hash=list.children[active].getAttribute('href');close();}
    else if(e.key==='Tab')close();
  });
  panel.addEventListener('click',e=>{if(e.target.closest('a'))close();});
  form.addEventListener('submit',close);document.addEventListener('click',e=>{if(!form.contains(e.target))close();});
  window.addEventListener('hashchange',close);
  const mobile=matchMedia('(max-width:767px)');
  document.querySelectorAll('.foot-col:not(:last-child)').forEach(col=>{
    const heading=col.querySelector('h5'), list=col.querySelector('ul');if(!heading||!list)return;
    const details=document.createElement('details'),summary=document.createElement('summary');
    details.className='footer-disclosure';summary.textContent=heading.textContent;details.append(summary,list);heading.replaceWith(details);
    const sync=()=>{details.open=!mobile.matches;};sync();mobile.addEventListener('change',sync);
  });
  return {find,normalize};
})();
