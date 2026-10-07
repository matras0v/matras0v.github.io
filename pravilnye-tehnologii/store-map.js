/* A real geographic marker; map code and tiles load only near the contact section. */
(() => {
  const host=document.getElementById('store-map-canvas');
  if(!host)return;
  const load=(tag,attrs)=>new Promise((resolve,reject)=>{const el=document.createElement(tag);Object.assign(el,attrs);el.onload=resolve;el.onerror=reject;document.head.append(el);});
  async function init(){
    try{
      await Promise.all([load('link',{rel:'stylesheet',href:'vendor/leaflet/leaflet.css'}),load('script',{src:'vendor/leaflet/leaflet.js'})]);
      const point=[47.232628,39.630769];
      const map=L.map(host,{scrollWheelZoom:false,zoomControl:false,minZoom:10,maxZoom:19}).setView(point,16);
      L.control.zoom({position:'topright',zoomInTitle:'Приблизить',zoomOutTitle:'Отдалить'}).addTo(map);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
      const pin=L.divIcon({className:'store-brand-pin',html:'<span class="store-pin-body"><img src="img/logo-honeycomb.png" alt="" width="38" height="38"></span><span class="store-pin-caption">Правильные технологии</span>',iconSize:[56,68],iconAnchor:[28,68]});
      L.marker(point,{icon:pin,title:'Правильные технологии — Ерёменко, 45',alt:'Магазин Правильные технологии',keyboard:true}).addTo(map).on('click',()=>map.setView(point,17));
      const reset=L.Control.extend({options:{position:'topright'},onAdd(){const button=L.DomUtil.create('button','map-recenter');button.type='button';button.title='Показать магазин';button.setAttribute('aria-label','Показать магазин');button.textContent='⌖';L.DomEvent.disableClickPropagation(button);L.DomEvent.on(button,'click',()=>map.setView(point,16));return button;}});
      new reset().addTo(map);
      host.querySelector('.map-load-fallback')?.remove();
      new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(host);
    }catch{host.classList.add('map-unavailable');}
  }
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();init();}},{rootMargin:'200px'});
  observer.observe(host);
})();
