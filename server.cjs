/* Development-only static server; Vercel uses vercel.json directly. */
const http=require('node:http'), fs=require('node:fs'),path=require('node:path');
const routes=JSON.parse(fs.readFileSync(path.join(__dirname,'vercel.json'))).rewrites;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.avif':'image/avif','.webp':'image/webp','.mp4':'video/mp4','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
 let name;
 try {const url=new URL(req.url,'http://localhost');name=decodeURIComponent(url.pathname);}catch{res.writeHead(400).end();return;}
 name=routes.find(r=>r.source===name)?.destination||name;
 if(name==='/')name='/index.html';
 if(!path.extname(name))name+='.html';
 const target=path.resolve(__dirname,'.'+name);
 if(!target.startsWith(__dirname+path.sep)||!types[path.extname(target).toLowerCase()]){res.writeHead(404).end('Not found');return;}
 fs.stat(target,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404).end('Not found');return;}
  const type=types[path.extname(target).toLowerCase()];
  const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
  if(match){const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;
   if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':'bytes */'+stat.size}).end();return;}
   res.writeHead(206,{'Content-Type':type,'Content-Length':end-start+1,'Content-Range':'bytes '+start+'-'+end+'/'+stat.size,'Accept-Ranges':'bytes'});fs.createReadStream(target,{start,end}).pipe(res);
  }else{res.writeHead(200,{'Content-Type':type,'Content-Length':stat.size,'Accept-Ranges':'bytes'});fs.createReadStream(target).pipe(res);}
 });
}).listen(Number(process.env.PORT)||4173,'0.0.0.0');
