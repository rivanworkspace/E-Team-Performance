/* Cek Foto Bukti boot: newest tool code every time; the heavy reading engine is downloaded once and kept in this Chrome. */
(async function(){
 var NS=S.ns||"",K=function(k){return NS+k;};
 async function txt(u){try{var r=await fetch(u,{cache:"no-store"});if(!r.ok)return null;return await r.text();}catch(e){return null;}}
 S.msg("Memuat versi terbaru…");
 var app=await txt(S.raw("app.html"));
 if(app)await S.idb.put(K("app"),app);else{app=await S.idb.get(K("app"));S.offline=true;}
 if(!app){S.msg("Alat belum bisa dimuat.","Periksa koneksi internet, lalu refresh halaman ini. Setelah sekali berhasil dibuka, alat ini juga bisa dibuka tanpa internet.",true);return;}
 var RE=/\/\*@A:([A-Za-z0-9._-]+)@\*\//g,names=[],m;while((m=RE.exec(app))){if(names.indexOf(m[1])<0)names.push(m[1]);}
 var base="https://raw.githubusercontent.com/"+S.owner+"/"+S.repo+"/"+(S.sha||S.branch)+"/ocr/assets/",got={},need=[];
 for(var i=0;i<names.length;i++){var v=await S.idb.get("asset:"+names[i]);if(v!=null)got[names[i]]=v;else need.push(names[i]);}
 for(var j=0;j<need.length;j++){
  S.msg("Mengunduh mesin pembaca foto ("+(j+1)+"/"+need.length+")…","Hanya sekali di Chrome ini, sekitar 27 MB. Berikutnya alat langsung terbuka.");
  var w=await txt(base+need[j]);
  if(w==null){S.msg("Mesin pembaca foto belum bisa diunduh.","Periksa koneksi internet, lalu refresh halaman ini.",true);return;}
  got[need[j]]=w;await S.idb.put("asset:"+need[j],w);}
 S.msg("Membuka alat…");
 var out="",last=0;RE.lastIndex=0;while((m=RE.exec(app))){out+=app.slice(last,m.index)+got[m[1]];last=m.index+m[0].length;}out+=app.slice(last);
 var k=out.indexOf("<head>");if(k>=0)out=out.slice(0,k+6)+"<script>window.__OCR_REMOTE="+JSON.stringify({team:S.team,sha:S.sha,offline:!!S.offline}).replace(/</g,"\\u003c")+";window.__OCR_PEOPLE="+JSON.stringify(S.people||[]).replace(/</g,"\\u003c")+";<\/script>"+out.slice(k+6);
 document.open();document.write(out);document.close();
})();
