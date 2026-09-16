const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const pages=fs.readdirSync(root).filter(file=>file.endsWith('.html')).map(file=>[file,fs.readFileSync(path.join(root,file),'utf8')]);

test('every page has the essential document and keyboard landmarks',()=>{
 for(const [file,html] of pages){
  assert.match(html,/<html\b[^>]*lang="en"/i,file+' is missing a language');
  assert.match(html,/<meta\b[^>]*name="viewport"/i,file+' is missing a viewport');
  assert.match(html,/<title>[^<]+<\/title>/i,file+' is missing a title');
  assert.match(html,/<meta\b[^>]*name="description"/i,file+' is missing a description');
  assert.match(html,/<a\b[^>]*class="skip-link"[^>]*href="#(?:main|dashboard-main)"/i,file+' is missing a working skip link');
  assert.match(html,/<main\b[^>]*id="(?:main|dashboard-main)"/i,file+' is missing the main landmark');
 }
});

test('every image has an explicit alternative-text decision',()=>{
 const failures=[];
 for(const [file,html] of pages)for(const image of html.matchAll(/<img\b[^>]*>/gi))if(!/\balt="[^"]*"/i.test(image[0]))failures.push(file+': '+image[0]);
 assert.deepEqual(failures,[]);
});

test('buttons declare their behavior and page ids are unique',()=>{
 const failures=[];
 for(const [file,html] of pages){
  for(const button of html.matchAll(/<button\b[^>]*>/gi))if(!/\btype="(?:button|submit|reset)"/i.test(button[0]))failures.push(file+': button missing type');
  const ids=[...html.matchAll(/\bid="([^"]+)"/gi)].map(match=>match[1]);
  const duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);
  if(duplicates.length)failures.push(file+': duplicate ids '+[...new Set(duplicates)].join(', '));
 }
 assert.deepEqual(failures,[]);
});

test('motion and cinematic media retain user controls',()=>{
 const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
 const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.match(home,/<video\b[^>]*muted[^>]*playsinline[^>]*preload="none"[^>]*poster=/i);
 assert.match(fs.readFileSync(path.join(root,'script.js'),'utf8'),/video-control/);
});
