const C='kondate-v3',A=['./','index.html','manifest.webmanifest','icon-180.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// ネットワーク優先。ただし電波が弱くて3秒以内に応答がなければ、保存済みの画面をすぐ開く
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(new Promise(res=>{
    let done=false;
    const fromCache=()=>caches.match(e.request).then(m=>{if(m&&!done){done=true;res(m)}return m});
    const t=setTimeout(fromCache,3000);
    fetch(e.request).then(r=>{
      clearTimeout(t);
      if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}
      if(!done){done=true;res(r)}
    }).catch(()=>{clearTimeout(t);fromCache().then(m=>{if(!m&&!done){done=true;res(Response.error())}})});
  }));
});
