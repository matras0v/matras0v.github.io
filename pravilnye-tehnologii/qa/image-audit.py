"""Repeatable full-catalog inventory; provenance gaps are not marked verified."""
from pathlib import Path
import json, subprocess, collections, re
from PIL import Image
root=Path(__file__).resolve().parents[1]
js=r'''const fs=require('fs'),vm=require('vm');let c={};vm.createContext(c);vm.runInContext(fs.readFileSync('catalog.js','utf8'),c);const html=fs.readFileSync('index.html','utf8');vm.runInContext('const F={N:0,B:1,PR:2,IMG:3,ST:4,CAT:5,D:6,VOL:7,ART:8};'+html.slice(html.indexOf('const VOL_PAREN'),html.indexOf('/* Один представитель')),c);for(const f of ['shinemate-data.js','zvizzer-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);vm.runInContext('this.out=P.map((p,i)=>({id:i,brand:BR[p[1]],name:p[0],sku:p[8],volume:p[7],image:p[3],variants:VARIANTS[i]||[i]}))',c);console.log(JSON.stringify(c.out));'''
rows=json.loads(subprocess.check_output(['node','-e',js],cwd=root))
images=collections.defaultdict(list)
for r in rows: images[r['image']].append(r['id'])
poor={125:'Amateur tiled-background bottle; exact current official 1 L photo needed',177:'Old canister photograph; current exact 10 L packaging needs review',215:'Set quantity cannot be confirmed from photograph',252:'Dark photo presentation needs review',253:'Dark photo presentation needs review',280:'Amateur brush background',284:'Low-quality older packaging photo',580:'Bagged extension; exact unpacked vendor photo needed',581:'Bagged extension; exact unpacked vendor photo needed'}
for r in rows:
 p=root/'img'/r['image']; flags=[]
 r['available']=p.is_file();r['bytes']=p.stat().st_size if p.exists() else 0
 try:
  if p.suffix=='.svg': r['width']=600;r['height']=600
  else:
   with Image.open(p) as im: r['width'],r['height']=im.size;im.verify()
 except Exception: r['available']=False
 if not r['available']: flags.append('missing_or_invalid_file')
 if not r['sku']: flags.append('missing_article')
 if min(r.get('width',0),r.get('height',0))<400: flags.append('short_side_below_400px')
 if len(images[r['image']])>1: flags.append('shared_image_requires_variant_confirmation')
 r['source']='Legacy catalog import: per-SKU official source not recorded'
 r['sourceTraceable']=False
 if r['image'].startswith('shinemate/'):
  r['source']='Client-owned ShineMate catalog; exact variant photo may be shared';r['sourceTraceable']=True
 if r['id'] in [648,649,650]:
  r['source']='Existing verified ZviZZer 750 ml source mapping';r['sourceTraceable']=True
 if r['id']==152:
  r['source']='https://koch.ru/katalog/moyka-avtomobilya/ruchnoy-shampun/active-foam-1-/';r['sourceTraceable']=True;r['correction']='Official 282001 / 1 kg packshot replaces amateur photo'
 if not r['sourceTraceable']: flags.append('per_sku_source_not_recorded')
 r['contentReview']='Contact-sheet visual screening completed; exact label/variant not independently authenticated'
 if r['id'] in poor: flags.append(poor[r['id']])
 if r['id'] in [327,582]:
  flags.append('exact_photo_missing_wrong_photo_removed');r['contentReview']='Explicit photo-pending notice; exact product photo still required';r['correction']='Removed misleading photo of another object'
 r['reviewReasons']=flags;r['manualReview']=bool(flags)
summary={'recordsChecked':len(rows),'productFamilies':len(set(tuple(sorted(r['variants'])) for r in rows)),'recordsWithArticle':sum(bool(r['sku']) for r in rows),'missingArticles':sum(not r['sku'] for r in rows),'uniqueBrandArticles':len(set((r['brand'],r['sku']) for r in rows if r['sku'])),'validImageReferences':sum(r['available'] for r in rows),'brokenImageReferences':sum(not r['available'] for r in rows),'uniqueImageFiles':len(images),'officialPhotoReplacementsThisPass':1,'misleadingPhotosRemovedThisPass':2,'exactPhotosStillMissing':[327,582],'traceableSourceRecords':sum(r['sourceTraceable'] for r in rows),'perSkuSourceNotRecorded':sum(not r['sourceTraceable'] for r in rows),'manualReviewRecords':sum(r['manualReview'] for r in rows),'lowResolutionRecords':sum(min(r.get('width',0),r.get('height',0))<400 for r in rows),'sharedImageGroups':sum(len(v)>1 for v in images.values())}
report={'summary':summary,'scope':'All actual records inventoried and contact-sheet screened. Valid files do not establish exact SKU/packaging identity. Manual review flags are deliberately conservative. Prices/stock unchanged.','records':rows}
(root/'qa/catalog-image-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False,indent=2))
if summary['brokenImageReferences']: raise SystemExit(1)
