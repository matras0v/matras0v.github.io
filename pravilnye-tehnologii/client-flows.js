/* Contact data stays in the current form DOM only. No account/password capture.
 * No PII in local/session storage; no automatic third-party form transmission. */
(() => {
  const requestAttempts = new WeakMap();
  const formPrefixes = {orderForm:'o',partnerForm:'p',contactForm:'c'};
  view['contact-request']=()=>`<section class="screen on"><div class="wrap"><p class="crumbs"><a href="#/contacts">Контакты</a> / Заявка</p><form class="form-card" id="contactForm"><h1>Связаться с магазином</h1><div class="two-col"><div class="field"><label for="cname">Имя</label><input id="cname" required autocomplete="name"></div><div class="field"><label for="cphone">Телефон</label><input id="cphone" type="tel" required></div></div><div class="field"><label for="cemail">Почта (необязательно)</label><input id="cemail" type="email" autocomplete="email"></div><div class="field"><label for="ccity">Город (необязательно)</label><input id="ccity" value="${esc(store.city)}"></div><div class="field"><label for="cmessage">Сообщение</label><textarea id="cmessage" rows="4" required></textarea></div><label class="check consent-check"><input type="checkbox" required><span>Согласен(на) на <a href="#/consent">обработку персональных данных</a> и ознакомлен(а) с <a href="#/privacy">политикой конфиденциальности</a></span></label><button class="btn" type="submit">Подготовить письмо</button></form></div></section>`;
  const val = (form, id) => form.querySelector('#'+id)?.value.trim() || '';
  const cities = (form, prefix) => val(form,prefix+'city') === 'Другой город' ? val(form,prefix+'cityOther') : val(form,prefix+'city');
  function setup(form) {
    if (form.dataset.requestReady) return;
    form.dataset.requestReady = 'true';
    const honeypot = document.createElement('div');
    honeypot.className = 'request-honeypot'; honeypot.setAttribute('aria-hidden','true');
    honeypot.innerHTML = '<label>Оставьте поле пустым<input name="website" tabindex="-1" autocomplete="off"></label>';
    form.append(honeypot);
    const status = document.createElement('div'); status.className='request-status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); form.append(status);
    const note = document.createElement('p'); note.className='note request-notice';
    note.textContent=RequestClient.configured ? 'Заявка считается принятой только после подтверждения сервера.' : 'Прямая отправка пока недоступна. Подготовьте письмо и отправьте его из своей почты. Данные не сохраняются на сайте.';
    form.querySelector('[type=submit]').before(note);
    form.querySelector('[type=submit]').textContent=RequestClient.configured ? 'Отправить заявку' : 'Подготовить письмо';
    form.querySelectorAll('input:not([type=checkbox]),textarea').forEach(el=>{el.maxLength=el.tagName==='TEXTAREA'?2000:200;});
    form.querySelectorAll('input[type=tel]').forEach(el=>{el.autocomplete='tel';el.maxLength=24;});
  }
  const previousRender=render;
  render=function(){previousRender();document.querySelectorAll('#orderForm,#partnerForm,#contactForm').forEach(setup);};
  const phoneOK = s => /^\+?[\d\s()-]+$/.test(s) && s.replace(/\D/g,'').length>=10 && s.replace(/\D/g,'').length<=15;
  function validate(form) {
    const prefix=formPrefixes[form.id];
    const phone=form.querySelector('#'+prefix+'phone');
    phone.setCustomValidity(phoneOK(phone.value)?'':'Введите корректный телефон: от 10 до 15 цифр.');
    const other=form.querySelector('#'+prefix+'cityOther');
    if(other)other.required=val(form,prefix+'city')==='Другой город';
    const inn=form.querySelector('#pinn');if(inn)inn.setCustomValidity(!inn.value || /^\d{10}(\d{2})?$/.test(inn.value)?'':'ИНН должен содержать 10 или 12 цифр.');
    return form.reportValidity();
  }
  document.addEventListener('input',e=>{if(e.target.closest('#orderForm,#partnerForm,#contactForm'))e.target.setCustomValidity?.('');});
  document.addEventListener('change',e=>{
    if(!['ocity','pcity'].includes(e.target.id))return;
    const other=document.getElementById(e.target.id+'Other');
    other.required=e.target.value==='Другой город';
    if(!other.required)other.setCustomValidity('');
  });
  document.addEventListener('submit', async e=>{
    const form=e.target;if(!formPrefixes[form.id])return;
    e.preventDefault();if(form.dataset.sending==='true'||form.dataset.submitted==='true'||!validate(form))return;
    const status=form.querySelector('.request-status');
    if(form.querySelector('[name=website]').value){status.textContent='Не удалось подготовить заявку. Свяжитесь с магазином по телефону.';return;}
    const order=form.id==='orderForm',contact=form.id==='contactForm',prefix=formPrefixes[form.id];
    const payload={type:order?'order':contact?'contact':'wholesale',requestId:'',consent:{accepted:true,version:'2026-10-03'},customer:{name:val(form,prefix+'name'),phone:val(form,prefix+'phone'),email:val(form,prefix+'email'),city:(contact?val(form,'ccity'):cities(form,prefix))},comment:val(form,order?'ocomm':contact?'cmessage':'pcomment')};
    payload.website=form.querySelector('[name=website]').value;
    if(order){
      payload.items=Object.entries(store.cart).map(([i,q])=>({productId:Number(i),sku:P[i][F.ART]||'',title:P[i][F.N],variant:variantLabel(+i),quantity:q,unitPrice:price(P[i]),availability:P[i][F.ST]?'in_stock':'on_request'}));
      payload.total=cartTotal();payload.currency='RUB';payload.shipping=form.querySelector('[name=ship]:checked').value;
      if(!payload.items.length){status.textContent='Корзина пуста. Сначала добавьте товары.';return;}
    }else if(!contact)payload.business={company:val(form,'pcomp'),legalForm:val(form,'pform'),inn:val(form,'pinn'),activity:val(form,'pactivity'),volume:val(form,'pvolume')};
    const fingerprint=JSON.stringify(payload),previousAttempt=requestAttempts.get(form);
    payload.requestId=previousAttempt?.fingerprint===fingerprint?previousAttempt.requestId:crypto.randomUUID();
    requestAttempts.set(form,{fingerprint,requestId:payload.requestId});
    const text=[order?'Заявка на заказ':contact?'Контактная заявка':'Запрос оптовых условий',`Имя: ${payload.customer.name}`,`Телефон: ${payload.customer.phone}`,`Почта: ${payload.customer.email||'не указана'}`,`Город: ${payload.customer.city}`,
      ...(order?[`Получение: ${payload.shipping}`,...payload.items.map(x=>`${x.title}; арт. ${x.sku||'уточняется'}; ${x.variant}; ${x.quantity} шт. × ${money(x.unitPrice)}; ${x.availability==='in_stock'?'в наличии':'под заказ'}`),`Итого по каталогу: ${money(payload.total)}`]:contact?[]:[`Компания: ${payload.business.company}`,`Форма: ${payload.business.legalForm}`,`ИНН: ${payload.business.inn||'не указан'}`,`Профиль: ${payload.business.activity}`,`Закупки: ${payload.business.volume}`]),`Комментарий: ${payload.comment||'нет'}`].join('\n');
    if(!RequestClient.configured){
      status.replaceChildren();const title=document.createElement('b');title.textContent='Письмо подготовлено, но ещё не отправлено';
      const copy=document.createElement('p');copy.textContent='Проверьте текст ниже. Отправьте его на '+SHOP_EMAIL+' из почтового приложения. Корзина останется на месте.';
      const preview=document.createElement('pre');preview.className='request-preview';preview.textContent=text;
      const link=document.createElement('a');link.className='btn ghost';link.textContent='Открыть письмо';link.href='mailto:'+SHOP_EMAIL+'?subject='+encodeURIComponent(order?'Заявка с сайта':contact?'Контактная заявка':'Оптовое сотрудничество')+'&body='+encodeURIComponent(text);
      const download=document.createElement('button');download.type='button';download.className='btn ghost';download.textContent='Скачать текст заявки';download.onclick=()=>{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='zayavka.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
      status.append(title,copy,preview,link,download);return;
    }
    const button=form.querySelector('[type=submit]');button.disabled=true;form.dataset.sending='true';form.setAttribute('aria-busy','true');button.textContent='Отправляем…';status.textContent='Ожидаем подтверждение сервера…';
    try{
      const result=await RequestClient.send(payload);
      form.dataset.submitted='true';
      status.textContent='Заявка отправлена в почтовую систему. Номер: '+result.requestId+'. Получение письма магазином пока не подтверждено.';
      if(order){for(const item of payload.items){const index=item.productId;if(index>=0){const left=(store.cart[index]||0)-item.quantity;if(left>0)store.cart[index]=left;else delete store.cart[index];}}save('pt_cart',store.cart);paintChrome();}
      form.querySelectorAll('input,select,textarea,button[type=submit]').forEach(el=>el.disabled=true);
    }catch(error){status.textContent='Не удалось подтвердить отправку заявки. Попробуйте ещё раз или напишите на '+SHOP_EMAIL+'. Данные остаются на этой странице.';button.disabled=false;}
    finally{form.dataset.sending='false';form.removeAttribute('aria-busy');button.textContent='Отправить заявку';}
  });
  view.contacts=()=>{
    const c=cityData(store.city), pickup=Boolean(c.a);
    return `<section class="screen on"><div class="wrap"><p class="crumbs"><a href="#/">Главная</a> / Контакты</p><div class="contact-intro"><div><p class="sf-kicker">Правильные технологии</p><h1>На связи.<br>Рядом с вашим бизнесом.</h1></div><p>Поможем с подбором материалов, наличием и доставкой. Работаем с частными покупателями, автомойками и студиями.</p></div>
    <div class="contact-primary"><span class="contact-location">${esc(store.city)}</span><h2>${pickup?'Магазин и склад':'Доставка в ваш город'}</h2><a class="contact-phone" href="tel:${c.ph}">${phoneFmt(c.ph)}</a><p>${pickup?'Ростов-на-Дону, ул. Ерёменко, 45':'Доставка транспортной компанией. Местный адрес самовывоза не указан; условия уточнит менеджер.'}</p><p>Пн–Пт 09:00–18:00 · Сб–Вс — выходной</p><a href="mailto:${SHOP_EMAIL}">${SHOP_EMAIL}</a><div class="sf-actions"><a class="btn" href="https://wa.me/79613011919" target="_blank" rel="noopener">Написать в WhatsApp</a><button class="btn ghost" data-open-city>Другой город</button><a class="btn ghost" href="#/contact-request">Отправить заявку</a></div></div>
    <div class="contact-legal"><h3>Реквизиты компании</h3><dl><div><dt>Наименование</dt><dd>ООО «Правильные Технологии»</dd></div><div><dt>ИНН</dt><dd>6165176208</dd></div><div><dt>ОГРН</dt><dd>1126165006593</dd></div><div><dt>Юридический адрес</dt><dd>344038, Ростов-на-Дону, ул. Шеболдаева, 2Д, оф. 10</dd></div><div><dt>Магазин и самовывоз</dt><dd>Ростов-на-Дону, ул. Ерёменко, 45</dd></div></dl></div></div></section>`;
  };
  // Region changes never imply an unverified local street address.
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-open-city]'))openCity();
    if(e.target.closest('[data-city],[data-close]')||e.target.id==='cityModal')document.querySelector('#cityBtn')?.focus();
  });
  document.addEventListener('keydown',e=>{
    const modal=document.querySelector('#cityModal.on');if(!modal)return;
    if(e.key==='Escape'){modal.classList.remove('on');document.querySelector('#cityBtn').focus();}
    if(e.key==='Tab'){const items=[...modal.querySelectorAll('button')],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  },true);
})();
