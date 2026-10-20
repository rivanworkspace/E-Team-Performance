/* FU boot: loaded by the small loader. Fetches app code + team config, caches for offline, then opens. */
(async function(){
 var J=function(o){return JSON.stringify(o).replace(/</g,"\\u003c");};
 async function fx(url,json){try{var r=await fetch(url,{cache:"no-store"});if(r.status===404)return {missing:true};if(!r.ok)return null;return {v:json?await r.json():await r.text()};}catch(e){return null;}}
 var dataBase="https://raw.githubusercontent.com/"+S.dataRepo+"/main/data/";
 function dataUrl(p){return dataBase+p+(S.sha?"":"?t="+Date.now());}
 S.msg("Memuat versi terbaru…");
 var res=await Promise.all([fx(S.raw("app.html")),fx(dataUrl("config.json"),true)]);
 var app=res[0],cfg=res[1];
 var appH=null,cfgO=null;
 if(app&&app.v){appH=app.v;S.idb.put("app",appH);}else{appH=await S.idb.get("app");S.offline=true;}
 if(cfg&&cfg.v){cfgO=cfg.v;S.idb.put("cfg",cfgO);}
 else if(!(cfg&&cfg.missing)){cfgO=await S.idb.get("cfg");if(cfgO)S.offline=true;}
 if(!appH){S.msg("Alat belum bisa dimuat.","Periksa koneksi internet lalu refresh.",true);return;}
 var h=appH;
 function put(id,val){var o='<script data-o type="application/json" id="'+id+'">',i=h.indexOf(o);if(i<0)throw new Error("seed "+id);var j=h.indexOf("</script>",i);h=h.slice(0,i+o.length)+val+h.slice(j);}
 put("cfgseed",J(cfgO==null?null:cfgO));put("noteseed","{}");
 var ver=(appH.match(/app-version" content="([^"]*)"/)||[])[1]||"0.0.0";
 var info={owner:S.owner,repo:S.repo,branch:S.branch,dir:S.dir,dataRepo:S.dataRepo,sha:S.sha,offline:!!S.offline,ver:ver,dataBase:dataBase};
 var k=h.indexOf("<head>");h=h.slice(0,k+6)+"<script>window.__FU_REMOTE="+J(info)+";window.__FU_TEAM={leader:\"Rivan\",members:[\"Atika\",\"Darwin\",\"Dilah\",\"Jusep\",\"Dimas\",\"Duta\"]};<\/script>"+h.slice(k+6);
 document.open();document.write(h);document.close();
})();
