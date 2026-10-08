/* Client meeting: presentation only. Catalog records, prices and stock are not imported. */
const MeetingContent = (() => {
  const ids = (brand, re, n=1) => P.map((p,i)=>i).filter(i=>BR[P[i][F.B]]===brand && re.test(P[i][F.N])).slice(0,n);
  const koch=[1,117,222,258,...ids('Koch Chemie',/^Marine Protective/),...ids('Koch Chemie',/^Boat Wash/)];
  const shine=['EP820','EX620','EB213','EP804','ES700','EB351'].flatMap(n=>ids('ShineMate',new RegExp('^'+n)));
  const colour=[431,432,434,435];
  const zvizzer=[...ids('Zvizzer',/^HC4000/),...ids('Zvizzer',/^MC3000/),...ids('Zvizzer',/^FC2000/),55,57];
  const autech=[324,87,339,268];
  const families={'Koch Chemie':koch,'ShineMate':shine,'ColourLock':colour,'Zvizzer':zvizzer,'AuTech':autech};
  const official=['Koch Chemie','ShineMate','Space Cosmetics','ColourLock'];
  const labels={'ColourLock':'COLOURLOCK','Zvizzer':'ZviZZer'};
  const stories={
    'Koch Chemie':{title:'От мойки до финишной обработки',text:'Средства для кузова и салона, полировальные пасты и линейка Marine. Подбирайте состав по поверхности и этапу работы — от предварительной очистки до ухода после полировки.',tags:['Мойка','Полировка','Интерьер','Marine']},
    'ShineMate':{title:'Инструмент для каждой зоны кузова',text:'Роторные и эксцентриковые машинки, аккумуляторные модели, компактный инструмент и шлифовальное оборудование. Ход эксцентрика, размер подложки и комплектация указаны в карточках.',tags:['Роторные','Эксцентриковые','Аккумуляторные','Мини-инструмент']},
    'Space Cosmetics':{title:'Экстерьер, интерьер и защита',text:'Четыре направления бренда: уход за кузовом, интерьер, защитные покрытия и аксессуары. Подбор конкретных средств, цены и наличие уточнит менеджер.',tags:['Экстерьер','Интерьер','Покрытия','Аксессуары']},
    'ColourLock':{title:'Уход и восстановление кожи',text:'Материалы для ухода за кожей и восстановления цвета. В каталоге — составы разных оттенков и принадлежности для работы. Перед выбором уточните тип кожи и задачу обработки.',tags:['Кожа','Уход','Восстановление цвета']},
    'Zvizzer':{title:'Пасты и круги для каждого этапа',text:'Полировальные пасты HC4000, MC3000 и FC2000, поролоновые, меховые и микрофибровые круги. Подберём материал для коррекции и финишной обработки. Цены и наличие паст уточнит менеджер.',tags:['Пасты','Thermo Pads','Thermo Wool']},
    'AuTech':{title:'Оснастка и материалы для мастерской',text:'Полировальные круги, оборудование, микрофибра и принадлежности для ухода. Подбирайте размер, крепление и материал под свою задачу.',tags:['Круги','Инструмент','Микрофибра']}
  };
  const categoryFamilies={polish:[1,55,87],wash:[117,503,504],interior:[222,426,...ids('Gyeon',/^Q2M LeatherCleaner/)],wheels:[258,269,...ids('Gyeon',/^Q2M Glass /)],equipment:shine.slice(0,4),supplies:[339,350,351,352],marine:[489,490,496,478]};
  function pCat(i,c){return P[i][F.CAT]===c;}
  // Category compositions must contain only products assigned to that actual category.
  for(const c of Object.keys(categoryFamilies))categoryFamilies[c]=categoryFamilies[c].filter(i=>P[i]&&pCat(i,c));
  for(const [brand,list] of Object.entries(families))for(const i of list)if(BR[P[i][F.B]]!==brand)throw Error('Brand media mismatch '+brand+'/'+i);
  const descriptions={324:'Аккумуляторная полировальная машинка AuTech iBrid Pro Line в комплектации Extended Kit 12V и 220V. Комплектацию уточните перед заказом.',434:'Комплект COLOURLOCK LZ-224600 для смешивания красок.'};
  return {descriptions,families,official,labels,stories,categoryFamilies,daily:[125,2,206,258]};
})();
