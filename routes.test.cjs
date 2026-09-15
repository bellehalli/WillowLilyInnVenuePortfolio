const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const pages=new Map(fs.readdirSync(root).filter(f=>f.endsWith('.html')).map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]));
const rewrites=new Map(config.rewrites.map(r=>[r.source,r.destination]));
const resolveRoute=route=>{
 const pathname=route.split(/[?#]/)[0];
 if(pathname==='/')return 'index.html';
 const destination=rewrites.get(pathname)||pathname;
 return destination.replace(/^\//,'')+'.html';
};
test('clean URL rewrites use extensionless destinations',()=>{
 assert.equal(config.cleanUrls,true);
 for(const rewrite of config.rewrites){assert.ok(!rewrite.destination.endsWith('.html'),rewrite.source+' has an invalid cleanUrls destination');assert.notEqual(rewrite.source,rewrite.destination);}
});
test('every internal page link resolves and every hash target exists',()=>{
 const failures=[];
 for(const [file,html] of pages){
  for(const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
   const href=match[1];if(/^(https?:|mailto:|tel:)/.test(href))continue;
   const [route,hash]=href.split('#');const target=route?resolveRoute(route):file;
   if(!pages.has(target)){failures.push(`${file}: ${href} → missing ${target}`);continue;}
   if(hash&&!new RegExp(`id=["']${hash}["']`).test(pages.get(target)))failures.push(`${file}: ${href} → missing #${hash}`);
  }
 }
 assert.deepEqual(failures,[]);
});
test('every HTML page loads the shared model, icons and application scripts in order',()=>{
 for(const [file,html] of pages){
  const configScript=html.indexOf('/site-config.js'),seo=html.indexOf('/seo.js');
  const icons=html.indexOf('/icons.js'),model=html.indexOf('/demo-model.js'),app=html.indexOf('/script.js');
  assert.ok(configScript>=0&&configScript<seo,file+' has an incomplete metadata stack');
  assert.ok(icons>=0&&icons<model&&model<app,file+' has an incomplete shared script stack');
 }
});
test('the private venue demonstration is excluded from indexing',()=>{
 const seo=fs.readFileSync(path.join(root,'seo.js'),'utf8');
 assert.match(seo,/path === '\/venue-demo'/);
 assert.match(seo,/noindex,nofollow/);
 assert.match(fs.readFileSync(path.join(root,'robots.txt'),'utf8'),/Disallow: \/venue-demo/);
});
test('metadata covers every clean public route',()=>{
 const seo=fs.readFileSync(path.join(root,'seo.js'),'utf8');
 const sourceForDestination=new Map([...rewrites].map(([source,destination])=>[destination,source]));
 const routes=['/',...pages.keys().filter(file=>file!=='index.html').map(file=>{
  const direct='/'+file.replace(/\.html$/,'');
  return sourceForDestination.get(direct)||direct;
 })];
 for(const route of new Set(routes))assert.ok(seo.includes(`'${route}'`),route+' is missing centralized metadata');
});
test('every referenced local asset exists',()=>{
 const missing=[];
 for(const [file,html] of pages)for(const match of html.matchAll(/(?:src|poster|href)="(\/[^"]+\.(?:css|js|avif|webp|mp4))"/gi)){
  const asset=match[1].slice(1);if(!fs.existsSync(path.join(root,asset)))missing.push(`${file}: ${asset}`);
 }
 assert.deepEqual(missing,[]);
});
