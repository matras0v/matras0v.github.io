/* Offline integrity checks: no network and no mutation of product records. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');const ctx={VARIANTS:{},F:{N:0,B:1,PR:2,IMG:3,ST:4,CAT:5,D:6,VOL:7,ART:8}};vm.createContext(ctx);
for(const f of ['catalog.js','shinemate-data.js','meeting-content.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
vm.runInContext('this.rows=P;this.brands=BR;this.content=MeetingContent;',ctx);
const failures=[],review=[],images=new Map(),cats=['wash','interior','polish','wheels','equipment','supplies','marine'];
ctx.rows.forEach((p,i)=>{const brand=ctx.brands[p[1]],img=p[3];if(!fs.existsSync(path.join(root,'img',img)))failures.push({i,reason:'missing image',img});if(!cats.includes(p[5]))failures.push({i,reason:'unknown category'});if(/Little Joe|^DM(?: |$)/i.test(brand))failures.push({i,reason:'removed brand'});if(!Number.isFinite(p[2])||!Number.isFinite(p[4]))failures.push({i,reason:'invalid price/stock'});if(!p[8])review.push({i,brand,name:p[0],reason:'No article in supplied data; do not replace image by guess'});if(!images.has(img))images.set(img,[]);images.get(img).push(i);});
const duplicates=[...images].filter(([img,ids])=>ids.length>1).map(([img,ids])=>({img,ids,brands:[...new Set(ids.map(i=>ctx.brands[ctx.rows[i][1]]))]}));
for(const d of duplicates)if(d.brands.length>1)review.push({...d,reason:'Shared image across brands; manual source review required'});
for(const [brand,ids] of Object.entries(ctx.content.families))for(const id of ids)if(ctx.brands[ctx.rows[id][1]]!==brand)failures.push({id,reason:'visual brand mismatch'});
for(const [cat,ids] of Object.entries(ctx.content.categoryFamilies))if(ids.length<3)failures.push({cat,reason:'category needs representative range'});
for(const [cat,ids] of Object.entries(ctx.content.categoryFamilies))for(const id of ids)if(ctx.rows[id][5]!==cat)failures.push({id,reason:'visual category mismatch'});
const report={products:ctx.rows.length,uniqueImages:images.size,failures,duplicates,review,scope:'Structural checks and explicit scene mappings. Missing article or source provenance is not exact visual identity verification.'};
fs.writeFileSync(path.join(__dirname,'content-audit.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('/tmp/pt-audit-products.json',JSON.stringify(ctx.rows.map((p,i)=>({i,brand:ctx.brands[p[1]],name:p[0],img:p[3],sku:p[8],volume:p[7]}))));
console.log(JSON.stringify({products:report.products,uniqueImages:images.size,failures,duplicateImages:duplicates.length,crossBrand:duplicates.filter(x=>x.brands.length>1),missingArticles:review.filter(x=>x.i!==undefined).length,families:ctx.content.families,categories:ctx.content.categoryFamilies},null,2));if(failures.length)process.exitCode=1;
