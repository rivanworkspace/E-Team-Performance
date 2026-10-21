/* Team dashboard publish: only present when the dashboard was opened through the loader. TL mode gets a Publish box in the Update data panel. */
(function(){
 var R=window.__TE_REMOTE;if(!R)return;
 var NS=R.ns||"",TEAM=R.team||"E",TK="team"+TEAM+"_ghtok_v1",API="https://api.github.com/repos/"+R.owner+"/"+R.repo,PATH=R.dir+"/data.json",MIN=6,STRONG=12;
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
   /* the same token may already be saved by another team's dashboard in this Chrome: offer to reuse it */
   var others=[];try{for(var i=0;i<localStorage.length;i++){var kk=localStorage.key(i),mm=/^team([A-Z])_ghtok_v1$/.exec(kk||"");if(mm&&mm[1]!==TEAM)others.push(mm[1]);}}catch(e){}
   if(others.length){var row=document.createElement("div");row.className="dpa";others.forEach(function(T2){var bt=document.createElement("button");bt.className="btn";bt.textContent=tr2("🔑 Pakai token dari dashboard Tim "+T2,"🔑 Use the token from the Team "+T2+" dashboard");
     bt.onclick=async function(){var pw=prompt(tr2("Password Data TL dashboard Tim "+T2+":","Team "+T2+" dashboard TL data password:"));if(!pw)return;msg(tr2("Membuka token…","Opening token…"));
      try{var o=await decryptObj(JSON.parse(localStorage.getItem("team"+T2+"_ghtok_v1")),pw);if(!o||!o.t)throw 0;await saveTok(o.t);render();msg(tr2("✓ Token Tim "+T2+" dipakai di sini juga.","✓ Team "+T2+" token is now used here too."),"ok");}
      catch(e){msg(tr2("Password Tim "+T2+" salah.","Wrong Team "+T2+" password."),"er");}};row.appendChild(bt);});
    b.querySelector(".dpa").after(row);}
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
 function needLock(){return typeof GLK!=="undefined"&&typeof STORE!=="undefined"&&STORE&&!STORE.glock&&(STORE.data||[]).length;}
 function goGroups(){var d=document.querySelector(".datap");if(d)d.open=true;setTimeout(function(){var s=document.getElementById("glSet");if(s){s.scrollIntoView({block:"center",behavior:"smooth"});var i=s.querySelector("input[data-glk]");if(i)i.focus();}},150);}
 async function ensure(){if(typeof VIEW!=="undefined"&&VIEW==="tl"&&needLock()){STORE.glock={labels:{}};STORE.dirty=true;try{renderAll();}catch(e){}}if(typeof VIEW!=="undefined"&&VIEW==="tl"&&SESSION_PW&&lastPw!==SESSION_PW){if(lastPw!==null)rememberUpdate();lastPw=SESSION_PW;}var dl=document.getElementById("dlBtn");if(!dl)return;var b=el();
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
  if(typeof GLK!=="undefined"&&GLK.on()){var g=GLK.gpw||{};GLK.groupsOf(STORE).forEach(function(k){if(g[k]&&g[k].length<MIN)w.push(tr2("password grup ","group password ")+GLK.lbl(k));});}return w;}
 async function publish(){if(busy||!TOKEN)return;var w=weak();
  if(w.length){msg(tr2("Publish ditahan: "+w.join(", ")+" harus minimal "+MIN+" karakter. Isi password baru di kotak yang sekarang terbuka, lalu klik Publish lagi.","Publish held: "+w.join(", ")+" must be at least "+MIN+" characters. Enter a new password in the box now open, then click Publish again."),"er");goPw();return;}
  if(typeof GLK==="undefined"||!GLK.on()){msg(tr2("Publish ditahan: data belum dikunci per grup. Isi password tiap grup di kotak 🔐 Password per grup, klik Simpan, lalu Publish lagi.","Publish held: data is not locked per group yet. Fill in each group's password, save, then Publish again."),"er");goGroups();return;}
  var miss=(GLK.missing&&GLK.missing())||[];if(miss.length){msg(tr2("Publish ditahan: password grup "+miss.map(GLK.lbl).join(", ")+" belum diisi. Isi di kotak 🔐 Password per grup, klik Simpan, lalu Publish lagi.","Publish held: no password yet for "+miss.map(GLK.lbl).join(", ")+"."),"er");goGroups();return;}
  busy=true;var bt=document.getElementById("ghGo");if(bt)bt.disabled=true;
  try{msg(tr2("Menyiapkan data…","Preparing data…"));
   var at=vStamp(),ms=[...new Set(STORE.data.map(function(r){return r.month;}))].sort(),note=((document.getElementById("verNote")||{}).value||"").trim();
   var prevV=STORE.versions,prevD=STORE.dirty;
   STORE.versions=(STORE.versions||[]).concat([{at:at,last:ms[ms.length-1],n:STORE.data.length,note:(note||"Publish").slice(0,80)}]).slice(-15);STORE.dirty=false;
   await refreshPriv();var o=publicCopy();o.view="team";o.savedAt=Date.now();delete o.undo;
   var seed=o;if(typeof GLK!=="undefined"&&GLK.on())seed=await GLK.forStore(o);
   if((seed.data&&seed.data.length)||(seed.members&&seed.members.length)||!seed.glock)throw new Error("data belum terkunci per grup — tidak dikirim");
   var payload={fmt:1,at:o.savedAt,seed:seed,cb:(typeof CB_BLOB!=="undefined"&&(SESSION_PW||"").length>=STRONG?CB_BLOB:null)};var cbOut=typeof CB_BLOB!=="undefined"&&CB_BLOB&&!payload.cb;if(cbOut){try{localStorage.setItem("team"+TEAM+"_cb_v1",JSON.stringify({at:Date.now(),blob:CB_BLOB}));}catch(e){}}
   try{await upload(JSON.stringify(payload),at);}catch(e){STORE.versions=prevV;STORE.dirty=prevD;throw e;}
   R.at=o.savedAt;R.local=false;
   try{var q=indexedDB.open("te_remote",1);q.onupgradeneeded=function(){q.result.createObjectStore("kv");};q.onsuccess=function(){try{var t=q.result.transaction("kv","readwrite"),s=t.objectStore("kv");s.put(payload,NS+"data");s.delete(NS+"localSeed");}catch(e){}};}catch(e){}
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
 document.addEventListener("click",function(e){if(!(e.target.closest&&e.target.closest("#glSave")))return;
  var n=0,iv=setInterval(function(){n++;var m=document.getElementById("glMsg");if(m&&/Download HTML terbaru|Download the latest HTML/.test(m.textContent)){clearInterval(iv);m.textContent=tr2("Tersimpan (terkunci di dalam Data TL). Klik ☁️ Publish, lalu bagikan password baru ke grup masing-masing.","Saved (locked inside the TL data). Click ☁️ Publish, then share the new passwords with each group.");}else if(n>60)clearInterval(iv);},150);},true);
 document.addEventListener("click",function(e){if(!(e.target.closest&&e.target.closest("#pwSave")))return;
  var n=0,iv=setInterval(function(){n++;var m=document.getElementById("pwMsg");if(m&&/Download HTML terbaru|Download latest HTML/.test(m.textContent)){clearInterval(iv);m.textContent=tr2("Password diganti. Klik ☁️ Publish supaya berlaku untuk semua.","Password changed. Click ☁️ Publish so it applies everywhere.");}else if(n>60)clearInterval(iv);},150);},true);
 /* remember me: the password is kept in this Chrome, locked with a key that cannot leave this browser */
 var CRK=NS+"cred",CKK="credKey",tried=false,pend=null;
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
  if(tried)return;tried=true;var skip=false;try{skip=sessionStorage.getItem("teNoAuto")==="1";sessionStorage.removeItem("teNoAuto");}catch(e){}if(skip)return;var c=await remLoad();if(!c)return;var sel=document.getElementById("glWho");
  if(![].some.call(sel.options,function(o){return o.value===c.who;})){remForget();return;}
  sel.value=c.who;document.getElementById("glPw").value=c.pw;document.getElementById("glErr").textContent=tr2("Masuk otomatis…","Signing in…");
  var n=0,iv=setInterval(function(){n++;var e=document.getElementById("glErr");if(!document.getElementById("glGate")){clearInterval(iv);}
   else if(e&&/salah|Wrong/.test(e.textContent)){clearInterval(iv);remForget();document.getElementById("glPw").value="";e.textContent=tr2("Password tersimpan sudah tidak berlaku. Masukkan password baru.","The saved password no longer works. Enter the new one.");}
   else if(n>80)clearInterval(iv);},250);
  pend={who:c.who,pw:c.pw,rem:true};f.requestSubmit?f.requestSubmit(go):go.click();}

 /* share links: the same tools opened from a web link (GitHub Pages) instead of a file */
 var PAGES="https://"+R.owner+".github.io/"+R.repo+"/";
 function shareLinks(){var L=[{t:tr2("Dashboard Tim ","Team dashboard ")+TEAM,u:PAGES+R.dir+"/",all:1}];
  {var ms=(STORE.members||[]).filter(Boolean);L.push({t:"Cek Foto Bukti · Tim "+TEAM,u:PAGES+"ocr-"+TEAM.toLowerCase()+"/#p="+encodeURIComponent(ms.join(",")),d:tr2("Nama anggota ikut di dalam link, jadi bagikan hanya ke tim ini.","Member names are inside this link: share it only with this team.")});
  }
  return L;}
 async function copyTxt(t){try{await navigator.clipboard.writeText(t);return true;}catch(e){}var a=document.createElement("textarea");a.value=t;a.style.cssText="position:fixed;left:-9999px";document.body.appendChild(a);a.select();var ok=false;try{ok=document.execCommand("copy");}catch(e){}a.remove();return ok;}
 function openShare(){if(typeof VIEW==="undefined"||VIEW!=="tl")return;var old=document.getElementById("teShare");if(old)old.remove();
  var ov=document.createElement("div");ov.id="teShare";ov.style.cssText="position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.5);display:grid;place-items:center;padding:16px";
  var bx=document.createElement("div");bx.style.cssText="width:min(560px,100%);max-height:90vh;overflow:auto;border-radius:16px;padding:16px 18px;background:linear-gradient(var(--card2),var(--card2)),var(--bg1);border:1px solid var(--line);color:var(--text)";
  bx.innerHTML='<b style="font-size:15px">🔗 '+tr2("Bagikan link","Share link")+'</b><div class="small" style="margin:4px 0 12px">'+tr2("Tim cukup membuka link ini di Chrome, tanpa file. Selalu versi dan data terbaru. Data tetap terkunci password.","The team just opens this link in Chrome, no file needed. Always the newest version and data; still password-locked.")+'</div>'+
   shareLinks().map(function(x,i){return '<div style="margin-bottom:12px"><div style="font-size:13px;font-weight:600;margin-bottom:4px">'+esc(x.t)+'</div><div style="display:flex;gap:6px"><input readonly value="'+esc(x.u)+'" style="flex:1;min-width:0;padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:transparent;color:inherit;font-size:12.5px"><button class="btn primary" data-cp="'+i+'">'+tr2("Salin","Copy")+'</button>'+(navigator.share?'<button class="btn" data-sh="'+i+'">'+tr2("Kirim","Send")+'</button>':'')+'</div>'+(x.d?'<div class="small" style="margin-top:3px">'+esc(x.d)+'</div>':'')+'</div>';}).join("")+
   '<div class="small" id="teShareSt" style="margin:2px 0 10px"></div><button class="btn" id="teShareX">'+tr2("Tutup","Close")+'</button>';
  ov.appendChild(bx);document.body.appendChild(ov);var L=shareLinks(),st=document.getElementById("teShareSt");
  ov.onclick=function(e){if(e.target===ov||e.target.id==="teShareX"){ov.remove();return;}var c=e.target.closest("[data-cp]"),s=e.target.closest("[data-sh]");
   if(c){copyTxt(L[+c.dataset.cp].u).then(function(ok){c.textContent=ok?"✓ "+tr2("Tersalin","Copied"):tr2("Salin manual","Copy manually");setTimeout(function(){c.textContent=tr2("Salin","Copy");},1800);});}
   if(s){navigator.share({title:L[+s.dataset.sh].t,url:L[+s.dataset.sh].u}).catch(function(){});}};
  fetch(PAGES+R.dir+"/",{method:"HEAD",cache:"no-store"}).then(function(r){if(!r.ok)throw 0;}).catch(function(){st.innerHTML="⚠️ "+tr2("Link belum aktif: GitHub Pages belum dinyalakan di repo "+esc(R.repo)+" (Settings › Pages).","Link not active yet: GitHub Pages is not on for "+esc(R.repo)+".");});}
 function shareBtn(){var g=document.querySelector("#drawer .dgrid"),ex=document.getElementById("teShareBtn"),tl=typeof VIEW!=="undefined"&&VIEW==="tl";if(ex&&!tl)ex.remove();if(!tl){var o=document.getElementById("teShare");if(o)o.remove();}
  if(tl&&g&&!document.getElementById("teShareBtn")){var b=document.createElement("button");b.className="dbtn";b.id="teShareBtn";b.textContent="🔗 "+tr2("Bagikan link","Share link");b.onclick=function(){try{openDrawer(false);}catch(e){}openShare();};g.insertBefore(b,g.firstChild);}
  var pb=document.getElementById("ghPub");if(pb&&!pb.hidden&&!document.getElementById("teShareBtn2")){var row=pb.querySelector(".dpa");if(row){var b2=document.createElement("button");b2.className="btn";b2.id="teShareBtn2";b2.textContent="🔗 "+tr2("Link untuk tim","Team links");b2.onclick=openShare;row.appendChild(b2);}}}
 setInterval(shareBtn,800);shareBtn();
 /* "Switch group" / leaving TL data: show the sign-in screen once instead of signing straight back in */
 document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("#glSwitch")){try{sessionStorage.setItem("teNoAuto","1");}catch(x){}}},true);
 if(typeof exitTL==="function"){var _xt=exitTL;exitTL=function(){try{sessionStorage.setItem("teNoAuto","1");}catch(x){}return _xt.apply(this,arguments);};}
 setInterval(gateWatch,300);gateWatch();
 setInterval(ensure,700);ensure();
 try{renderStale();}catch(e){}
})();
