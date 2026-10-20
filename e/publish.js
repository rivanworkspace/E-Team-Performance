/* Team E publish: only present when the dashboard was opened through the loader. TL mode gets a Publish box in the Update data panel. */
(function(){
 var R=window.__TE_REMOTE;if(!R)return;
 var TK="teamE_ghtok_v1",API="https://api.github.com/repos/"+R.owner+"/"+R.repo,PATH=R.dir+"/data.json",MIN=12;
 var TOKEN=null,TOKPW=null,busy=false,lastMsg="";
 var st=document.createElement("style");
 st.textContent=".ghpub{margin:10px 0 4px;padding:12px 14px;border:1px solid var(--line,#d5d9e4);border-radius:12px;background:var(--card,#fff)}.ghpub h4{margin:0 0 6px;font-size:13.5px}.ghpub .dpa{margin-top:8px}.ghpub input[type=password]{min-width:260px;padding:6px 8px;border:1px solid var(--line,#d5d9e4);border-radius:8px;background:transparent;color:inherit}.ghpub ol{margin:6px 0 0 18px;padding:0;font-size:12px}.ghpub details{margin-top:8px;font-size:12px}.ghpub .ok{color:var(--pos,#1a7f4b)}.ghpub .er{color:var(--neg,#c0392b)}.te-off{position:fixed;left:12px;bottom:12px;z-index:50;font-size:12px;padding:5px 10px;border-radius:999px;background:#fff4d6;color:#6b4d0f;border:1px solid #f0d58a}";
 document.head.appendChild(st);
 if(R.offline){var o=document.createElement("div");o.className="te-off";o.textContent="Offline: menampilkan versi terakhir yang tersimpan";document.body.appendChild(o);setTimeout(function(){o.remove();},9000);}
 var tr2=function(a,b){try{return tr(a,b);}catch(e){return a;}};
 function stamp(ms){var d=new Date(ms);return d.toLocaleDateString("id-ID",{day:"numeric",month:"short"})+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
 async function loadTok(){if(TOKEN&&TOKPW===SESSION_PW)return;var s=null;try{s=JSON.parse(localStorage.getItem(TK)||"null");}catch(e){}
  if(!s||!SESSION_PW){if(!TOKEN)TOKEN=null;return;}
  try{var o=await decryptObj(s,SESSION_PW);TOKEN=o.t;TOKPW=SESSION_PW;}catch(e){if(TOKEN&&SESSION_PW){await saveTok(TOKEN);}else TOKEN=null;}}
 async function saveTok(t){TOKEN=t;TOKPW=SESSION_PW;try{localStorage.setItem(TK,JSON.stringify(await encryptObj({t:t},SESSION_PW)));}catch(e){}}
 function el(){return document.getElementById("ghPub");}
 function msg(t,cls){lastMsg=t;var m=document.getElementById("ghMsg");if(m){m.textContent=t;m.className="small"+(cls?" "+cls:"");}}
 function render(){var b=el();if(!b)return;
  var head='<h4>☁️ '+tr2("Publish ke tim","Publish to team")+'</h4><span class="small">'+(R.local?tr2("Data ini belum di-publish. Klik Publish supaya tim bisa membukanya.","This data is not published yet. Click Publish so the team can open it."):tr2("Setelah update data, klik Publish. Tim mendapat data terbaru saat membuka atau refresh dashboard.","After updating data, click Publish. The team gets the newest data when they open or refresh the dashboard."))+(R.at&&!R.local?' · '+tr2("Data saat ini: ","Current data: ")+stamp(R.at):"")+'</span>';
  if(!TOKEN){b.innerHTML=head+'<div class="dpa"><input type="password" id="ghTok" placeholder="'+tr2("Tempel token GitHub","Paste GitHub token")+'" autocomplete="off"><button class="btn primary" id="ghTokSave">'+tr2("Simpan token","Save token")+'</button><span class="small" id="ghMsg"></span></div>'+
   '<details><summary>'+tr2("Cara membuat token (sekali saja)","How to create the token (once)")+'</summary><ol><li>'+tr2('Buka <b>github.com › Settings › Developer settings › Personal access tokens › Fine-grained tokens</b>, klik <b>Generate new token</b>.','Open <b>github.com › Settings › Developer settings › Personal access tokens › Fine-grained tokens</b>, click <b>Generate new token</b>.')+'</li><li>'+tr2('Nama bebas, Expiration maksimal yang tersedia.','Any name, the longest expiration available.')+'</li><li>'+tr2('Repository access: <b>Only select repositories</b> › <b>'+R.repo+'</b>.','Repository access: <b>Only select repositories</b> › <b>'+R.repo+'</b>.')+'</li><li>'+tr2('Permissions › Repository › <b>Contents: Read and write</b>.','Permissions › Repository › <b>Contents: Read and write</b>.')+'</li><li>'+tr2('Generate, salin token, tempel di atas. Token disimpan terkunci password TL di Chrome ini.','Generate, copy the token, paste it above. It is stored locked with the TL password in this Chrome.')+'</li></ol></details>';
   document.getElementById("ghTokSave").onclick=async function(){var v=(document.getElementById("ghTok").value||"").trim();if(!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(v)){msg(tr2("Token tidak valid. Salin ulang dari GitHub.","Invalid token. Copy it again from GitHub."),"er");return;}
    msg(tr2("Memeriksa token…","Checking token…"));var r=await gh("GET",API);if(!r||!r.ok){msg(tr2("Token ditolak GitHub. Pastikan repo "+R.repo+" dipilih saat membuat token.","GitHub rejected the token. Make sure repo "+R.repo+" was selected."),"er");return;}
    var j=await r.json().catch(function(){return {};});if(j.permissions&&j.permissions.push===false){msg(tr2("Token belum punya izin Contents: Read and write.","Token lacks Contents: Read and write."),"er");return;}
    await saveTok(v);render();msg(tr2("Token tersimpan.","Token saved."),"ok");};
   function gh(m,u){return fetch(u,{method:m,headers:{Authorization:"Bearer "+(document.getElementById("ghTok").value||"").trim(),Accept:"application/vnd.github+json"},cache:"no-store"}).catch(function(){return null;});}
   return;}
  b.innerHTML=head+'<div class="dpa"><button class="btn primary" id="ghGo">☁️ Publish</button><button class="btn" id="ghTokDel">'+tr2("Ganti token","Change token")+'</button><span class="small" id="ghMsg"></span></div>';
  if(lastMsg)msg(lastMsg,/^✓/.test(lastMsg)?"ok":"");
  document.getElementById("ghGo").onclick=publish;
  document.getElementById("ghTokDel").onclick=function(){if(!confirm(tr2("Hapus token dari Chrome ini?","Remove the token from this Chrome?")))return;TOKEN=null;try{localStorage.removeItem(TK);}catch(e){}lastMsg="";render();};}
 async function ensure(){var dl=document.getElementById("dlBtn");if(!dl)return;var b=el();
  if(typeof VIEW==="undefined"||VIEW!=="tl"){if(b)b.hidden=true;TOKEN=null;TOKPW=null;return;}
  if(!b){b=document.createElement("div");b.id="ghPub";b.className="ghpub";dl.closest(".dpa").before(b);}
  dl.classList.remove("primary");b.hidden=false;var had=TOKEN,pw=TOKPW;await loadTok();if(!b.innerHTML||had!==TOKEN||pw!==TOKPW)render();}
 /* GitHub git-data API: blob → tree → commit → move branch; retried when the branch moved meanwhile */
 async function api(m,p,body){var r=await fetch(API+p,{method:m,headers:{Authorization:"Bearer "+TOKEN,Accept:"application/vnd.github+json","Content-Type":"application/json"},body:body?JSON.stringify(body):undefined,cache:"no-store"});
  var j=null;try{j=await r.json();}catch(e){}if(!r.ok){var e=new Error((j&&j.message)||("HTTP "+r.status));e.status=r.status;throw e;}return j;}
 async function upload(text,label){
  msg(tr2("Mengirim ke GitHub… (0%)","Sending to GitHub… (0%)"));
  var blob=await api("POST","/git/blobs",{content:b64(_te.encode(text)),encoding:"base64"});
  msg(tr2("Mengirim ke GitHub… (70%)","Sending to GitHub… (70%)"));
  for(var i=0;i<3;i++){
   var ref=await api("GET","/git/ref/heads/"+R.branch),head=ref.object.sha,cm=await api("GET","/git/commits/"+head);
   var tree=await api("POST","/git/trees",{base_tree:cm.tree.sha,tree:[{path:PATH,mode:"100644",type:"blob",sha:blob.sha}]});
   var nc=await api("POST","/git/commits",{message:"Update data "+label,tree:tree.sha,parents:[head]});
   try{await api("PATCH","/git/refs/heads/"+R.branch,{sha:nc.sha});return nc.sha;}catch(e){if(e.status!==422||i===2)throw e;}}}
 function weak(){var w=[];if((SESSION_PW||"").length<MIN)w.push(tr2("password Data TL","TL data password"));
  if(typeof GLK!=="undefined"&&GLK.on()){var g=GLK.gpw||{};GLK.groupsOf(STORE).forEach(function(k){if(!g[k]||g[k].length<MIN)w.push(tr2("password grup ","group password ")+GLK.lbl(k));});}return w;}
 async function publish(){if(busy||!TOKEN)return;var w=weak();
  if(w.length){msg(tr2("Publish ditahan: "+w.join(", ")+" harus minimal "+MIN+" karakter, karena data di GitHub hanya dilindungi password. Ganti di Update data › Pengaturan tim & skema › Password Data TL.","Publish held: "+w.join(", ")+" must be at least "+MIN+" characters, since data on GitHub is protected only by passwords. Change it in Update data › Team & scheme settings › TL data password."),"er");return;}
  busy=true;var bt=document.getElementById("ghGo");if(bt)bt.disabled=true;
  try{msg(tr2("Menyiapkan data…","Preparing data…"));
   var at=vStamp(),ms=[...new Set(STORE.data.map(function(r){return r.month;}))].sort(),note=((document.getElementById("verNote")||{}).value||"").trim();
   var prevV=STORE.versions,prevD=STORE.dirty;
   STORE.versions=(STORE.versions||[]).concat([{at:at,last:ms[ms.length-1],n:STORE.data.length,note:(note||"Publish").slice(0,80)}]).slice(-15);STORE.dirty=false;
   await refreshPriv();var o=publicCopy();o.view="team";o.savedAt=Date.now();delete o.undo;
   var seed=o;if(typeof GLK!=="undefined"&&GLK.on())seed=await GLK.forStore(o);
   if(seed.data&&seed.data.length&&typeof GLK!=="undefined"&&GLK.on())throw new Error("data grup tidak terkunci");
   var payload={fmt:1,at:o.savedAt,seed:seed,cb:(typeof CB_BLOB!=="undefined"?CB_BLOB:null)};
   try{await upload(JSON.stringify(payload),at);}catch(e){STORE.versions=prevV;STORE.dirty=prevD;throw e;}
   R.at=o.savedAt;R.local=false;
   try{var q=indexedDB.open("te_remote",1);q.onupgradeneeded=function(){q.result.createObjectStore("kv");};q.onsuccess=function(){try{var t=q.result.transaction("kv","readwrite"),s=t.objectStore("kv");s.put(payload,"data");s.delete("localSeed");}catch(e){}};}catch(e){}
   await persist();try{renderDirty();}catch(e){}try{renderVersions();}catch(e){}try{renderHeader();}catch(e){}
   render();msg("✓ "+tr2("Terkirim "+stamp(o.savedAt)+". Tim mendapat data ini saat membuka atau refresh dashboard (±1 menit).","Sent "+stamp(o.savedAt)+". The team gets it when they open or refresh the dashboard (about 1 minute)."),"ok");}
  catch(e){var s=e&&e.status,t=String(e&&e.message||e);
   msg(s===401?tr2("Token sudah tidak berlaku. Klik Ganti token.","Token no longer valid. Click Change token."):s===403||s===404?tr2("Token tidak punya izin menulis ke repo "+R.repo+".","Token cannot write to repo "+R.repo+"."):tr2("Gagal mengirim: "+t+". Coba lagi; kalau tetap gagal, pakai Download HTML terbaru sebagai cadangan.","Send failed: "+t+". Try again; if it keeps failing, use Download latest HTML as a backup."),"er");}
  finally{busy=false;var b2=document.getElementById("ghGo");if(b2)b2.disabled=false;}}
 /* the reminder about unsaved changes points to Publish instead of Download */
 if(typeof remItems==="function"){var _ri=remItems;remItems=function(){var it=_ri.apply(this,arguments);it.forEach(function(x){if(x.k&&x.k.indexOf("dirty|")===0){x.t=tr2("Ada perubahan yang belum di-publish ke tim.","There are changes not yet published to the team.");x.act=["ghpub","☁️ Publish"];}});return it;};}
 document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('[data-rem-act="ghpub"]');if(!a)return;var d=document.querySelector(".datap");if(d){d.open=true;}ensure().then(function(){var b=el();if(b)b.scrollIntoView({block:"center",behavior:"smooth"});if(TOKEN)publish();});},true);
 setInterval(ensure,700);ensure();
 try{renderStale();}catch(e){}
})();
