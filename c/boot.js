/* Team dashboard boot: loaded by the small loader file. Takes the newest dashboard code and data, keeps a copy for offline use, then opens the dashboard. */
(async function(){
 var NS=S.ns||"",TEAM=S.team||"E",K=function(k){return NS+k;};
 var J=function(o){return JSON.stringify(o).replace(/</g,"\\u003c");};
 async function fx(p,json){try{var r=await fetch(S.raw(p),{cache:"no-store"});if(r.status===404)return {missing:true};if(!r.ok)return null;return {v:json?await r.json():await r.text()};}catch(e){return null;}}
 S.msg("Memuat versi terbaru…");
 var res=await Promise.all([fx("app.html"),fx("data.json",true),fx("publish.js")]),app=res[0],data=res[1],pub=res[2];
 var appH=null,pubJ=null,d=null;
 if(app&&app.v){appH=app.v;S.idb.put(K("app"),appH);}else{appH=await S.idb.get(K("app"));S.offline=true;}
 if(pub&&pub.v){pubJ=pub.v;S.idb.put(K("pub"),pubJ);}else pubJ=await S.idb.get(K("pub"));
 if(data&&data.v&&data.v.seed){d=data.v;S.idb.put(K("data"),d);}
 else if(!(data&&data.missing)){d=await S.idb.get(K("data"));if(d)S.offline=true;}
 /* data the TL imported from a dashboard file and has not published yet */
 var loc=await S.idb.get(K("localSeed")),isLocal=false;
 if(loc&&loc.seed){if(!d||(loc.at||0)>(d.at||0)){d=loc;isLocal=true;}else S.idb.del(K("localSeed"));}
 if(!appH){S.msg("Dashboard belum bisa dimuat.","Periksa koneksi internet, lalu refresh halaman ini.",true);return;}
 if(!d){firstRun();return;}
 openDash(appH,d,pubJ,isLocal);

 function openDash(h,d,pub,isLocal){
  function put(h,id,val){var o='<script data-o type="application/json" id="'+id+'">',i=h.indexOf(o);if(i<0)throw new Error("seed "+id);var j=h.indexOf("</script>",i);return h.slice(0,i+o.length)+val+h.slice(j);}
  h=put(h,"seed",J(d.seed));h=put(h,"cbseed",J(d.cb==null?null:d.cb));
  var info={team:TEAM,ns:NS,owner:S.owner,repo:S.repo,branch:S.branch,dir:S.dir,sha:S.sha,offline:!!S.offline,local:!!isLocal,at:d.at||0};
  var k=h.indexOf("<head>");if(k<0)throw new Error("head");
  h=h.slice(0,k+6)+"<script>window.__TE_REMOTE="+J(info)+";<\/script>"+h.slice(k+6);
  if(pub){var e=h.lastIndexOf("</body>");if(e>0)h=h.slice(0,e)+"<script>"+pub.replace(/<\/script/gi,"<\\/script")+"<\/script>"+h.slice(e);}
  document.open();document.write(h);document.close();
 }

 function firstRun(){
  S.msg("Data belum di-publish oleh TL.","Minta TL klik Publish di dashboard, lalu refresh halaman ini.",true);
  var box=document.getElementById("teBox"),w=document.createElement("div");
  w.style.cssText="margin-top:18px;padding-top:14px;border-top:1px solid var(--line);font-size:13px";
  w.innerHTML='<div style="margin-bottom:8px"><b>Untuk TL:</b> pilih file dashboard Team "+TEAM+" terakhir (.html) sebagai data awal, lalu Publish dari dashboard.</div><input type="file" id="teSeedIn" accept=".html,text/html"><div id="teSeedMsg" style="margin-top:8px;color:var(--mute)"></div>';
  box.appendChild(w);
  document.getElementById("teSeedIn").onchange=async function(ev){var f=ev.target.files[0],m=document.getElementById("teSeedMsg");if(!f)return;m.textContent="Membaca file…";
   try{var t=await f.text(),doc=new DOMParser().parseFromString(t,"text/html"),s=doc.getElementById("seed"),c=doc.getElementById("cbseed");
    if(!s)throw new Error("Ini bukan file dashboard Team "+TEAM+".");
    var seed=JSON.parse(s.textContent),cb=c?JSON.parse(c.textContent||"null"):null;
    if(seed.view&&seed.view!=="team")throw new Error("Ini laporan individu. Pilih file dashboard tim.");
    if(!seed.priv&&!(seed.data&&seed.data.length))throw new Error("File ini belum berisi data.");
    await S.idb.put(K("localSeed"),{fmt:1,at:seed.savedAt||Date.now(),seed:seed,cb:cb});m.textContent="Data terbaca. Membuka dashboard…";location.reload();}
   catch(e){m.textContent=String(e&&e.message||e);}};
 }
})();
