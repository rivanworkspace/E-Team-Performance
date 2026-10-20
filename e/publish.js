/* Team E publish: only present when the dashboard was opened through the loader. TL mode gets a Publish box in the Update data panel. */
(function(){
 var R=window.__TE_REMOTE;if(!R)return;
 var TK="teamE_ghtok_v1",API="https://api.github.com/repos/"+R.owner+"/"+R.repo,PATH=R.dir+"/data.json",MIN=6,STRONG=12;
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
  b.innerHTML=head+'<div class="dpa"><button class="btn primary" id="ghGo">☁️ Publish</button><button class="btn" id="ghPwGo">🔑 '+tr2("Ganti password TL","Change TL password")+'</button><button class="btn" id="ghTokDel">'+tr2("Ganti token","Change token")+'</button><span class="small" id="ghMsg"></span></div>';
  if(lastMsg)msg(lastMsg,/^✓/.test(lastMsg)?"ok":"");
  document.getElementById("ghGo").onclick=publish;document.getElementById("ghPwGo").onclick=goPw;
  document.getElementById("ghTokDel").onclick=function(){if(!confirm(tr2("Hapus token dari Chrome ini?","Remove the token from this Chrome?")))return;TOKEN=null;try{localStorage.removeItem(TK);}catch(e){}lastMsg="";render();};}
 var lastPw=null;
 async function ensure(){if(typeof VIEW!=="undefined"&&VIEW==="tl"&&SESSION_PW&&lastPw!==SESSION_PW){if(lastPw!==null)rememberUpdate();lastPw=SESSION_PW;}var dl=document.getElementById("dlBtn");if(!dl)return;var b=el();
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
  if(w.length){msg(tr2("Publish ditahan: "+w.join(", ")+" harus minimal "+MIN+" karakter. Isi password baru di kotak yang sekarang terbuka, lalu klik Publish lagi.","Publish held: "+w.join(", ")+" must be at least "+MIN+" characters. Enter a new password in the box now open, then click Publish again."),"er");goPw();return;}
  busy=true;var bt=document.getElementById("ghGo");if(bt)bt.disabled=true;
  try{msg(tr2("Menyiapkan data…","Preparing data…"));
   var at=vStamp(),ms=[...new Set(STORE.data.map(function(r){return r.month;}))].sort(),note=((document.getElementById("verNote")||{}).value||"").trim();
   var prevV=STORE.versions,prevD=STORE.dirty;
   STORE.versions=(STORE.versions||[]).concat([{at:at,last:ms[ms.length-1],n:STORE.data.length,note:(note||"Publish").slice(0,80)}]).slice(-15);STORE.dirty=false;
   await refreshPriv();var o=publicCopy();o.view="team";o.savedAt=Date.now();delete o.undo;
   var seed=o;if(typeof GLK!=="undefined"&&GLK.on())seed=await GLK.forStore(o);
   if(seed.data&&seed.data.length&&typeof GLK!=="undefined"&&GLK.on())throw new Error("data grup tidak terkunci");
   var payload={fmt:1,at:o.savedAt,seed:seed,cb:(typeof CB_BLOB!=="undefined"&&(SESSION_PW||"").length>=STRONG?CB_BLOB:null)};var cbOut=typeof CB_BLOB!=="undefined"&&CB_BLOB&&!payload.cb;if(cbOut){try{localStorage.setItem("teamE_cb_v1",JSON.stringify({at:Date.now(),blob:CB_BLOB}));}catch(e){}}
   try{await upload(JSON.stringify(payload),at);}catch(e){STORE.versions=prevV;STORE.dirty=prevD;throw e;}
   R.at=o.savedAt;R.local=false;
   try{var q=indexedDB.open("te_remote",1);q.onupgradeneeded=function(){q.result.createObjectStore("kv");};q.onsuccess=function(){try{var t=q.result.transaction("kv","readwrite"),s=t.objectStore("kv");s.put(payload,"data");s.delete("localSeed");}catch(e){}};}catch(e){}
   await persist();try{renderDirty();}catch(e){}try{renderVersions();}catch(e){}try{renderHeader();}catch(e){}
   render();msg("✓ "+tr2("Terkirim "+stamp(o.savedAt)+". Tim mendapat data ini saat membuka atau refresh dashboard (±1 menit).","Sent "+stamp(o.savedAt)+". The team gets it when they open or refresh the dashboard (about 1 minute).")+(cbOut?" "+tr2("Data tab Kontak (nama & SID customer) tidak ikut dikirim karena password TL kurang dari "+STRONG+" karakter; tetap ada di Chrome ini.","Contacts tab data (customer names & SIDs) was not sent because the TL password is under "+STRONG+" characters; it stays in this Chrome."):""),"ok");}
  catch(e){var s=e&&e.status,t=String(e&&e.message||e);
   msg(s===401?tr2("Token sudah tidak berlaku. Klik Ganti token.","Token no longer valid. Click Change token."):s===403||s===404?tr2("Token tidak punya izin menulis ke repo "+R.repo+".","Token cannot write to repo "+R.repo+"."):tr2("Gagal mengirim: "+t+". Coba lagi; kalau tetap gagal, pakai Download HTML terbaru sebagai cadangan.","Send failed: "+t+". Try again; if it keeps failing, use Download latest HTML as a backup."),"er");}
  finally{busy=false;var b2=document.getElementById("ghGo");if(b2)b2.disabled=false;}}
 /* the reminder about unsaved changes points to Publish instead of Download */
 if(typeof remItems==="function"){var _ri=remItems;remItems=function(){var it=_ri.apply(this,arguments);it.forEach(function(x){if(x.k&&x.k.indexOf("dirty|")===0){x.t=tr2("Ada perubahan yang belum di-publish ke tim.","There are changes not yet published to the team.");x.act=["ghpub","☁️ Publish"];}});return it;};}
 document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('[data-rem-act="ghpub"]');if(!a)return;var d=document.querySelector(".datap");if(d){d.open=true;}ensure().then(function(){var b=el();if(b)b.scrollIntoView({block:"center",behavior:"smooth"});if(TOKEN)publish();});},true);

 /* open the TL password form (it sits inside the collapsed settings section) */
 function goPw(){var d=document.querySelector(".datap");if(d)d.open=true;var st=document.querySelector("details.sets");if(st)st.open=true;
  setTimeout(function(){var i=document.getElementById("pw1");if(i){i.scrollIntoView({block:"center",behavior:"smooth"});i.focus();}},120);}
 document.addEventListener("click",function(e){if(!(e.target.closest&&e.target.closest("#pwSave")))return;
  var n=0,iv=setInterval(function(){n++;var m=document.getElementById("pwMsg");if(m&&/Download HTML terbaru|Download latest HTML/.test(m.textContent)){clearInterval(iv);m.textContent=tr2("Password diganti. Klik ☁️ Publish supaya berlaku untuk semua.","Password changed. Click ☁️ Publish so it applies everywhere.");}else if(n>60)clearInterval(iv);},150);},true);
 /* remember me: the password is kept in this Chrome, locked with a key that cannot leave this browser */
 var CRK="cred",CKK="credKey",tried=false,pend=null;
 function idb(){return new Promise(function(res){try{var q=indexedDB.open("te_remote",1);q.onupgradeneeded=function(){q.result.createObjectStore("kv");};q.onsuccess=function(){res(q.result);};q.onerror=function(){res(null);};}catch(e){res(null);}});}
 async function kv(op,k,v){var d=await idb();if(!d)return null;return new Promise(function(res){try{var t=d.transaction("kv",op==="get"?"readonly":"readwrite"),s=t.objectStore("kv"),q=op==="get"?s.get(k):op==="put"?s.put(v,k):s.delete(k);q.onsuccess=function(){res(op==="get"?q.result:null);};q.onerror=function(){res(null);};}catch(e){res(null);}});}
 async function devKey(){var k=await kv("get",CKK);if(!k){k=await crypto.subtle.generateKey({name:"AES-GCM",length:256},false,["encrypt","decrypt"]);await kv("put",CKK,k);}return k;}
 async function remSave(who,pw){try{var k=await devKey(),iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},k,_te.encode(pw));await kv("put",CRK,{who:who,iv:iv,ct:new Uint8Array(ct)});}catch(e){}}
 async function remLoad(){try{var c=await kv("get",CRK);if(!c)return null;var k=await kv("get",CKK);if(!k)return null;var pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:c.iv},k,c.ct);return {who:c.who,pw:_td.decode(pt)};}catch(e){return null;}}
 function remForget(){kv("del",CRK);}
 async function rememberUpdate(){var c=await remLoad();if(c&&c.who==="__tl"&&SESSION_PW&&c.pw!==SESSION_PW)remSave("__tl",SESSION_PW);}
 async function gateWatch(){var g=document.getElementById("glGate");if(!g)return;var f=g.querySelector("form");if(!f||f.dataset.rem)return;f.dataset.rem="1";
  var go=document.getElementById("glGo"),lb=document.createElement("label");lb.className="te-rem";lb.style.cssText="display:flex;flex-direction:row;align-items:center;gap:6px;font-size:12.5px;margin:2px 0 4px";
  lb.innerHTML='<input type="checkbox" id="teRem" checked style="width:auto;margin:0"> '+tr2("Ingat password di Chrome ini","Remember password in this Chrome");go.before(lb);
  f.addEventListener("submit",function(){pend={who:document.getElementById("glWho").value,pw:document.getElementById("glPw").value,rem:document.getElementById("teRem").checked};
   var n=0,iv=setInterval(function(){n++;if(!document.getElementById("glGate")){clearInterval(iv);if(pend){if(pend.rem)remSave(pend.who,pend.pw);else remForget();pend=null;}}
    else if(n>40||(document.getElementById("glErr")||{}).textContent.indexOf("salah")>=0||(document.getElementById("glErr")||{}).textContent.indexOf("Wrong")>=0){clearInterval(iv);pend=null;}},250);},true);
  if(tried)return;tried=true;var c=await remLoad();if(!c)return;var sel=document.getElementById("glWho");
  if(![].some.call(sel.options,function(o){return o.value===c.who;})){remForget();return;}
  sel.value=c.who;document.getElementById("glPw").value=c.pw;document.getElementById("glErr").textContent=tr2("Masuk otomatis…","Signing in…");
  var n=0,iv=setInterval(function(){n++;var e=document.getElementById("glErr");if(!document.getElementById("glGate")){clearInterval(iv);}
   else if(e&&/salah|Wrong/.test(e.textContent)){clearInterval(iv);remForget();document.getElementById("glPw").value="";e.textContent=tr2("Password tersimpan sudah tidak berlaku. Masukkan password baru.","The saved password no longer works. Enter the new one.");}
   else if(n>80)clearInterval(iv);},250);
  pend={who:c.who,pw:c.pw,rem:true};f.requestSubmit?f.requestSubmit(go):go.click();}
 setInterval(gateWatch,300);gateWatch();
 setInterval(ensure,700);ensure();
 try{renderStale();}catch(e){}
})();
