/* ==================== Chapitres supplémentaires ==================== */
const $v = (el, s) => parseFloat(String(el.querySelector(s).value).replace(',', '.'));
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; }
const mod = (a,n) => ((a%n)+n)%n;
function factorize(n){ const f=[]; let d=2; while(n>1 && d*d<=n){ while(n%d===0){ f.push(d); n/=d; } d++; } if(n>1) f.push(n); return f; }
function factStr(n){ if(n<2) return String(n); const m={}; factorize(n).forEach(p=>m[p]=(m[p]||0)+1); return Object.entries(m).map(([p,e])=>e>1?`${p}<sup>${e}</sup>`:p).join(' × '); }
function frac(n,d){ if(d<0){n=-n;d=-d;} const g=gcd(n,d)||1; n/=g; d/=g; return d===1?String(n):`${n}/${d}`; }
const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function arrowDefs(id, col){ return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker></defs>`; }
function matHTML(M, opts={}){ return `<table class="tt mat">${M.map((r,i)=>`<tr>${opts.rowLbl?`<th>${opts.rowLbl[i]}</th>`:''}${r.map((v,j)=>`<td data-i="${i}" data-j="${j}" class="${opts.cls?opts.cls(i,j):''}">${v}</td>`).join('')}</tr>`).join('')}${opts.colLbl?'':''}</table>`; }
function matMul(A,B){ return A.map((r,i)=>B[0].map((_,j)=>r.reduce((s,_,k)=>s+A[i][k]*B[k][j],0))); }
// probabilités
function erf(x){ const s=Math.sign(x); x=Math.abs(x); const t=1/(1+0.3275911*x); const y=1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x); return s*y; }
const Phi = (x,m=0,s=1) => 0.5*(1+erf((x-m)/(s*Math.SQRT2)));
let LF=[0]; function logFact(n){ for(let i=LF.length;i<=n;i++) LF[i]=LF[i-1]+Math.log(i); return LF[n]; }
function binPmf(n,p,k){ if(k<0||k>n) return 0; if(p===0) return k===0?1:0; if(p===1) return k===n?1:0; return Math.exp(logFact(n)-logFact(k)-logFact(n-k)+k*Math.log(p)+(n-k)*Math.log(1-p)); }
function binCdf(n,p,k){ let s=0; for(let i=0;i<=Math.min(k,n);i++) s+=binPmf(n,p,i); return Math.min(1,s); }

/* ---------- Numération & arithmétique ---------- */
const NUM = [
{ title:"Les bases 2, 10 et 16", html:`
  <p>En base 10, chaque chiffre est multiplié par une puissance de 10 : 347 = 3×10² + 4×10¹ + 7×10⁰. Un ordinateur travaille en <b>base 2</b> (binaire, chiffres 0 et 1 = <b>bits</b>), et on écrit souvent les octets en <b>base 16</b> (hexadécimal, chiffres 0–9 puis A=10, …, F=15).</p>
  <div class="def"><b>Méthodes</b>• <b>Base 10 → base 2</b> : divisions successives par 2, on lit les restes <b>de bas en haut</b>.<br>• <b>Base 2 → base 10</b> : on additionne les puissances de 2 des bits à 1. Ex. 1011₂ = 8 + 2 + 1 = 11.<br>• <b>Base 2 ↔ base 16</b> : on groupe les bits <b>par 4</b> en partant de la droite, chaque groupe donne un chiffre hexadécimal.</div>
  <div class="lab"><div class="labt">🧪 Convertisseur commenté</div><div class="row"><label>Nombre <input type="text" class="nin" value="200" style="width:150px"></label><label>écrit en base <select class="nb"><option>10</option><option>2</option><option>16</option></select></label></div><div class="nout"></div></div>
  <p class="muted">À retenir : sur n bits on code 2ⁿ valeurs, de 0 à 2ⁿ − 1. Un octet (8 bits) va donc de 0 à 255, soit de 00 à FF en hexadécimal.</p>`,
  init(el){ const inp=el.querySelector('.nin'), sel=el.querySelector('.nb'), out=el.querySelector('.nout');
    const paint=()=>{ const b=+sel.value, s=inp.value.trim().toUpperCase(); const ok={2:/^[01]+$/,10:/^\d+$/,16:/^[0-9A-F]+$/}[b].test(s); const n=ok?parseInt(s,b):NaN;
      if(!ok||n>1048575){ out.innerHTML=`<p><i>Entre un entier positif valide en base ${b} (au plus 1 048 575).</i></p>`; return; }
      const bin=n.toString(2), hex=n.toString(16).toUpperCase(); const pad=bin.padStart(Math.ceil(bin.length/4)*4,'0'); const groups=pad.match(/.{4}/g);
      let h=`<div class="out"><div><b>Base 10</b><span>${n}</span></div><div><b>Base 2</b><span>${groups.join(' ')}</span></div><div><b>Base 16</b><span>${hex}</span></div></div>`;
      if(b===10){ let x=n, rows=[]; if(x===0) rows.push([0,0,0]); while(x>0){ rows.push([x,Math.floor(x/2),x%2]); x=Math.floor(x/2); }
        h+=`<p><b>Divisions successives par 2 :</b></p><table class="tt">${rows.map(r=>`<tr><td>${r[0]} = 2 × ${r[1]} + <b>${r[2]}</b></td></tr>`).join('')}</table><p>On lit les restes de bas en haut : <b class="mono">${bin}</b>.</p>`; }
      else { const digits=s.split('').reverse(); h+=`<p><b>Développement :</b> <span class="mono">${digits.map((d,k)=>({d,k})).filter(o=>o.d!=='0').reverse().map(o=>`${parseInt(o.d,16)}×${b}<sup>${o.k}</sup>`).join(' + ')||'0'} = <b>${n}</b></span></p>`; }
      h+=`<p><b>Groupes de 4 bits → hexadécimal :</b> ${groups.map(g=>`<span class="pill">${g} → ${parseInt(g,2).toString(16).toUpperCase()}</span>`).join(' ')}</p>`;
      out.innerHTML=h; };
    inp.oninput=paint; sel.onchange=paint; paint(); },
  check:{q:"Combien vaut 1011 (base 2) en base 10 ?", opts:["11","13","1011","9"], a:0, ex:"1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11."}
},
{ title:"Division euclidienne et congruences", html:`
  <div class="def"><b>Division euclidienne</b>Pour tout entier a et tout entier n &gt; 0, il existe un unique couple (q ; r) tel que <span class="big">a = n × q + r</span> avec <b>0 ≤ r &lt; n</b>. q est le quotient, r le reste.</div>
  <div class="def"><b>Congruence</b>a ≡ b [n] (« a congru à b modulo n ») si a et b ont <b>le même reste</b> dans la division par n, ce qui revient à dire que <b>n divise a − b</b>.</div>
  <p>Propriété clé : les congruences sont compatibles avec + et ×. Si a ≡ a' [n] et b ≡ b' [n], alors a + b ≡ a' + b' [n] et ab ≡ a'b' [n]. C'est ce qui permet de calculer « avec les restes » en cryptographie et dans les codes de contrôle.</p>
  <div class="lab"><div class="labt">🧪 Calculateur</div><div class="row"><label>a = <input type="number" class="ca" value="2026" style="width:110px"></label><label>b = <input type="number" class="cb" value="12" style="width:110px"></label><label>n = <input type="number" class="cn" value="7" min="1" style="width:80px"></label></div><div class="cout" style="margin-top:10px"></div></div>
  <p class="muted">Exemple : quel jour de la semaine serons-nous dans 2026 jours ? 2026 = 7 × 289 + 3, donc 2026 ≡ 3 [7] : ce sera le même jour que dans 3 jours.</p>`,
  init(el){ const paint=()=>{ const a=Math.round($v(el,'.ca')), b=Math.round($v(el,'.cb')), n=Math.round($v(el,'.cn')); const o=el.querySelector('.cout');
      if(!(n>0)||!Number.isFinite(a)||!Number.isFinite(b)){ o.innerHTML='<i>Choisis n ≥ 1.</i>'; return; }
      const qa=Math.floor(a/n), ra=mod(a,n), qb=Math.floor(b/n), rb=mod(b,n);
      o.innerHTML=`<div class="mono big" style="font-size:17px">${a} = ${n} × ${qa} + <b>${ra}</b><br>${b} = ${n} × ${qb} + <b>${rb}</b></div><p>${ra===rb?`✅ Même reste ${ra} : <b>${a} ≡ ${b} [${n}]</b>. D'ailleurs ${a} − ${b} = ${a-b} = ${n} × ${(a-b)/n}.`:`❌ Restes différents (${ra} et ${rb}) : ${a} et ${b} ne sont pas congrus modulo ${n}. (${a} − ${b} = ${a-b} n'est pas divisible par ${n}.)`}</p>`; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"À quoi est congru 23 modulo 5 ?", opts:["3","4","2","5"], a:0, ex:"23 = 5 × 4 + 3, donc 23 ≡ 3 [5]."}
},
{ title:"PGCD, algorithme d'Euclide, nombres premiers", html:`
  <div class="def"><b>Nombres premiers</b>Un entier p ≥ 2 est <b>premier</b> s'il n'a que deux diviseurs : 1 et lui-même (2, 3, 5, 7, 11, 13…). Tout entier ≥ 2 se décompose de façon unique en produit de facteurs premiers.</div>
  <div class="def"><b>Algorithme d'Euclide</b>Si a = bq + r, alors <b>PGCD(a ; b) = PGCD(b ; r)</b>. On recommence jusqu'à obtenir un reste nul : le PGCD est le <b>dernier reste non nul</b>.<br>a et b sont <b>premiers entre eux</b> lorsque PGCD(a ; b) = 1.</div>
  <div class="lab"><div class="labt">🧪 Euclide pas à pas</div><div class="row"><label>a = <input type="number" class="ea" value="252" min="1" style="width:110px"></label><label>b = <input type="number" class="eb" value="198" min="1" style="width:110px"></label></div><div class="eout" style="margin-top:10px"></div></div>`,
  init(el){ const paint=()=>{ let a=Math.round($v(el,'.ea')), b=Math.round($v(el,'.eb')); const o=el.querySelector('.eout'); if(!(a>0&&b>0)||a>1e9||b>1e9){ o.innerHTML='<i>Entre deux entiers strictement positifs.</i>'; return; }
      const A=a,B=b, rows=[]; while(b){ rows.push([a,b,Math.floor(a/b),a%b]); [a,b]=[b,a%b]; } const g=a;
      o.innerHTML=`<table class="tt">${rows.map((r,k)=>`<tr${r[3]===0?' class="cur"':''}><td>${r[0]} = ${r[1]} × ${r[2]} + <b>${r[3]}</b></td></tr>`).join('')}</table>
        <div class="out"><div><b>PGCD(${A} ; ${B})</b><span>${g}</span></div><div><b>PPCM</b><span>${A/g*B}</span></div><div><b>Premiers entre eux ?</b><span>${g===1?'oui':'non'}</span></div></div>
        <p>Décompositions : ${A} = ${factStr(A)} &nbsp;·&nbsp; ${B} = ${factStr(B)}</p>`; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"Avec Euclide, le PGCD est…", opts:["le dernier reste non nul","le premier reste","le plus petit quotient","toujours 1"], a:0, ex:"On divise jusqu'à obtenir un reste nul ; le reste précédent est le PGCD."}
},
{ title:"Application : le chiffrement affine", html:`
  <p>On numérote les lettres A = 0, B = 1, …, Z = 25. Chaque lettre x est remplacée par la lettre y telle que :</p>
  <div class="def"><b>Chiffrement affine</b><span class="big">y ≡ a·x + b [26]</span><br>Le chiffrement de <b>César</b> est le cas a = 1 (décalage de b lettres).<br>Pour pouvoir <b>déchiffrer</b>, il faut que <b>PGCD(a ; 26) = 1</b> : a possède alors un inverse a' modulo 26 (a × a' ≡ 1 [26]) et x ≡ a'(y − b) [26].</div>
  <div class="lab"><div class="labt">🧪 Chiffre un message</div><div class="row"><label>a = <input type="number" class="aa" value="3" style="width:70px"></label><label>b = <input type="number" class="ab" value="5" style="width:70px"></label><label>Message <input type="text" class="am" value="BTS SIO" style="width:180px"></label></div><div class="aout" style="margin-top:10px"></div></div>`,
  init(el){ const paint=()=>{ const a=Math.round($v(el,'.aa')), b=Math.round($v(el,'.ab')); const msg=el.querySelector('.am').value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,24); const o=el.querySelector('.aout');
      if(!Number.isFinite(a)||!Number.isFinite(b)){ o.innerHTML=''; return; }
      const enc=x=>mod(a*x+b,26); const g=gcd(a,26); let inv=null; for(let k=1;k<26;k++) if(mod(a*k,26)===1) inv=k;
      const cipher=msg.split('').map(c=>LET[enc(LET.indexOf(c))]).join('');
      let h=`<table class="tt"><tr><th>Lettre</th>${msg.split('').map(c=>`<td>${c}</td>`).join('')}</tr><tr><th>x</th>${msg.split('').map(c=>`<td>${LET.indexOf(c)}</td>`).join('')}</tr><tr><th>${a}x + ${b}</th>${msg.split('').map(c=>`<td>${a*LET.indexOf(c)+b}</td>`).join('')}</tr><tr><th>reste mod 26</th>${msg.split('').map(c=>`<td class="res">${enc(LET.indexOf(c))}</td>`).join('')}</tr><tr><th>Chiffré</th>${cipher.split('').map(c=>`<td class="res">${c}</td>`).join('')}</tr></table>`;
      if(g===1) h+=`<p>✅ PGCD(${a} ; 26) = 1. L'inverse de ${a} modulo 26 est <b>${inv}</b> (car ${a} × ${inv} = ${a*inv} ≡ 1 [26]). Déchiffrement : x ≡ ${inv}(y − ${b}) [26] → on retrouve <b>${cipher.split('').map(c=>LET[mod(inv*(LET.indexOf(c)-b),26)]).join('')}</b>.</p>`;
      else { const seen={}; let col=null; for(let x=0;x<26&&!col;x++){ const y=enc(x); if(seen[y]!==undefined) col=[seen[y],x,y]; else seen[y]=x; }
        h+=`<p>❌ PGCD(${a} ; 26) = ${g} ≠ 1 : chiffrement <b>non déchiffrable</b>. ${col?`Par exemple ${LET[col[0]]} et ${LET[col[1]]} sont toutes les deux codées par ${LET[col[2]]}.`:''}</p>`; }
      o.innerHTML=h; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"Pourquoi la clé a = 13 est-elle interdite dans un chiffrement affine modulo 26 ?", opts:["Car PGCD(13 ; 26) ≠ 1 : deux lettres auraient le même code","Car 13 est premier","Car 13 > 12","Elle n'est pas interdite"], a:0, ex:"PGCD(13 ; 26) = 13 : 13 n'a pas d'inverse modulo 26, le chiffrement n'est pas injectif."}
},
{ title:"Codes de contrôle : le bit de parité", html:`
  <p>Lors d'une transmission, un bit peut être modifié. On ajoute donc de l'information de <b>contrôle</b> calculée avec des restes.</p>
  <div class="def"><b>Bit de parité (paire)</b>On ajoute un 8ᵉ bit pour que le <b>nombre total de 1 soit pair</b>, autrement dit pour que la somme des bits soit ≡ 0 [2]. À la réception, si la somme est impaire, une erreur est <b>détectée</b>.</div>
  <p>Limites : le bit de parité <b>détecte</b> une erreur sur un bit mais ne sait pas où elle est (pas de <b>correction</b>), et deux erreurs passent inaperçues. Les <b>codes de Hamming</b> (sujet BTS 2016) utilisent des matrices modulo 2 pour détecter <b>et</b> corriger une erreur.</p>
  <div class="lab"><div class="labt">🧪 Émission puis réception (clique sur les bits)</div><div><b>Mot émis (7 bits) :</b> <span class="pe"></span> → bit de parité <span class="pill pb"></span></div><div style="margin-top:10px"><b>Mot reçu (clique pour simuler une erreur) :</b> <span class="pr"></span></div><div class="pv" style="margin-top:8px"></div></div>`,
  init(el){ const w=[1,0,1,1,0,0,1]; let r=null; const bitBtn=(v,cls,k)=>`<button class="btn sm mono ${cls}" data-k="${k}" style="min-width:34px;${v?'background:var(--acc);color:#fff;border-color:var(--acc)':''}">${v}</button>`;
    const paint=()=>{ const p=w.reduce((s,x)=>s+x,0)%2; const sent=[...w,p]; if(!r) r=sent.slice();
      el.querySelector('.pe').innerHTML=w.map((v,k)=>bitBtn(v,'e',k)).join(' '); el.querySelector('.pb').textContent=p;
      el.querySelector('.pr').innerHTML=r.map((v,k)=>bitBtn(v,'r',k)).join(' ');
      const errs=r.reduce((s,v,k)=>s+(v!==sent[k]),0), ones=r.reduce((s,x)=>s+x,0);
      el.querySelector('.pv').innerHTML=`Nombre de 1 reçus : <b>${ones}</b> → ${ones%2?'<b style="color:var(--ko)">impair : erreur détectée !</b>':'pair : aucune erreur détectée'}${errs>=2&&ones%2===0?` <span style="color:var(--ko)">(pourtant ${errs} bits sont faux : le bit de parité ne voit pas un nombre pair d'erreurs)</span>`:''}`;
      el.querySelectorAll('.e').forEach(b=>b.onclick=()=>{ w[+b.dataset.k]^=1; r=null; paint(); });
      el.querySelectorAll('.r').forEach(b=>b.onclick=()=>{ r[+b.dataset.k]^=1; paint(); }); };
    paint(); },
  check:{q:"Avec un bit de parité paire, quel est le bit ajouté au mot 1011001 ?", opts:["0","1"], a:0, ex:"1011001 contient quatre 1 : c'est déjà pair, on ajoute 0."}
}];
const NUM_QUIZ = [
 {q:"Comment s'écrit 45 en binaire ?", opts:["101101","110101","101011","100101"], a:0, ex:"45 = 32 + 8 + 4 + 1 = 101101₂."},
 {q:"Combien vaut 2F (base 16) en base 10 ?", opts:["47","32","215","45"], a:0, ex:"2F = 2 × 16 + 15 = 47."},
 {q:"Comment s'écrit 200 en hexadécimal ?", opts:["C8","B8","C0","8C"], a:0, ex:"200 = 12 × 16 + 8, et 12 s'écrit C : C8."},
 {q:"Quelle est la plus grande valeur codable sur un octet (8 bits non signés) ?", opts:["255","256","128","512"], a:0, ex:"2⁸ = 256 valeurs, de 0 à 255."},
 {q:"Quel est le reste de la division de 2026 par 7 ?", opts:["3","2","4","6"], a:0, ex:"7 × 289 = 2023 et 2026 − 2023 = 3."},
 {q:"17 est congru à … modulo 5.", opts:["2","3","7","1"], a:0, ex:"17 = 5 × 3 + 2."},
 {q:"Que vaut PGCD(84 ; 36) ?", opts:["12","6","4","18"], a:0, ex:"84 = 36 × 2 + 12 et 36 = 12 × 3 + 0 : le dernier reste non nul est 12."},
 {q:"Quels nombres sont premiers entre eux ?", opts:["14 et 25","12 et 18","15 et 35","21 et 14"], a:0, ex:"14 = 2 × 7 et 25 = 5² n'ont aucun facteur commun : PGCD = 1."},
 {q:"Chiffrement affine y ≡ 3x + 5 [26]. Comment est codée la lettre C (x = 2) ?", opts:["L","K","H","M"], a:0, ex:"3 × 2 + 5 = 11, qui correspond à L."},
 {q:"Quel est l'inverse de 3 modulo 26 ?", opts:["9","3","17","13"], a:0, ex:"3 × 9 = 27 = 26 + 1, donc 3 × 9 ≡ 1 [26]."},
 {q:"Combien de valeurs différentes peut-on coder sur 10 bits ?", opts:["1024","1000","512","100"], a:0, ex:"2¹⁰ = 1024."},
 {q:"Un bit de parité permet…", opts:["de détecter une erreur sur un bit, sans la corriger","de corriger toute erreur","de détecter deux erreurs","de chiffrer le message"], a:0, ex:"Il signale qu'un nombre impair de bits a changé, sans dire lequel."},
];

/* ---------- Logique & ensembles ---------- */
const UNIV = Array.from({length:12},(_,k)=>k+1);
const isPrime = n => n>1 && factorize(n).length===1;
const PREDS = [
  ['x est pair', x=>x%2===0], ['x est un multiple de 3', x=>x%3===0], ['x est premier', isPrime], ['x > 0', x=>x>0], ['x² < 50', x=>x*x<50], ['x > 8', x=>x>8]];
const LOGIC = [
{ title:"Propositions et connecteurs logiques", html:`
  <p>Une <b>proposition</b> est un énoncé vrai (1) ou faux (0). On les combine avec des <b>connecteurs</b> : c'est le calcul booléen, écrit avec des mots.</p>
  <div class="grid2">
    <div class="prop"><b>Négation</b><span class="mono">NON P</span><br><span class="muted">vraie quand P est fausse</span></div>
    <div class="prop"><b>Conjonction</b><span class="mono">P ET Q</span><br><span class="muted">vraie si les deux sont vraies</span></div>
    <div class="prop"><b>Disjonction</b><span class="mono">P OU Q</span><br><span class="muted">vraie si au moins une est vraie</span></div>
    <div class="prop"><b>Implication</b><span class="mono">P ⇒ Q</span><br><span class="muted">fausse <b>seulement</b> si P vraie et Q fausse</span></div>
    <div class="prop"><b>Équivalence</b><span class="mono">P ⇔ Q</span><br><span class="muted">vraie si P et Q ont la même valeur</span></div>
  </div>
  <div class="lab"><div class="labt">🧪 Table de vérité complète</div><div class="row sws"></div><div class="tbl" style="margin-top:10px"></div></div>
  <p class="muted">Piège classique : « P ⇒ Q » est <b>vraie</b> quand P est fausse. « Si je gagne au loto, je t'offre une voiture » n'est pas une promesse rompue si je ne gagne pas !</p>`,
  init(el){ const v={P:1,Q:0}; switches(el.querySelector('.sws'),['P','Q'],v,()=>{ el.querySelector('.tbl').innerHTML=`<table class="tt"><tr><th>P</th><th>Q</th><th>NON P</th><th>P ET Q</th><th>P OU Q</th><th>P ⇒ Q</th><th>P ⇔ Q</th></tr>`+[[0,0],[0,1],[1,0],[1,1]].map(([p,q])=>`<tr class="${p===v.P&&q===v.Q?'cur':''}"><td>${p}</td><td>${q}</td><td class="res">${1-p}</td><td class="res">${p&q}</td><td class="res">${p|q}</td><td class="res">${(1-p)|q}</td><td class="res">${+(p===q)}</td></tr>`).join('')+'</table>'; }); },
  check:{q:"Si P est fausse, que vaut P ⇒ Q ?", opts:["Vraie, quelle que soit Q","Fausse","Ça dépend de Q","La même valeur que Q"], a:0, ex:"L'implication n'est fausse que dans le cas « P vraie et Q fausse »."}
},
{ title:"Contraposée, réciproque et négation", html:`
  <p>À partir de l'implication <b>P ⇒ Q</b> :</p>
  <div class="grid2">
    <div class="prop"><b>Contraposée ✔ équivalente</b><span class="mono">NON Q ⇒ NON P</span></div>
    <div class="prop"><b>Réciproque ✘ pas équivalente</b><span class="mono">Q ⇒ P</span></div>
    <div class="prop"><b>Écriture sans ⇒</b><span class="mono">P ⇒ Q ≡ NON P OU Q</span></div>
    <div class="prop"><b>Négation</b><span class="mono">NON(P ⇒ Q) ≡ P ET NON Q</span></div>
  </div>
  <p>Exemple : « S'il pleut, alors le sol est mouillé. » Sa contraposée, « si le sol n'est pas mouillé, alors il ne pleut pas », est vraie aussi. Sa réciproque, « si le sol est mouillé, alors il pleut », est fausse : on a pu arroser.</p>
  <p>Lois de De Morgan, version logique : NON(P ET Q) ≡ NON P OU NON Q et NON(P OU Q) ≡ NON P ET NON Q.</p>
  <div class="lab"><div class="labt">🧪 Compare avec P ⇒ Q (✅ = même colonne)</div><div class="tbl"></div></div>`,
  init(el){ const rows=[[0,0],[0,1],[1,0],[1,1]]; const cols=[['P ⇒ Q',(p,q)=>(1-p)|q],['NON Q ⇒ NON P',(p,q)=>p|(1-q)?((1-(1-q))|(1-p)):1],['Q ⇒ P',(p,q)=>(1-q)|p],['NON P OU Q',(p,q)=>(1-p)|q],['P ET NON Q',(p,q)=>p&(1-q)]];
    cols[1][1]=(p,q)=>q|(1-p);
    const ref=rows.map(r=>cols[0][1](...r));
    el.querySelector('.tbl').innerHTML=`<table class="tt"><tr><th>P</th><th>Q</th>${cols.map(c=>`<th>${c[0]}</th>`).join('')}</tr>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td>${cols.map(c=>`<td class="res">${c[1](...r)}</td>`).join('')}</tr>`).join('')}<tr><td colspan="2"></td>${cols.map(c=>{const same=rows.every((r,k)=>c[1](...r)===ref[k]); const opp=rows.every((r,k)=>c[1](...r)!==ref[k]); return `<td>${same?'✅':opp?'contraire':'✘'}</td>`;}).join('')}</tr></table>`; },
  check:{q:"Quelle est la contraposée de « si x est un multiple de 4, alors x est pair » ?", opts:["Si x n'est pas pair, alors x n'est pas un multiple de 4","Si x est pair, alors x est un multiple de 4","Si x n'est pas un multiple de 4, alors x n'est pas pair","x est un multiple de 4 et x n'est pas pair"], a:0, ex:"Contraposée de P ⇒ Q : NON Q ⇒ NON P. Elle est vraie, comme l'énoncé de départ."}
},
{ title:"Prédicats et quantificateurs", html:`
  <p>Un <b>prédicat</b> P(x) est une phrase qui dépend d'une variable : « x est pair ». On la transforme en proposition avec un <b>quantificateur</b> :</p>
  <div class="def"><b>Quantificateurs</b>• <b>∀x ∈ E, P(x)</b> : « pour tout x de E, P(x) ». Un seul <b>contre-exemple</b> suffit à la rendre fausse.<br>• <b>∃x ∈ E, P(x)</b> : « il existe au moins un x de E tel que P(x) ». Un seul <b>exemple</b> suffit à la rendre vraie.<br>• <b>Négations</b> : NON(∀x, P(x)) ≡ ∃x, NON P(x) &nbsp;et&nbsp; NON(∃x, P(x)) ≡ ∀x, NON P(x).</div>
  <div class="lab"><div class="labt">🧪 E = {1, 2, …, 12} : teste un prédicat</div><div class="row pb"></div><div class="chips pc"></div><div class="pout"></div></div>`,
  init(el){ let k=0; const pb=el.querySelector('.pb'); pb.innerHTML=PREDS.map((p,i)=>`<button class="btn sm" data-k="${i}">${p[0]}</button>`).join('');
    const paint=()=>{ const [name,f]=PREDS[k]; pb.querySelectorAll('button').forEach(b=>b.classList.toggle('primary',+b.dataset.k===k));
      el.querySelector('.pc').innerHTML=UNIV.map(x=>`<div class="chip ${f(x)?'me':''}">${x}</div>`).join('');
      const all=UNIV.every(f), ex=UNIV.find(f), ce=UNIV.find(x=>!f(x));
      el.querySelector('.pout').innerHTML=`<p>« ∀x ∈ E, ${name} » est <b>${all?'VRAIE':'FAUSSE'}</b>${all?'':` (contre-exemple : x = ${ce})`}.<br>« ∃x ∈ E, ${name} » est <b>${ex!==undefined?'VRAIE':'FAUSSE'}</b>${ex!==undefined?` (exemple : x = ${ex})`:''}.<br><span class="muted">Négation de « ∀x ∈ E, ${name} » : « ∃x ∈ E, NON(${name}) ».</span></p>`; };
    pb.querySelectorAll('button').forEach(b=>b.onclick=()=>{k=+b.dataset.k; paint();}); paint(); },
  check:{q:"Quelle est la négation de « ∀x ∈ ℝ, x² ≥ 0 » ?", opts:["∃x ∈ ℝ, x² < 0","∀x ∈ ℝ, x² < 0","∃x ∈ ℝ, x² ≥ 0","∀x ∈ ℝ, x² ≤ 0"], a:0, ex:"On remplace ∀ par ∃ et on nie la propriété : ≥ devient <."}
},
{ title:"Le langage des ensembles", html:`
  <div class="grid2">
    <div class="prop"><b>Intersection</b><span class="mono">A ∩ B</span><br><span class="muted">dans A <b>et</b> dans B</span></div>
    <div class="prop"><b>Réunion</b><span class="mono">A ∪ B</span><br><span class="muted">dans A <b>ou</b> dans B</span></div>
    <div class="prop"><b>Complémentaire</b><span class="mono">${ov('A')}</span><br><span class="muted">dans E mais <b>pas</b> dans A</span></div>
    <div class="prop"><b>Différence</b><span class="mono">A \\ B = A ∩ ${ov('B')}</span><br><span class="muted">dans A mais pas dans B</span></div>
    <div class="prop"><b>Cardinal</b><span class="mono">|A ∪ B| = |A| + |B| − |A ∩ B|</span></div>
    <div class="prop"><b>Produit cartésien</b><span class="mono">A × B = {(a ; b)}</span><br><span class="muted">|A × B| = |A| × |B|</span></div>
  </div>
  <p>Un ensemble à n éléments possède <b>2ⁿ parties</b> (sous-ensembles), comme les 2ⁿ mots de n bits. Le lien avec le calcul booléen : ∩ ↔ ET, ∪ ↔ OU, complémentaire ↔ NON.</p>
  <div class="lab"><div class="labt">🧪 E = {1, …, 12}</div><div class="row"><label>A : <select class="sa"></select></label><label>B : <select class="sb"></select></label></div><div class="row ob" style="margin-top:8px"></div><div class="chips sc"></div><div class="sout"></div></div>`,
  init(el){ const opt=PREDS.map((p,i)=>`<option value="${i}">${p[0]}</option>`).join(''); const sa=el.querySelector('.sa'), sb=el.querySelector('.sb'); sa.innerHTML=opt; sb.innerHTML=opt; sa.value=0; sb.value=1;
    const OPS=[['A',(a,b)=>a],['B',(a,b)=>b],['A ∩ B',(a,b)=>a&&b],['A ∪ B',(a,b)=>a||b],[ov('A'),(a,b)=>!a],['A \\ B',(a,b)=>a&&!b]]; let op=2;
    const ob=el.querySelector('.ob'); ob.innerHTML=OPS.map((o,i)=>`<button class="btn sm" data-k="${i}">${o[0]}</button>`).join('');
    const paint=()=>{ const fa=PREDS[+sa.value][1], fb=PREDS[+sb.value][1]; ob.querySelectorAll('button').forEach(b=>b.classList.toggle('primary',+b.dataset.k===op));
      const S=UNIV.filter(x=>OPS[op][1](fa(x),fb(x))); const A=UNIV.filter(fa), B=UNIV.filter(fb), I=UNIV.filter(x=>fa(x)&&fb(x));
      el.querySelector('.sc').innerHTML=UNIV.map(x=>`<div class="chip ${S.includes(x)?'me':''}">${x}<small>${fa(x)?'A':''}${fb(x)?'B':''}</small></div>`).join('');
      el.querySelector('.sout').innerHTML=`<p>${OPS[op][0]} = {${S.join(' ; ')}} &nbsp;→ cardinal <b>${S.length}</b></p><p class="muted">Vérification : |A ∪ B| = |A| + |B| − |A ∩ B| = ${A.length} + ${B.length} − ${I.length} = <b>${A.length+B.length-I.length}</b></p>`; };
    sa.onchange=paint; sb.onchange=paint; ob.querySelectorAll('button').forEach(b=>b.onclick=()=>{op=+b.dataset.k; paint();}); paint(); },
  check:{q:"|A| = 5, |B| = 4 et |A ∩ B| = 2. Que vaut |A ∪ B| ?", opts:["7","9","11","2"], a:0, ex:"|A ∪ B| = 5 + 4 − 2 = 7 : on ne compte pas deux fois les éléments communs."}
},
{ title:"Applications injectives, surjectives, bijectives", html:`
  <p>Une <b>application</b> f : E → F associe à chaque élément de E <b>une seule</b> image dans F.</p>
  <div class="def"><b>Définitions</b>• <b>Injective</b> : deux éléments différents ont toujours des images différentes. Si f(x) = f(x'), alors x = x'.<br>• <b>Surjective</b> : tout élément de F a <b>au moins un</b> antécédent.<br>• <b>Bijective</b> : à la fois injective et surjective. Chaque élément de F a exactement un antécédent, et on peut « revenir en arrière ».</div>
  <p class="muted">En informatique : un codage doit être <b>injectif</b>, sinon deux messages différents auraient le même code (sujet BTS SIO 2016). Un chiffrement qu'on veut déchiffrer doit être <b>bijectif</b>.</p>
  <div class="lab"><div class="labt">🧪 Observe quatre applications</div><div class="row ab"></div><div class="asvg"></div><div class="aout"></div></div>`,
  init(el){ const P=[{E:['1','2','3'],F:['a','b','c','d'],m:[0,1,2]},{E:['1','2','3','4'],F:['a','b','c'],m:[0,0,1,2]},{E:['1','2','3'],F:['a','b','c'],m:[1,2,0]},{E:['1','2','3'],F:['a','b','c'],m:[0,0,1]}]; let k=0;
    const ab=el.querySelector('.ab'); ab.innerHTML=P.map((_,i)=>`<button class="btn sm" data-k="${i}">Application ${i+1}</button>`).join('');
    const paint=()=>{ const p=P[k]; ab.querySelectorAll('button').forEach(b=>b.classList.toggle('primary',+b.dataset.k===k)); const H=40+Math.max(p.E.length,p.F.length)*46, y=(i)=>40+i*46;
      let g=arrowDefs('arA','var(--acc)')+`<text x="80" y="20" text-anchor="middle" style="font-weight:700">E</text><text x="320" y="20" text-anchor="middle" style="font-weight:700">F</text>`;
      p.E.forEach((e,i)=>{ g+=`<line x1="96" y1="${y(i)}" x2="300" y2="${y(p.m[i])}" stroke="var(--acc)" stroke-width="2" marker-end="url(#arA)"/><circle cx="80" cy="${y(i)}" r="15" fill="#fff" stroke="var(--ink)"/><text x="80" y="${y(i)+5}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${e}</text>`; });
      p.F.forEach((f,i)=>{ const hit=p.m.includes(i); g+=`<circle cx="320" cy="${y(i)}" r="15" fill="${hit?'#fff':'var(--ko-soft)'}" stroke="${hit?'var(--ink)':'var(--ko)'}"/><text x="320" y="${y(i)+5}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${f}</text>`; });
      el.querySelector('.asvg').innerHTML=`<svg viewBox="0 0 400 ${H}" style="max-width:400px">${g}</svg>`;
      const coll=p.m.findIndex((v,i)=>p.m.indexOf(v)!==i), miss=p.F.findIndex((_,i)=>!p.m.includes(i)); const inj=coll<0, sur=miss<0;
      el.querySelector('.aout').innerHTML=`<p>Injective : <b>${inj?'oui':'non'}</b>${inj?' (toutes les images sont différentes)':` (${p.E[p.m.indexOf(p.m[coll])]} et ${p.E[coll]} ont la même image ${p.F[p.m[coll]]})`}<br>Surjective : <b>${sur?'oui':'non'}</b>${sur?' (chaque élément de F est atteint)':` (${p.F[miss]} n'a pas d'antécédent)`}<br>Bijective : <b>${inj&&sur?'oui':'non'}</b></p>`; };
    ab.querySelectorAll('button').forEach(b=>b.onclick=()=>{k=+b.dataset.k; paint();}); paint(); },
  check:{q:"La fonction f : ℝ → ℝ, x ↦ x² est-elle injective ?", opts:["Non, car f(−1) = f(1)","Oui, car x² est toujours positif","Oui, car elle est continue","Non, car elle n'est pas définie partout"], a:0, ex:"−1 ≠ 1 mais ils ont la même image 1 : deux éléments différents, même image."}
}];
const LOGIC_QUIZ = [
 {q:"Dans quel cas l'implication P ⇒ Q est-elle fausse ?", opts:["P vraie et Q fausse","P fausse et Q vraie","P et Q fausses","P et Q vraies"], a:0, ex:"C'est le seul cas où l'implication est fausse."},
 {q:"Quelle proposition est équivalente à P ⇒ Q ?", opts:["NON Q ⇒ NON P","Q ⇒ P","NON P ⇒ NON Q","P ET Q"], a:0, ex:"C'est la contraposée. La réciproque Q ⇒ P n'est pas équivalente."},
 {q:"Quelle est la négation de « ∀x, x > 0 » ?", opts:["∃x, x ≤ 0","∀x, x ≤ 0","∃x, x > 0","∀x, x < 0"], a:0, ex:"∀ devient ∃ et « > » devient « ≤ »."},
 {q:"Quelle est la négation de « P ET Q » ?", opts:["NON P OU NON Q","NON P ET NON Q","P OU Q","NON P ET Q"], a:0, ex:"Loi de De Morgan en logique."},
 {q:"Quelle est la négation de P ⇒ Q ?", opts:["P ET NON Q","NON P ⇒ NON Q","Q ⇒ P","NON P OU Q"], a:0, ex:"P ⇒ Q ≡ NON P OU Q, dont la négation est P ET NON Q."},
 {q:"E = {1, …, 12}, A = pairs, B = multiples de 3. Que vaut A ∩ B ?", opts:["{6 ; 12}","{3 ; 6 ; 9 ; 12}","{2 ; 3 ; 4 ; 6 ; 8 ; 9 ; 10 ; 12}","∅"], a:0, ex:"Il faut être pair et multiple de 3, donc multiple de 6."},
 {q:"|A| = 3 et |B| = 4. Que vaut |A × B| ?", opts:["12","7","81","64"], a:0, ex:"Il y a 3 × 4 = 12 couples (a ; b)."},
 {q:"Combien de parties (sous-ensembles) possède un ensemble à 4 éléments ?", opts:["16","8","4","24"], a:0, ex:"2⁴ = 16, ensemble vide et ensemble entier compris."},
 {q:"Une application f est injective si…", opts:["deux éléments différents ont des images différentes","tout élément d'arrivée a un antécédent","elle est croissante","elle a un inverse modulo 26"], a:0, ex:"C'est la définition, utilisée dans le sujet 2016 sur les codes correcteurs."},
 {q:"Le complémentaire de A ∪ B est…", opts:[`${ov('A')} ∩ ${ov('B')}`,`${ov('A')} ∪ ${ov('B')}`,"A ∩ B",`A ∩ ${ov('B')}`], a:0, ex:"Loi de De Morgan, version ensembles."},
 {q:"« ∃x ∈ {1, 2, 3}, x > 2 » est…", opts:["vraie (x = 3)","fausse","vraie pour tout x","indéterminée"], a:0, ex:"Un seul exemple suffit : x = 3."},
 {q:"Une application est bijective si elle est…", opts:["injective et surjective","injective ou surjective","seulement surjective","définie sur ℝ"], a:0, ex:"Chaque élément d'arrivée a alors exactement un antécédent."},
];

/* ---------- Matrices ---------- */
const MAT = [
{ title:"Vocabulaire des matrices", html:`
  <div class="def"><b>Définition</b>Une matrice de <b>dimension n × p</b> est un tableau de nombres à <b>n lignes</b> et <b>p colonnes</b>. Le coefficient de la ligne i et de la colonne j se note <b>a<sub>ij</sub></b>.</div>
  <p>• <b>Matrice carrée</b> : n = p. &nbsp;• <b>Matrice identité</b> I<sub>n</sub> : des 1 sur la diagonale, des 0 ailleurs. &nbsp;• <b>Matrice nulle</b> : uniquement des 0.<br>• <b>Somme</b> A + B : seulement si A et B ont la même dimension, on additionne terme à terme. &nbsp;• <b>Produit par un réel</b> kA : on multiplie chaque coefficient par k.</p>
  <div class="lab"><div class="labt">🧪 Clique sur un coefficient</div><div class="mv"></div><div class="mo" style="margin-top:8px"></div></div>`,
  init(el){ const M=[[4,-1,0,7],[2,5,3,-2],[0,8,1,6]]; el.querySelector('.mv').innerHTML=`<div class="muted">A, matrice 3 × 4 (3 lignes, 4 colonnes)</div>`+matHTML(M);
    el.querySelectorAll('.mv td').forEach(td=>{ td.style.cursor='pointer'; td.onclick=()=>{ el.querySelectorAll('.mv td').forEach(t=>t.style.background=''); td.style.background='var(--hl)'; const i=+td.dataset.i+1, j=+td.dataset.j+1; el.querySelector('.mo').innerHTML=`<b>a<sub>${i}${j}</sub> = ${td.textContent}</b> : ligne ${i}, colonne ${j}.`; }; }); },
  check:{q:"Une matrice a 2 lignes et 5 colonnes. Quelle est sa dimension ?", opts:["2 × 5","5 × 2","10","7"], a:0, ex:"On donne d'abord le nombre de lignes, puis le nombre de colonnes."}
},
{ title:"Le produit de deux matrices", html:`
  <div class="def"><b>Règle</b>Le produit A × B existe si le <b>nombre de colonnes de A = nombre de lignes de B</b>. Une matrice (n × p) fois une matrice (p × q) donne une matrice (n × q).<br>Le coefficient c<sub>ij</sub> est obtenu en multipliant <b>la ligne i de A</b> par <b>la colonne j de B</b>, terme à terme, puis en additionnant.</div>
  <p>⚠ En général, <b>A × B ≠ B × A</b> : le produit n'est pas commutatif.</p>
  <div class="lab"><div class="labt">🧪 Modifie A et B, puis clique sur une case du résultat</div><div class="row" style="align-items:flex-start;gap:24px"><div><div class="muted">A (2 × 3)</div><div class="ma"></div></div><div><div class="muted">B (3 × 2)</div><div class="mb"></div></div><div><div class="muted">A × B (2 × 2)</div><div class="mr"></div></div><div><div class="muted">B × A (3 × 3)</div><div class="mr2"></div></div></div><div class="mx" style="margin-top:10px"></div></div>`,
  init(el){ const A=[[1,2,0],[3,-1,4]], B=[[2,1],[0,3],[5,-2]]; let sel=[0,0];
    const inputs=(M,cls)=>`<table class="tt">${M.map((r,i)=>`<tr>${r.map((v,j)=>`<td style="padding:2px"><input type="number" class="${cls}" data-i="${i}" data-j="${j}" value="${v}" style="width:56px;text-align:center"></td>`).join('')}</tr>`).join('')}</table>`;
    el.querySelector('.ma').innerHTML=inputs(A,'ia'); el.querySelector('.mb').innerHTML=inputs(B,'ib');
    const paint=()=>{ const C=matMul(A,B), D=matMul(B,A); const [i,j]=sel;
      el.querySelector('.mr').innerHTML=matHTML(C,{cls:(a,b)=>a===i&&b===j?'res cur':'res'}); el.querySelector('.mr2').innerHTML=matHTML(D);
      el.querySelectorAll('.mr td').forEach(td=>{ td.style.cursor='pointer'; td.onclick=()=>{ sel=[+td.dataset.i,+td.dataset.j]; paint(); }; });
      el.querySelectorAll('.ia').forEach(inp=>inp.parentElement.style.background=+inp.dataset.i===i?'var(--hl)':'');
      el.querySelectorAll('.ib').forEach(inp=>inp.parentElement.style.background=+inp.dataset.j===j?'var(--hl)':'');
      el.querySelector('.mx').innerHTML=`<span class="mono">c<sub>${i+1}${j+1}</sub> = ${A[i].map((a,k)=>`${a}×${B[k][j]}`).join(' + ')} = <b>${C[i][j]}</b></span>`; };
    el.querySelectorAll('.ia').forEach(inp=>inp.oninput=()=>{A[+inp.dataset.i][+inp.dataset.j]=parseFloat(inp.value)||0; paint();});
    el.querySelectorAll('.ib').forEach(inp=>inp.oninput=()=>{B[+inp.dataset.i][+inp.dataset.j]=parseFloat(inp.value)||0; paint();}); paint(); },
  check:{q:"A est de dimension 2 × 3 et B de dimension 3 × 4. Quelle est la dimension de A × B ?", opts:["2 × 4","3 × 3","4 × 2","impossible"], a:0, ex:"(2 × 3) × (3 × 4) : les « 3 » du milieu se correspondent, il reste 2 × 4."}
},
{ title:"Matrice inverse et systèmes", html:`
  <div class="def"><b>Inverse</b>Une matrice carrée A est inversible s'il existe A⁻¹ telle que A × A⁻¹ = A⁻¹ × A = I.<br>Pour une matrice 2 × 2, A = (a b ; c d) : A est inversible si et seulement si <b>det A = ad − bc ≠ 0</b>, et alors<br><span class="big">A⁻¹ = 1/(ad − bc) × ( d −b ; −c a )</span></div>
  <p><b>Résoudre un système</b> : le système 2x + 3y = 8 et x + 2y = 5 s'écrit AX = B avec A = (2 3 ; 1 2), X = (x ; y) et B = (8 ; 5). Si A est inversible, <b>X = A⁻¹B</b>. Ici det A = 4 − 3 = 1, A⁻¹ = (2 −3 ; −1 2), donc x = 2×8 − 3×5 = 1 et y = −8 + 2×5 = 2.</p>
  <div class="lab"><div class="labt">🧪 Inverse d'une matrice 2 × 2</div><div class="row" style="align-items:flex-start;gap:24px"><div><div class="muted">A</div><table class="tt"><tr><td><input type="number" class="i0" value="3" style="width:56px"></td><td><input type="number" class="i1" value="1" style="width:56px"></td></tr><tr><td><input type="number" class="i2" value="5" style="width:56px"></td><td><input type="number" class="i3" value="2" style="width:56px"></td></tr></table></div><div class="io"></div></div></div>`,
  init(el){ const paint=()=>{ const [a,b,c,d]=[0,1,2,3].map(k=>Math.round($v(el,'.i'+k))||0); const det=a*d-b*c; const o=el.querySelector('.io');
      if(det===0){ o.innerHTML=`<p>det A = ${a}×${d} − ${b}×${c} = <b>0</b><br>❌ A n'est <b>pas inversible</b>.</p>`; return; }
      const inv=[[frac(d,det),frac(-b,det)],[frac(-c,det),frac(a,det)]];
      o.innerHTML=`<p>det A = ${a}×${d} − ${b}×${c} = <b>${det}</b> ≠ 0 ✅</p><div class="muted">A⁻¹</div>${matHTML(inv)}<p class="muted">Vérifie : A × A⁻¹ = ${matHTML(matMul([[a,b],[c,d]],[[d/det,-b/det],[-c/det,a/det]]).map(r=>r.map(v=>Math.round(v*1e9)/1e9)))}</p>`; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"La matrice (2 4 ; 1 2) est-elle inversible ?", opts:["Non, car son déterminant vaut 0","Oui, car ses coefficients sont non nuls","Oui, son inverse est (2 −4 ; −1 2)","Non, car elle n'est pas carrée"], a:0, ex:"det = 2×2 − 4×1 = 0."}
},
{ title:"Matrices et informatique : un code de Hamming", html:`
  <p>Les calculs matriciels <b>modulo 2</b> (1 + 1 = 0) servent à fabriquer des codes correcteurs d'erreurs. Dans le code de Hamming (7, 4), un mot m de 4 bits (matrice 1 × 4) est codé par <b>c = m × G</b> (modulo 2), où G est une matrice 4 × 7. Les 3 bits ajoutés permettent de <b>localiser et corriger</b> une erreur.</p>
  <div class="lab"><div class="labt">🧪 Code un mot de 4 bits</div><div class="row hw"></div><div class="hg" style="margin-top:10px"></div><div class="hc"></div></div>
  <p class="muted">Même méthode que dans le sujet BTS SIO 2016 : produit matriciel, puis on remplace chaque coefficient par son reste modulo 2.</p>`,
  init(el){ const G=[[1,0,0,0,1,1,0],[0,1,0,0,1,0,1],[0,0,1,0,0,1,1],[0,0,0,1,1,1,1]]; const m=[1,0,1,1];
    const paint=()=>{ el.querySelector('.hw').innerHTML='m = '+m.map((v,k)=>`<button class="btn sm mono" data-k="${k}" style="min-width:34px;${v?'background:var(--acc);color:#fff;border-color:var(--acc)':''}">${v}</button>`).join(' ');
      el.querySelectorAll('.hw button').forEach(b=>b.onclick=()=>{m[+b.dataset.k]^=1; paint();});
      const raw=G[0].map((_,j)=>m.reduce((s,v,k)=>s+v*G[k][j],0));
      el.querySelector('.hg').innerHTML=`<div class="muted">G (4 × 7)</div>`+matHTML(G);
      el.querySelector('.hc').innerHTML=`<p>m × G = (${raw.join(' ')}) &nbsp;→ modulo 2 : <b class="mono" style="font-size:18px">c = ${raw.map(x=>x%2).join(' ')}</b></p><p class="muted">Les 4 premiers bits recopient le mot, les 3 derniers sont des bits de contrôle. Par exemple, le 5ᵉ vaut ${m[0]}+${m[1]}+${m[3]} = ${m[0]+m[1]+m[3]} ≡ ${(m[0]+m[1]+m[3])%2} [2].</p>`; };
    paint(); },
  check:{q:"Que vaut 1 + 1 + 1 modulo 2 ?", opts:["1","3","0","2"], a:0, ex:"3 = 2 × 1 + 1 : le reste est 1."}
}];
const MAT_QUIZ = [
 {q:"Quelle est la dimension de A × B si A est 3 × 2 et B est 2 × 5 ?", opts:["3 × 5","2 × 2","5 × 3","impossible"], a:0, ex:"(3 × 2)(2 × 5) donne 3 × 5."},
 {q:"Que vaut (1 2 ; 3 4) × (0 1 ; 1 0) ?", opts:["(2 1 ; 4 3)","(3 4 ; 1 2)","(0 2 ; 3 0)","(1 2 ; 3 4)"], a:0, ex:"Ligne 1 : (1×0 + 2×1 ; 1×1 + 2×0) = (2 ; 1). Ligne 2 : (4 ; 3)."},
 {q:"Quel est le déterminant de (3 1 ; 5 2) ?", opts:["1","11","−1","6"], a:0, ex:"3×2 − 1×5 = 1."},
 {q:"Quel est l'inverse de (3 1 ; 5 2) ?", opts:["(2 −1 ; −5 3)","(2 1 ; 5 3)","(3 −1 ; −5 2)","(−2 1 ; 5 −3)"], a:0, ex:"det = 1, donc A⁻¹ = (d −b ; −c a) = (2 −1 ; −5 3)."},
 {q:"Pour deux matrices carrées A et B, a-t-on toujours AB = BA ?", opts:["Non, le produit n'est pas commutatif","Oui, toujours","Seulement si elles sont 2 × 2","Seulement modulo 2"], a:0, ex:"Il suffit d'un contre-exemple, comme dans l'activité du produit."},
 {q:"Que vaut A × I, où I est la matrice identité de même taille ?", opts:["A","I","0","A²"], a:0, ex:"I est l'élément neutre de la multiplication des matrices."},
 {q:"Peut-on additionner une matrice 2 × 3 et une matrice 3 × 2 ?", opts:["Non","Oui, on obtient une 2 × 2","Oui, on obtient une 3 × 3","Oui, si on les transpose"], a:0, ex:"La somme exige deux matrices de même dimension."},
 {q:"Le coefficient a₂₃ se trouve…", opts:["ligne 2, colonne 3","ligne 3, colonne 2","à la position 23","sur la diagonale"], a:0, ex:"L'indice de ligne vient d'abord."},
 {q:"Que vaut (1 0 ; 2 1)² ?", opts:["(1 0 ; 4 1)","(1 0 ; 4 2)","(2 0 ; 4 2)","(1 0 ; 2 1)"], a:0, ex:"Ligne 2 : (2×1 + 1×2 ; 2×0 + 1×1) = (4 ; 1)."},
 {q:"Le système 2x + 3y = 8, x + 2y = 5 a pour solution…", opts:["x = 1, y = 2","x = 2, y = 1","x = 4, y = 0","x = −1, y = 3"], a:0, ex:"X = A⁻¹B = (2 −3 ; −1 2)(8 ; 5) = (1 ; 2)."},
];

/* ---------- Graphes & ordonnancement ---------- */
const GV = ['A','B','C','D','E'], GP = {A:[70,110],B:[230,40],C:[230,190],D:[400,110],E:[560,110]};
const GE = [['A','B'],['A','C'],['B','C'],['B','D'],['C','D'],['D','E'],['E','B']];
const GM = GV.map(a=>GV.map(b=>GE.some(e=>e[0]===a&&e[1]===b)?1:0));
function graphSVG(hl){ let g=arrowDefs('arG','var(--muted)')+arrowDefs('arH','var(--acc)');
  GE.forEach(([a,b])=>{ const [x1,y1]=GP[a],[x2,y2]=GP[b]; const on=hl&&hl.edges&&hl.edges.some(e=>e[0]===a&&e[1]===b); const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy); const ux=dx/L, uy=dy/L;
    const curved = a==='E'&&b==='B'; const sx=x1+ux*22, sy=y1+uy*22, ex=x2-ux*24, ey=y2-uy*24;
    g+= curved ? `<path d="M${x1-10},${y1-20} Q${(x1+x2)/2},${-40} ${x2+22},${y2-10}" fill="none" stroke="${on?'var(--acc)':'var(--muted)'}" stroke-width="${on?3:1.8}" marker-end="url(#${on?'arH':'arG'})"/>`
      : `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${on?'var(--acc)':'var(--muted)'}" stroke-width="${on?3:1.8}" marker-end="url(#${on?'arH':'arG'})"/>`; });
  GV.forEach(v=>{ const [x,y]=GP[v]; const on=hl&&hl.v===v; g+=`<g class="gv" data-v="${v}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="20" fill="${on?'var(--acc)':'#fff'}" stroke="var(--acc)" stroke-width="2"/><text x="${x}" y="${y+5}" text-anchor="middle" style="font-weight:700;font-size:15px;fill:${on?'#fff':'var(--ink)'}">${v}</text></g>`; });
  return `<svg viewBox="0 -60 640 280">${g}</svg>`; }
const ROBOT = [{id:'A',n:"Achat de la structure",d:1,p:[]},{id:'B',n:"Modélisation numérique",d:5,p:['A']},{id:'C',n:"Montage du prototype",d:1,p:['A','D']},{id:'D',n:"Achat des capteurs",d:3,p:[]},{id:'E',n:"Développement du programme",d:1,p:['D']},{id:'F',n:"Tests et réglages",d:4,p:['C','E']},{id:'G',n:"Négociation des coûts",d:1,p:['B','F']}];
function levels(T){ const lv={}; let rest=T.map(t=>t.id), k=0, steps=[]; while(rest.length){ const L=rest.filter(id=>T.find(t=>t.id===id).p.every(p=>lv[p]!==undefined)); L.forEach(id=>lv[id]=k); steps.push(L); rest=rest.filter(id=>!L.includes(id)); k++; if(!L.length) break; } return {lv,steps}; }
function mpm(T){ const {lv,steps}=levels(T); const E={},Lt={}; const order=steps.flat(); const by=id=>T.find(t=>t.id===id);
  order.forEach(id=>{ const t=by(id); E[id]=t.p.length?Math.max(...t.p.map(p=>E[p]+by(p).d)):0; });
  const end=Math.max(...T.map(t=>E[t.id]+t.d)); const succ=id=>T.filter(t=>t.p.includes(id)).map(t=>t.id);
  [...order].reverse().forEach(id=>{ const s=succ(id); Lt[id]=(s.length?Math.min(...s.map(x=>Lt[x])):end)-by(id).d; });
  const ML={}; T.forEach(t=>{ const s=succ(t.id); ML[t.id]=(s.length?Math.min(...s.map(x=>E[x])):end)-(E[t.id]+t.d); });
  return {E,Lt,end,ML,lv,steps,succ}; }
const GRAPH = [
{ title:"Vocabulaire des graphes orientés", html:`
  <p>Un <b>graphe orienté</b> est formé de <b>sommets</b> reliés par des <b>arcs</b> (des flèches). Si l'arc va de X vers Y, Y est un <b>successeur</b> de X et X un <b>prédécesseur</b> de Y.</p>
  <p>• Un <b>chemin</b> est une suite d'arcs qui s'enchaînent, et sa <b>longueur</b> est son nombre d'arcs. &nbsp;• Un <b>circuit</b> est un chemin qui revient à son point de départ. &nbsp;• Une <b>boucle</b> est un arc d'un sommet vers lui-même.</p>
  <div class="lab"><div class="labt">🧪 Clique sur un sommet</div><div class="gs"></div><div class="go"></div></div>`,
  init(el){ let v='B'; const paint=()=>{ const out=GE.filter(e=>e[0]===v).map(e=>e[1]), inn=GE.filter(e=>e[1]===v).map(e=>e[0]);
      el.querySelector('.gs').innerHTML=graphSVG({v,edges:GE.filter(e=>e[0]===v||e[1]===v)});
      el.querySelectorAll('.gv').forEach(g=>g.onclick=()=>{v=g.dataset.v; paint();});
      el.querySelector('.go').innerHTML=`<div class="out"><div><b>Successeurs de ${v}</b><span>${out.join(', ')||'aucun'}</span></div><div><b>Prédécesseurs de ${v}</b><span>${inn.join(', ')||'aucun'}</span></div><div><b>Degré</b><span>${out.length+inn.length}</span></div></div><p class="muted">Ce graphe contient le circuit B → D → E → B (longueur 3).</p>`; };
    paint(); },
  check:{q:"Dans ce graphe, quels sont les successeurs de A ?", opts:["B et C","B seulement","aucun","D et E"], a:0, ex:"Les arcs A → B et A → C partent de A."}
},
{ title:"Matrice d'adjacence et nombre de chemins", html:`
  <div class="def"><b>Matrice d'adjacence</b>Pour un graphe à n sommets, c'est la matrice n × n M où <b>m<sub>ij</sub> = 1 s'il y a un arc du sommet i vers le sommet j</b>, et 0 sinon.</div>
  <div class="def"><b>Propriété fondamentale</b>Le coefficient (i ; j) de <b>M<sup>k</sup></b> donne le <b>nombre de chemins de longueur k</b> allant de i à j. En calcul booléen (1 + 1 = 1), M<sup>[k]</sup> indique seulement s'il <b>existe</b> un tel chemin. La <b>fermeture transitive</b> M + M<sup>[2]</sup> + … + M<sup>[n]</sup> indique les sommets reliés par au moins un chemin.</div>
  <div class="lab"><div class="labt">🧪 Choisis k, puis clique sur une case</div><div class="row kb"></div><div class="row" style="align-items:flex-start;gap:20px;margin-top:8px"><div class="km"></div><div style="flex:1;min-width:240px" class="kx"></div></div><div class="ks"></div></div>`,
  init(el){ let k=2, sel=[0,3]; const kb=el.querySelector('.kb'); kb.innerHTML=[1,2,3,4].map(i=>`<button class="btn sm" data-k="${i}">M${i>1?'<sup>'+i+'</sup>':''}</button>`).join('');
    const paths=(i,j,len)=>{ const res=[]; const rec=(cur,p)=>{ if(p.length===len+1){ if(cur===j) res.push(p.map(x=>GV[x]).join(' → ')); return; } GM[cur].forEach((v,n)=>{ if(v) rec(n,[...p,n]); }); }; rec(i,[i]); return res; };
    const paint=()=>{ kb.querySelectorAll('button').forEach(b=>b.classList.toggle('primary',+b.dataset.k===k)); let P=GM; for(let t=1;t<k;t++) P=matMul(P,GM);
      el.querySelector('.km').innerHTML=`<table class="tt"><tr><th></th>${GV.map(v=>`<th>${v}</th>`).join('')}</tr>${P.map((r,i)=>`<tr><th>${GV[i]}</th>${r.map((v,j)=>`<td data-i="${i}" data-j="${j}" class="res ${i===sel[0]&&j===sel[1]?'cur':''}" style="cursor:pointer">${v}</td>`).join('')}</tr>`).join('')}</table>`;
      el.querySelectorAll('.km td').forEach(td=>td.onclick=()=>{ sel=[+td.dataset.i,+td.dataset.j]; paint(); });
      const ps=paths(sel[0],sel[1],k);
      el.querySelector('.kx').innerHTML=`<p>Coefficient (${GV[sel[0]]} ; ${GV[sel[1]]}) de M${k>1?'<sup>'+k+'</sup>':''} = <b>${P[sel[0]][sel[1]]}</b> : il y a ${P[sel[0]][sel[1]]} chemin(s) de longueur ${k} de ${GV[sel[0]]} à ${GV[sel[1]]}.</p>${ps.length?`<ul>${ps.map(p=>`<li class="mono">${p}</li>`).join('')}</ul>`:''}`;
      el.querySelector('.ks').innerHTML=graphSVG({edges:[]}); };
    kb.querySelectorAll('button').forEach(b=>b.onclick=()=>{k=+b.dataset.k; paint();}); paint(); },
  check:{q:"Le coefficient (A ; D) de M² vaut 2. Cela signifie…", opts:["qu'il existe 2 chemins de longueur 2 de A à D","qu'il y a 2 arcs de A à D","que D est à distance 2 de tous les sommets","que A a 2 successeurs"], a:0, ex:"Ces chemins sont A → B → D et A → C → D."}
},
{ title:"Niveaux d'un graphe sans circuit", html:`
  <p>Pour <b>ordonner</b> des tâches, on range les sommets par <b>niveaux</b> :</p>
  <div class="def"><b>Algorithme des niveaux</b>• Niveau 0 : les sommets <b>sans prédécesseur</b>.<br>• On les retire. Les sommets qui n'ont alors plus de prédécesseur forment le niveau 1.<br>• On recommence jusqu'à épuisement des sommets (le graphe ne doit pas contenir de circuit).</div>
  <p>Exemple du sujet BTS SIO 2016 : construction d'un robot en 7 tâches.</p>
  <div class="lab"><div class="labt">🧪 Calcule les niveaux étape par étape</div><table class="tt rt"></table><div class="row" style="margin-top:8px"><button class="btn sm primary ln">Niveau suivant</button><button class="btn sm lr">Recommencer</button></div><div class="lo" style="margin-top:8px"></div></div>`,
  init(el){ const {steps}=levels(ROBOT); let shown=0;
    const paint=()=>{ const done=steps.slice(0,shown).flat();
      el.querySelector('.rt').innerHTML=`<tr><th>Tâche</th><th>Description</th><th>Durée (j)</th><th>Prédécesseurs</th><th>Niveau</th></tr>`+ROBOT.map(t=>{ const lvl=steps.findIndex(s=>s.includes(t.id)); const vis=lvl<shown; return `<tr class="${vis&&lvl===shown-1?'cur':''}"><td><b>${t.id}</b></td><td style="text-align:left">${t.n}</td><td>${t.d}</td><td>${t.p.map(p=>done.includes(p)?`<s>${p}</s>`:p).join(', ')||'—'}</td><td class="res">${vis?lvl:''}</td></tr>`; }).join('');
      el.querySelector('.lo').innerHTML=steps.slice(0,shown).map((s,k)=>`Niveau ${k} : <b>${s.join(', ')}</b>${k===0?' (aucun prédécesseur)':` (leurs prédécesseurs sont tous aux niveaux précédents)`}`).join('<br>');
      el.querySelector('.ln').disabled=shown>=steps.length; };
    el.querySelector('.ln').onclick=()=>{shown++; paint();}; el.querySelector('.lr').onclick=()=>{shown=0; paint();}; paint(); },
  check:{q:"Quels sommets sont au niveau 0 ?", opts:["Ceux qui n'ont aucun prédécesseur","Ceux qui n'ont aucun successeur","Ceux de plus courte durée","Le sommet « Début » uniquement"], a:0, ex:"Ce sont les tâches qui peuvent commencer tout de suite."}
},
{ title:"Ordonnancement MPM : dates, chemin critique, marges", html:`
  <div class="def"><b>Méthode MPM</b>• <b>Date au plus tôt</b> d'une tâche : la plus grande des valeurs (date au plus tôt + durée) de ses prédécesseurs, et 0 si elle n'en a pas.<br>• <b>Durée minimale du projet</b> : la plus grande des valeurs (date au plus tôt + durée).<br>• <b>Date au plus tard</b> (on remonte depuis la fin) : la plus petite des dates au plus tard de ses successeurs, moins sa durée.<br>• <b>Marge totale</b> = plus tard − plus tôt : le retard possible <b>sans retarder le projet</b>.<br>• <b>Marge libre</b> = plus petite date au plus tôt des successeurs − (plus tôt + durée) : le retard possible <b>sans retarder aucune autre tâche</b>.<br>• <b>Chemin critique</b> : les tâches de <b>marge totale nulle</b>.</div>
  <div class="lab"><div class="labt">🧪 Modifie les durées : tout se recalcule</div><div class="row md"></div><div class="mg"></div><div class="mt"></div></div>`,
  init(el){ const T=ROBOT.map(t=>({...t,p:[...t.p]})); const md=el.querySelector('.md');
    md.innerHTML=T.map((t,k)=>`<label class="mono">${t.id} <input type="number" min="0" max="20" value="${t.d}" data-k="${k}" style="width:56px"></label>`).join('');
    const paint=()=>{ const R=mpm(T); const crit=id=>R.Lt[id]-R.E[id]===0;
      const cols=Math.max(...Object.values(R.lv))+1; const W=Math.max(660,(cols+2)*125+90); const colX=c=>70+c*125; const byLv={}; T.forEach(t=>(byLv[R.lv[t.id]]=byLv[R.lv[t.id]]||[]).push(t.id));
      const pos={}; pos['Début']=[colX(0),150]; Object.entries(byLv).forEach(([l,ids])=>ids.forEach((id,i)=>pos[id]=[colX(+l+1),150+(i-(ids.length-1)/2)*95])); pos['Fin']=[colX(cols+1),150];
      let g=arrowDefs('arM','var(--muted)')+arrowDefs('arC','var(--ko)'); const edge=(a,b,lab,c)=>{ const [x1,y1]=pos[a],[x2,y2]=pos[b]; g+=`<line x1="${x1+46}" y1="${y1}" x2="${x2-48}" y2="${y2}" stroke="${c?'var(--ko)':'var(--muted)'}" stroke-width="${c?2.6:1.5}" marker-end="url(#${c?'arC':'arM'})"/><text x="${(x1+x2)/2+4}" y="${(y1+y2)/2-5}" style="font-weight:600;fill:${c?'var(--ko)':'var(--muted)'}">${lab}</text>`; };
      T.forEach(t=>{ if(!t.p.length) edge('Début',t.id,0,crit(t.id)&&R.E[t.id]===0); t.p.forEach(p=>edge(p,t.id,T.find(x=>x.id===p).d,crit(p)&&crit(t.id)&&R.E[p]+T.find(x=>x.id===p).d===R.E[t.id])); if(!R.succ(t.id).length) edge(t.id,'Fin',t.d,crit(t.id)&&R.E[t.id]+t.d===R.end); });
      const node=(id,a,b,c)=>{ const [x,y]=pos[id]; g+=`<rect x="${x-46}" y="${y-28}" width="92" height="56" rx="8" fill="#fff" stroke="${c?'var(--ko)':'var(--ink)'}" stroke-width="${c?2.4:1.3}"/><line x1="${x-46}" y1="${y}" x2="${x+46}" y2="${y}" stroke="var(--line)"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y+28}" stroke="var(--line)"/><text x="${x}" y="${y-8}" text-anchor="middle" style="font-weight:700;fill:var(--ink)">${id}</text><text x="${x-23}" y="${y+19}" text-anchor="middle" style="fill:var(--g3);font-weight:700">${a}</text><text x="${x+23}" y="${y+19}" text-anchor="middle" style="fill:var(--g2);font-weight:700">${b}</text>`; };
      node('Début',0,0,true); T.forEach(t=>node(t.id,R.E[t.id],R.Lt[t.id],crit(t.id))); node('Fin',R.end,R.end,true);
      el.querySelector('.mg').innerHTML=`<svg viewBox="0 0 ${W} 300">${g}</svg><p class="muted">Dans chaque case : <b style="color:var(--g3)">date au plus tôt</b> | <b style="color:var(--g2)">date au plus tard</b>. Sur chaque arc : la durée de la tâche de départ. En rouge : le chemin critique.</p>`;
      el.querySelector('.mt').innerHTML=`<table class="tt"><tr><th>Tâche</th><th>Durée</th><th>Plus tôt</th><th>Plus tard</th><th>Marge totale</th><th>Marge libre</th></tr>${T.map(t=>`<tr class="${crit(t.id)?'cur':''}"><td><b>${t.id}</b></td><td>${t.d}</td><td>${R.E[t.id]}</td><td>${R.Lt[t.id]}</td><td class="res">${R.Lt[t.id]-R.E[t.id]}</td><td class="res">${R.ML[t.id]}</td></tr>`).join('')}</table><div class="out"><div><b>Durée minimale du projet</b><span>${R.end} jours</span></div><div><b>Tâches critiques</b><span>${T.filter(t=>crit(t.id)).map(t=>t.id).join(', ')}</span></div></div>`; };
    md.querySelectorAll('input').forEach(i=>i.oninput=()=>{ T[+i.dataset.k].d=Math.max(0,Math.round(parseFloat(i.value)||0)); paint(); }); paint(); },
  check:{q:"Une tâche a une marge totale de 2 jours. Elle prend 1 jour de retard. Que se passe-t-il ?", opts:["Le projet n'est pas retardé","Le projet est retardé d'un jour","Le projet est retardé de deux jours","La tâche devient impossible"], a:0, ex:"Tant que le retard ne dépasse pas la marge totale, la date de fin ne bouge pas."}
}];
const GRAPH_QUIZ = [
 {q:"Le coefficient (i ; j) de M³ vaut 2. Cela signifie…", opts:["qu'il existe 2 chemins de longueur 3 de i à j","qu'il y a 3 arcs de i à j","qu'il existe 3 chemins de longueur 2","que i et j sont au niveau 2"], a:0, ex:"Mᵏ compte les chemins de longueur k."},
 {q:"Un graphe a 6 sommets. Quelle est la dimension de sa matrice d'adjacence ?", opts:["6 × 6","6 × 1","12 × 12","36 × 36"], a:0, ex:"Une ligne et une colonne par sommet."},
 {q:"Que donne la somme des coefficients de la ligne i de la matrice d'adjacence ?", opts:["le nombre de successeurs de i","le nombre de prédécesseurs de i","le niveau de i","le nombre de circuits"], a:0, ex:"La ligne i liste les arcs qui partent de i."},
 {q:"Chantier du robot (sujet 2016) : quelle est la durée minimale du projet ?", opts:["9 jours","16 jours","8 jours","10 jours"], a:0, ex:"Le chemin critique D → C → F → G (ou D → E → F → G) dure 3 + 1 + 4 + 1 = 9 jours."},
 {q:"Chantier du robot : quelle est la marge totale de la tâche A ?", opts:["2 jours","0 jour","1 jour","5 jours"], a:0, ex:"A : au plus tôt 0, au plus tard 2."},
 {q:"Chantier du robot : quelle est la marge libre de A ?", opts:["0 jour","2 jours","1 jour","3 jours"], a:0, ex:"B commence au plus tôt à 1 = 0 + 1 : le moindre retard de A décale B."},
 {q:"Les tâches critiques sont celles dont…", opts:["la marge totale est nulle","la durée est la plus longue","le niveau est 0","la marge libre est maximale"], a:0, ex:"Le moindre retard sur l'une d'elles retarde tout le projet."},
 {q:"Chantier du robot : quelle est la date au plus tôt de la tâche F ?", opts:["4","3","5","8"], a:0, ex:"F suit C (3 + 1 = 4) et E (3 + 1 = 4) : max = 4."},
 {q:"Qu'est-ce qu'une boucle ?", opts:["un arc d'un sommet vers lui-même","un circuit de longueur 3","un sommet sans successeur","un chemin qui passe par tous les sommets"], a:0, ex:"Elle apparaît sur la diagonale de la matrice d'adjacence."},
 {q:"Pourquoi l'algorithme des niveaux exige-t-il un graphe sans circuit ?", opts:["Sinon des sommets auraient toujours un prédécesseur et ne seraient jamais classés","Car la matrice ne serait pas carrée","Car les durées seraient négatives","Il ne l'exige pas"], a:0, ex:"Dans un circuit, chaque sommet attend le précédent : on tourne en rond."},
];

/* ---------- Suites ---------- */
function suiteSim(root, def){ root.innerHTML=`<div class="row"><label>Type <select class="st"><option value="a">arithmétique</option><option value="g">géométrique</option></select></label><label>u₀ = <input type="number" class="s0" style="width:90px"></label><label class="rl">r = <input type="number" class="sr" step="any" style="width:80px"></label><label>n = <input type="number" class="sn" min="0" max="60" style="width:70px"></label></div><div class="so"></div>`;
  const st=root.querySelector('.st'); st.value=def.t; root.querySelector('.s0').value=def.u0; root.querySelector('.sr').value=def.r; root.querySelector('.sn').value=def.n;
  const paint=()=>{ const t=st.value, u0=$v(root,'.s0'), r=$v(root,'.sr'), n=Math.max(0,Math.min(60,Math.round($v(root,'.sn')))); root.querySelector('.rl').firstChild.textContent=t==='a'?'r = ':'q = ';
    if(![u0,r,n].every(Number.isFinite)) return; const u=k=>t==='a'?u0+k*r:u0*r**k; const un=u(n); const S=t==='a'?(n+1)*(u0+un)/2:(r===1?(n+1)*u0:u0*(1-r**(n+1))/(1-r));
    const terms=Array.from({length:Math.min(n+1,16)},(_,k)=>u(k)); const mx=Math.max(...terms.map(Math.abs))||1;
    root.querySelector('.so').innerHTML=`<p class="mono" style="font-size:16px">${t==='a'?`u<sub>n</sub> = u₀ + n·r = ${fmt(u0)} + n × ${fmt(r)}`:`u<sub>n</sub> = u₀ × qⁿ = ${fmt(u0)} × ${fmt(r)}ⁿ`}<br>u<sub>${n}</sub> = <b>${fmt(un,3)}</b></p>
      <div class="out"><div><b>Somme u₀ + … + u<sub>${n}</sub> (${n+1} termes)</b><span>${fmt(S,3)}</span></div><div><b>Formule</b><span style="font-size:14px">${t==='a'?'(nb de termes) × (1er + dernier) / 2':'1er × (1 − q<sup>nb termes</sup>) / (1 − q)'}</span></div></div>
      <div style="display:flex;align-items:flex-end;gap:4px;height:120px;margin-top:12px">${terms.map((v,k)=>`<div title="u${k} = ${fmt(v,3)}" style="flex:1;background:${k===n?'var(--g2)':'var(--acc)'};opacity:.85;height:${Math.max(2,Math.abs(v)/mx*110)}px;border-radius:4px 4px 0 0"></div>`).join('')}</div><div class="muted">${terms.length<n+1?'(les 16 premiers termes sont représentés)':'termes u₀ à u'+n}</div>`; };
  root.querySelectorAll('input,select').forEach(i=>i.oninput=paint); st.onchange=paint; paint(); }
const SUITES = [
{ title:"Suites arithmétiques", html:`
  <div class="def"><b>Définition</b>(u<sub>n</sub>) est <b>arithmétique de raison r</b> si on passe d'un terme au suivant en <b>ajoutant r</b> : u<sub>n+1</sub> = u<sub>n</sub> + r.<br>• Terme général : <span class="big">u<sub>n</sub> = u₀ + n·r</span> &nbsp;(ou u<sub>n</sub> = u<sub>p</sub> + (n − p)·r)<br>• Somme de termes consécutifs : <b>(nombre de termes) × (premier + dernier) / 2</b>.</div>
  <p>Exemple (sujet BTS SIO 2016) : la résistance d'un bâtiment vaut R₀ = 5 000 et augmente de 1 000 à chaque niveau, donc R<sub>n</sub> = 5 000 + 1 000n et R₂₀ = 25 000.</p>
  <div class="lab"><div class="labt">🧪 Simulateur</div><div class="sim"></div></div>`,
  init(el){ suiteSim(el.querySelector('.sim'),{t:'a',u0:5000,r:1000,n:20}); },
  check:{q:"u₀ = 5 et r = 3. Que vaut u₁₀ ?", opts:["35","38","30","53"], a:0, ex:"u₁₀ = 5 + 10 × 3 = 35."}
},
{ title:"Suites géométriques", html:`
  <div class="def"><b>Définition</b>(u<sub>n</sub>) est <b>géométrique de raison q</b> si on passe d'un terme au suivant en <b>multipliant par q</b> : u<sub>n+1</sub> = q·u<sub>n</sub>.<br>• Terme général : <span class="big">u<sub>n</sub> = u₀ × qⁿ</span><br>• Somme de termes consécutifs : <b>premier terme × (1 − q<sup>nombre de termes</sup>) / (1 − q)</b>, pour q ≠ 1.<br>• Variations (u₀ &gt; 0) : croissante si q &gt; 1, décroissante si 0 &lt; q &lt; 1.</div>
  <div class="def"><b>Pourcentages</b>Augmenter de t % revient à multiplier par <b>1 + t/100</b>, et diminuer de t % à multiplier par <b>1 − t/100</b>. Une évolution à taux constant donne donc une suite géométrique.</div>
  <p>Exemple (sujet 2016) : le coût pour passer au niveau suivant vaut C₀ = 450 pièces et est multiplié par 1,5 à chaque niveau, donc C<sub>n</sub> = 450 × 1,5ⁿ et C₁₉ ≈ 997 577.</p>
  <div class="lab"><div class="labt">🧪 Simulateur</div><div class="sim"></div></div>`,
  init(el){ suiteSim(el.querySelector('.sim'),{t:'g',u0:450,r:1.5,n:19}); },
  check:{q:"Un loyer augmente de 3 % par an. Par combien le multiplie-t-on chaque année ?", opts:["1,03","0,03","1,3","0,97"], a:0, ex:"+3 % correspond à un coefficient multiplicateur de 1 + 3/100 = 1,03."}
},
{ title:"Algorithme de seuil", html:`
  <p>Question type : « <b>à partir de quel rang</b> la suite dépasse-t-elle un seuil S ? ». On peut la résoudre avec un <b>algorithme</b> (une boucle « tant que ») ou avec le <b>logarithme</b> (voir le chapitre Fonctions).</p>
  <pre class="mono" style="background:#f3efe4;padding:12px;border-radius:10px;overflow:auto">u = u0
n = 0
while u &lt; S:      # tant qu'on n'a pas atteint le seuil
    u = u * q     # terme suivant
    n = n + 1
print(n)</pre>
  <div class="lab"><div class="labt">🧪 Exécute l'algorithme</div><div class="row"><label>u₀ = <input type="number" class="a0" value="1000" style="width:90px"></label><label>q = <input type="number" class="aq" value="1.08" step="0.01" style="width:80px"></label><label>Seuil S = <input type="number" class="as" value="2000" style="width:100px"></label></div><div class="ao"></div></div>
  <p class="muted">Exemple : 1 000 abonnés et +8 % par mois. Le nombre d'abonnés double au bout de 10 mois (1,08⁹ ≈ 1,999 est encore un peu inférieur à 2).</p>`,
  init(el){ const paint=()=>{ const u0=$v(el,'.a0'), q=$v(el,'.aq'), S=$v(el,'.as'); const o=el.querySelector('.ao');
      if(!(u0>0&&q>1&&S>0)){ o.innerHTML='<i>Choisis u₀ &gt; 0 et q &gt; 1.</i>'; return; } let u=u0,n=0; const rows=[[0,u]]; while(u<S&&n<500){ u*=q; n++; rows.push([n,u]); }
      const show=rows.length>12?[...rows.slice(0,5),null,...rows.slice(-5)]:rows;
      o.innerHTML=`<table class="tt"><tr><th>n</th><th>u</th><th>u &lt; S ?</th></tr>${show.map(r=>r?`<tr class="${r[0]===n?'cur':''}"><td>${r[0]}</td><td>${fmt(r[1],2)}</td><td>${r[1]<S?'oui → on continue':'<b>non → on s\'arrête</b>'}</td></tr>`:'<tr><td colspan="3">…</td></tr>').join('')}</table><p>L'algorithme affiche <b>n = ${n}</b>.</p>`; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"Dans l'algorithme de seuil, la boucle s'arrête quand…", opts:["u atteint ou dépasse S","n atteint S","u devient négatif","q dépasse 1"], a:0, ex:"La condition « u < S » devient fausse, et n est le premier rang où u ≥ S."}
}];
const SUITES_QUIZ = [
 {q:"u₀ = 2 et q = 3 (suite géométrique). Que vaut u₄ ?", opts:["162","54","14","24"], a:0, ex:"2 × 3⁴ = 2 × 81 = 162."},
 {q:"Sujet 2016 : R₀ = 5 000 et r = 1 000. Que vaut R₂₀ ?", opts:["25 000","20 000","105 000","26 000"], a:0, ex:"5 000 + 20 × 1 000 = 25 000."},
 {q:"Une baisse de 20 % correspond à une multiplication par…", opts:["0,8","0,2","1,2","−0,2"], a:0, ex:"1 − 20/100 = 0,8."},
 {q:"Que vaut 1 + 2 + 3 + … + 100 ?", opts:["5 050","5 000","10 100","4 950"], a:0, ex:"100 termes × (1 + 100) / 2 = 5 050."},
 {q:"u₀ = 10 et q = 0,9. La suite est…", opts:["décroissante","croissante","constante","alternée"], a:0, ex:"0 < q < 1 avec u₀ > 0 : chaque terme vaut 90 % du précédent."},
 {q:"Que vaut 1 + 2 + 4 + … + 2⁹ ?", opts:["1 023","1 024","512","2 047"], a:0, ex:"10 termes : 1 × (1 − 2¹⁰)/(1 − 2) = 1 023."},
 {q:"u<sub>n+1</sub> = u<sub>n</sub> − 4. La suite est…", opts:["arithmétique de raison −4","géométrique de raison −4","arithmétique de raison 4","ni l'un ni l'autre"], a:0, ex:"On ajoute −4 à chaque étape."},
 {q:"1 000 × 1,08ⁿ ≥ 2 000 : quel est le plus petit n qui convient ?", opts:["10","9","8","12"], a:0, ex:"1,08⁹ ≈ 1,999 < 2 et 1,08¹⁰ ≈ 2,159 ≥ 2."},
 {q:"Sujet 2016 : C₀ = 450 et q = 1,5. Combien coûte au total le passage du niveau 0 au niveau 20 (C₀ + … + C₁₉) ?", opts:["≈ 2 991 831","≈ 997 577","≈ 1 496 000","≈ 4 487 747"], a:0, ex:"450 × (1 − 1,5²⁰)/(1 − 1,5) ≈ 2 991 831."},
 {q:"Sujet 2016 : avec 500 000 pièces, quel niveau peut-on atteindre ?", opts:["le niveau 15","le niveau 20","le niveau 14","le niveau 16"], a:0, ex:"C₀ + … + C₁₄ ≈ 393 205 ≤ 500 000, mais en ajoutant C₁₅ ≈ 197 000 on dépasse."},
];

/* ---------- Probabilités ---------- */
const PROBA = [
{ title:"Probabilités conditionnelles et arbres", html:`
  <div class="def"><b>Probabilité conditionnelle</b>La probabilité de B <b>sachant</b> A (avec P(A) ≠ 0) est <span class="big">P<sub>A</sub>(B) = P(A ∩ B) / P(A)</span>, donc P(A ∩ B) = P(A) × P<sub>A</sub>(B).</div>
  <div class="def"><b>Arbre pondéré et probabilités totales</b>• On <b>multiplie</b> les probabilités le long d'un chemin.<br>• La somme des branches issues d'un même nœud vaut 1.<br>• <b>Formule des probabilités totales</b> : P(B) = P(A ∩ B) + P(${ov('A')} ∩ B).<br>• A et B sont <b>indépendants</b> si P(A ∩ B) = P(A) × P(B), c'est-à-dire si P<sub>A</sub>(B) = P(B).</div>
  <p>Exemple (sujet maths approfondies 2017) : A = « utilise internet depuis au moins 5 ans » et B = « répond au sondage ».</p>
  <div class="lab"><div class="labt">🧪 Arbre interactif</div><div class="row"><label>P(A) <input type="range" class="pa" min="0" max="100" value="75"> <b class="va mono"></b></label><label>P<sub>A</sub>(B) <input type="range" class="pb" min="0" max="100" value="60"> <b class="vb mono"></b></label><label>P<sub>${ov('A')}</sub>(B) <input type="range" class="pc" min="0" max="100" value="30"> <b class="vc mono"></b></label></div><div class="tree"></div><div class="po"></div></div>`,
  init(el){ const paint=()=>{ const a=$v(el,'.pa')/100, b=$v(el,'.pb')/100, c=$v(el,'.pc')/100; el.querySelector('.va').textContent=fmt(a); el.querySelector('.vb').textContent=fmt(b); el.querySelector('.vc').textContent=fmt(c);
      const n=(x,y,t)=>`<circle cx="${x}" cy="${y}" r="17" fill="#fff" stroke="var(--acc)" stroke-width="2"/><text x="${x}" y="${y+5}" text-anchor="middle" style="font-weight:700;fill:var(--ink)">${t}</text>`;
      const br=(x1,y1,x2,y2,p)=>`<line x1="${x1+17}" y1="${y1}" x2="${x2-17}" y2="${y2}" stroke="var(--muted)" stroke-width="1.6"/><text x="${(x1+x2)/2}" y="${(y1+y2)/2-6}" text-anchor="middle" style="fill:var(--acc);font-weight:700">${fmt(p,3)}</text>`;
      const leaves=[[a*b,'A ∩ B'],[a*(1-b),`A ∩ ${'B̄'}`],[(1-a)*c,`Ā ∩ B`],[(1-a)*(1-c),`Ā ∩ B̄`]];
      let g=n(40,150,'Ω')+br(40,150,200,75,a)+br(40,150,200,225,1-a)+n(200,75,'A')+n(200,225,ov('A'))+br(200,75,370,35,b)+br(200,75,370,115,1-b)+br(200,225,370,185,c)+br(200,225,370,265,1-c)+n(370,35,'B')+n(370,115,ov('B'))+n(370,185,'B')+n(370,265,ov('B'));
      [35,115,185,265].forEach((y,k)=>g+=`<text x="400" y="${y+5}" style="fill:var(--ink)">P(${leaves[k][1]}) = ${fmt(a===0&&k<2?0:leaves[k][0],4)}</text>`);
      el.querySelector('.tree').innerHTML=`<svg viewBox="0 0 620 300">${g.replace(/<span class="ov">(\w)<\/span>/g,'$1̄')}</svg>`;
      const PB=a*b+(1-a)*c;
      el.querySelector('.po').innerHTML=`<div class="out"><div><b>P(A ∩ B)</b><span>${fmt(a*b,4)}</span></div><div><b>P(B) (probabilités totales)</b><span>${fmt(PB,4)}</span></div><div><b>P<sub>B</sub>(A) = P(A ∩ B)/P(B)</b><span>${PB?fmt(a*b/PB,3):'—'}</span></div><div><b>A et B indépendants ?</b><span>${Math.abs(a*b-a*PB)<1e-9?'oui':'non'}</span></div></div>`; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"P(A) = 0,75 et P<sub>A</sub>(B) = 0,6. Que vaut P(A ∩ B) ?", opts:["0,45","1,35","0,8","0,15"], a:0, ex:"P(A ∩ B) = P(A) × P<sub>A</sub>(B) = 0,75 × 0,6 = 0,45."}
},
{ title:"Variable aléatoire et espérance", html:`
  <div class="def"><b>Définitions</b>Une <b>variable aléatoire</b> X associe un nombre à chaque issue. Sa <b>loi</b> donne P(X = xᵢ) pour chaque valeur (la somme des probabilités vaut 1).<br>• <b>Espérance</b> : E(X) = Σ xᵢ·P(X = xᵢ), la valeur moyenne sur un grand nombre de répétitions.<br>• <b>Variance</b> : V(X) = Σ P(X = xᵢ)(xᵢ − E(X))², et <b>écart-type</b> σ = √V.</div>
  <p>Comme en statistique, avec des probabilités à la place des fréquences. Un jeu est <b>équitable</b> si E(X) = 0, où X est le gain du joueur.</p>
  <div class="lab"><div class="labt">🧪 Gain à un jeu : modifie la loi</div><div class="vt"></div></div>`,
  init(el){ const rows=[[-2,0.6],[5,0.3],[10,0.1]]; const root=el.querySelector('.vt');
    const draw=()=>{ root.innerHTML=`<table class="tt"><tr><th>Gain xᵢ</th>${rows.map((r,k)=>`<td><input type="number" data-k="${k}" data-j="0" value="${r[0]}" style="width:70px"></td>`).join('')}</tr><tr><th>P(X = xᵢ)</th>${rows.map((r,k)=>`<td><input type="number" step="0.05" min="0" max="1" data-k="${k}" data-j="1" value="${r[1]}" style="width:70px"></td>`).join('')}</tr></table><div class="vo"></div>`;
      root.querySelectorAll('input').forEach(i=>i.oninput=()=>{ rows[+i.dataset.k][+i.dataset.j]=parseFloat(i.value)||0; calc(); }); calc(); };
    const calc=()=>{ const s=rows.reduce((t,r)=>t+r[1],0), E=rows.reduce((t,r)=>t+r[0]*r[1],0), V=rows.reduce((t,r)=>t+r[1]*(r[0]-E)**2,0);
      root.querySelector('.vo').innerHTML=`<p class="mono">E(X) = ${rows.map(r=>`(${fmt(r[0])})×${fmt(r[1])}`).join(' + ')} = <b>${fmt(E,3)}</b></p><div class="out"><div><b>Somme des probas</b><span style="color:${Math.abs(s-1)<1e-9?'var(--ok)':'var(--ko)'}">${fmt(s,3)}</span></div><div><b>E(X)</b><span>${fmt(E,3)}</span></div><div><b>σ(X)</b><span>${fmt(Math.sqrt(V),3)}</span></div><div><b>Jeu…</b><span>${Math.abs(E)<1e-9?'équitable':E>0?'favorable au joueur':'défavorable au joueur'}</span></div></div>${Math.abs(s-1)>1e-9?'<p style="color:var(--ko)">⚠ La somme des probabilités doit valoir 1.</p>':''}`; };
    draw(); },
  check:{q:"X prend les valeurs 0 et 10 avec P(X = 10) = 0,2. Que vaut E(X) ?", opts:["2","5","10","0,2"], a:0, ex:"E(X) = 0 × 0,8 + 10 × 0,2 = 2."}
},
{ title:"La loi binomiale", html:`
  <div class="def"><b>Schéma de Bernoulli → loi binomiale</b>On répète <b>n fois</b>, de façon <b>identique et indépendante</b>, une épreuve à <b>deux issues</b> (succès de probabilité p, ou échec). Le nombre X de succès suit la <b>loi binomiale B(n ; p)</b>.<br>• P(X = k) = C(n, k) · pᵏ · (1 − p)<sup>n−k</sup> (on la calcule à la calculatrice)<br>• <b>E(X) = np</b> &nbsp;•&nbsp; <b>V(X) = np(1 − p)</b> &nbsp;•&nbsp; σ = √(np(1 − p))</div>
  <p><b>Rédaction attendue</b> : « On répète n = … fois de manière identique et indépendante une épreuve à deux issues dont le succès « … » a pour probabilité p = …. X compte le nombre de succès, donc X suit la loi B(n ; p). »</p>
  <div class="lab"><div class="labt">🧪 Loi binomiale</div><div class="row"><label>n = <input type="number" class="bn" value="10" min="1" max="2000" style="width:80px"></label><label>p = <input type="number" class="bp" value="0.3" step="0.05" min="0" max="1" style="width:80px"></label><label>k = <input type="number" class="bk" value="2" min="0" style="width:80px"></label><select class="bm"><option value="eq">P(X = k)</option><option value="le">P(X ≤ k)</option><option value="ge">P(X ≥ k)</option></select></div><div class="bc"></div><div class="bo"></div></div>
  <p class="muted">Sujet 2017 : n = 2 000 et p = 0,2 donnent P(X ≤ 385) ≈ 0,21. Essaie-le !</p>`,
  init(el){ const paint=()=>{ const n=Math.max(1,Math.min(2000,Math.round($v(el,'.bn')))), p=Math.min(1,Math.max(0,$v(el,'.bp'))), k=Math.round($v(el,'.bk')), m=el.querySelector('.bm').value; if(![n,p,k].every(Number.isFinite)) return;
      const E=n*p, sd=Math.sqrt(n*p*(1-p)); const lo=Math.max(0,Math.floor(E-4.5*sd)-1), hi=Math.min(n,Math.ceil(E+4.5*sd)+1); const lo2=Math.min(lo,Math.max(0,k)), hi2=Math.max(hi,Math.min(n,k)); const xs=[]; for(let i=lo2;i<=hi2;i++) xs.push(i);
      const vals=xs.map(i=>binPmf(n,p,i)), mx=Math.max(...vals)||1, inS=i=>m==='eq'?i===k:m==='le'?i<=k:i>=k;
      const W=640,H=180,bw=(W-40)/xs.length; let g=''; xs.forEach((x,i)=>{ const h=vals[i]/mx*(H-30); g+=`<rect x="${20+i*bw+bw*0.1}" y="${H-20-h}" width="${Math.max(1,bw*0.8)}" height="${h}" fill="${inS(x)?'var(--g2)':'var(--acc)'}" opacity="${inS(x)?1:.45}"><title>P(X=${x}) = ${fmt(vals[i],4)}</title></rect>`; if(xs.length<=30||x%Math.ceil(xs.length/15)===0) g+=`<text x="${20+i*bw+bw/2}" y="${H-5}" text-anchor="middle">${x}</text>`; });
      el.querySelector('.bc').innerHTML=`<svg viewBox="0 0 ${W} ${H}">${g}</svg>`;
      const P=m==='eq'?binPmf(n,p,k):m==='le'?binCdf(n,p,k):1-binCdf(n,p,k-1);
      el.querySelector('.bo').innerHTML=`<div class="out"><div><b>${m==='eq'?'P(X = '+k+')':m==='le'?'P(X ≤ '+k+')':'P(X ≥ '+k+')'}</b><span>${fmt(P,4)}</span></div><div><b>E(X) = np</b><span>${fmt(E,3)}</span></div><div><b>V(X) = np(1−p)</b><span>${fmt(n*p*(1-p),3)}</span></div><div><b>σ(X)</b><span>${fmt(sd,3)}</span></div></div>`; };
    el.querySelectorAll('input,select').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"X suit B(10 ; 0,3). Que vaut E(X) ?", opts:["3","0,3","7","2,1"], a:0, ex:"E(X) = np = 10 × 0,3 = 3."}
},
{ title:"La loi normale", html:`
  <div class="def"><b>Loi normale N(μ ; σ²)</b>C'est une loi <b>continue</b>, dont la courbe est « en cloche » et symétrique autour de la moyenne <b>μ</b>. L'écart-type σ règle sa largeur. Une probabilité P(a ≤ X ≤ b) est une <b>aire sous la courbe</b> (calculatrice : NormalFRép ou normalcdf).<br>• P(X = a) = 0 &nbsp;•&nbsp; P(X ≤ μ) = 0,5<br>• P(μ − σ ≤ X ≤ μ + σ) ≈ <b>0,68</b> &nbsp;•&nbsp; P(μ − 2σ ≤ X ≤ μ + 2σ) ≈ <b>0,95</b> &nbsp;•&nbsp; P(μ − 3σ ≤ X ≤ μ + 3σ) ≈ <b>0,997</b></div>
  <p>Sujet 2017 : le temps de réponse T suit N(12,5 ; 1,8²). Pour P(12,5 − a ≤ T ≤ 12,5 + a) = 0,95, on trouve a ≈ 1,96 × 1,8 ≈ 3,5. Et P(T ≥ 15) ≈ 0,08.</p>
  <div class="lab"><div class="labt">🧪 Aire sous la courbe</div><div class="row"><label>μ = <input type="number" class="nm" value="12.5" step="0.1" style="width:80px"></label><label>σ = <input type="number" class="ns" value="1.8" step="0.1" min="0.1" style="width:80px"></label><label>a = <input type="number" class="na" value="15" step="0.1" style="width:80px"></label><label>b = <input type="number" class="nb2" value="100" step="0.1" style="width:80px"></label></div><div class="row" style="margin-top:6px"><button class="btn sm" data-k="1">μ ± σ</button><button class="btn sm" data-k="2">μ ± 2σ</button><button class="btn sm" data-k="3">μ ± 3σ</button></div><div class="nc"></div><div class="no"></div></div>`,
  init(el){ const paint=()=>{ const m=$v(el,'.nm'), s=$v(el,'.ns'), a=$v(el,'.na'), b=$v(el,'.nb2'); if(![m,s,a,b].every(Number.isFinite)||s<=0) return;
      const W=640,H=200, x0=m-4*s, x1=m+4*s, X=x=>20+(x-x0)/(x1-x0)*(W-40), f=x=>Math.exp(-(((x-m)/s)**2)/2), Y=y=>H-28-y*(H-45);
      let pts=[], area=[]; for(let i=0;i<=200;i++){ const x=x0+(x1-x0)*i/200; pts.push(`${X(x)},${Y(f(x))}`); if(x>=Math.min(a,b)&&x<=Math.max(a,b)) area.push(`${X(x)},${Y(f(x))}`); }
      const lo=Math.max(Math.min(a,b),x0), hi=Math.min(Math.max(a,b),x1); let g='';
      if(hi>lo&&area.length) g+=`<polygon points="${X(lo)},${Y(0)} ${X(lo)},${Y(f(lo))} ${area.join(' ')} ${X(hi)},${Y(f(hi))} ${X(hi)},${Y(0)}" fill="var(--acc)" opacity=".3"/>`;
      g+=`<polyline points="${pts.join(' ')}" fill="none" stroke="var(--acc)" stroke-width="2.5"/><line x1="20" x2="${W-20}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--muted)"/>`;
      for(let k=-3;k<=3;k++) g+=`<line x1="${X(m+k*s)}" x2="${X(m+k*s)}" y1="${Y(0)}" y2="${Y(0)+5}" stroke="var(--muted)"/><text x="${X(m+k*s)}" y="${H-6}" text-anchor="middle">${k===0?'μ':(k>0?'μ+':'μ−')+(Math.abs(k)>1?Math.abs(k):'')+(k?'σ':'')}</text>`;
      el.querySelector('.nc').innerHTML=`<svg viewBox="0 0 ${W} ${H}">${g}</svg>`;
      const P=Phi(Math.max(a,b),m,s)-Phi(Math.min(a,b),m,s);
      el.querySelector('.no').innerHTML=`<div class="out"><div><b>P(${fmt(Math.min(a,b),2)} ≤ X ≤ ${fmt(Math.max(a,b),2)})</b><span>${fmt(P,4)}</span></div></div>`; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint);
    el.querySelectorAll('[data-k]').forEach(btn=>btn.onclick=()=>{ const m=$v(el,'.nm'), s=$v(el,'.ns'), k=+btn.dataset.k; el.querySelector('.na').value=+(m-k*s).toFixed(4); el.querySelector('.nb2').value=+(m+k*s).toFixed(4); paint(); }); paint(); },
  check:{q:"X suit N(μ ; σ²). Que vaut environ P(μ − 2σ ≤ X ≤ μ + 2σ) ?", opts:["0,95","0,68","0,997","0,5"], a:0, ex:"C'est la règle 68 – 95 – 99,7."}
}];
const PROBA_QUIZ = [
 {q:"Quelle est la formule de P<sub>A</sub>(B) ?", opts:["P(A ∩ B) / P(A)","P(A ∩ B) / P(B)","P(A) × P(B)","P(A) + P(B)"], a:0, ex:"C'est la définition, avec P(A) ≠ 0."},
 {q:"Sujet 2017 : P(A) = 0,75, P<sub>A</sub>(B) = 0,6 et P<sub>Ā</sub>(B) = 0,3. Que vaut P(B) ?", opts:["0,525","0,45","0,9","0,075"], a:0, ex:"0,75 × 0,6 + 0,25 × 0,3 = 0,45 + 0,075 = 0,525."},
 {q:"Avec les mêmes données, que vaut P<sub>B</sub>(A) (arrondi au millième) ?", opts:["0,857","0,45","0,6","0,75"], a:0, ex:"0,45 / 0,525 ≈ 0,857."},
 {q:"A et B sont indépendants si…", opts:["P(A ∩ B) = P(A) × P(B)","P(A ∩ B) = 0","P(A) + P(B) = 1","P<sub>A</sub>(B) = P(A)"], a:0, ex:"C'est la définition de l'indépendance."},
 {q:"Laquelle de ces conditions N'EST PAS nécessaire pour appliquer la loi binomiale ?", opts:["la probabilité de succès vaut 0,5","des épreuves identiques","des épreuves indépendantes","deux issues par épreuve"], a:0, ex:"p peut prendre n'importe quelle valeur entre 0 et 1."},
 {q:"X suit B(2 000 ; 0,2). Que vaut V(X) ?", opts:["320","400","17,9","0,16"], a:0, ex:"V = np(1 − p) = 2 000 × 0,2 × 0,8 = 320."},
 {q:"X suit B(5 ; 0,1). Que vaut P(X = 0) environ ?", opts:["0,59","0,1","0","0,5"], a:0, ex:"P(X = 0) = 0,9⁵ ≈ 0,590."},
 {q:"T suit N(12,5 ; 1,8²). Que vaut P(T ≤ 12,5) ?", opts:["0,5","0,68","1","0"], a:0, ex:"La courbe est symétrique autour de la moyenne."},
 {q:"T suit N(12,5 ; 1,8²). Que vaut environ P(T ≥ 15) ?", opts:["0,08","0,92","0,5","0,25"], a:0, ex:"À la calculatrice : P(T ≥ 15) ≈ 0,082."},
 {q:"Gains −2, 5 et 10 avec les probabilités 0,6, 0,3 et 0,1 : que vaut l'espérance ?", opts:["1,3","4,3","−1,2","13"], a:0, ex:"−1,2 + 1,5 + 1 = 1,3."},
 {q:"Pour une loi continue (normale), que vaut P(X = 3) ?", opts:["0","f(3)","0,5","on ne peut pas savoir"], a:0, ex:"L'aire sous la courbe au-dessus d'un seul point est nulle."},
];

/* ---------- Fonctions & intégrales ---------- */
const f3 = x=>x**3-3*x+1, df3 = x=>3*x*x-3;
const gL = x=>0.5*x+Math.log(x), GL = x=>0.25*x*x+x*Math.log(x)-x;
function plotFn(f, x0, x1, opts={}){ const W=640,H=opts.H||260; let ys=[]; for(let i=0;i<=200;i++) ys.push(f(x0+(x1-x0)*i/200)); const y0=opts.y0??Math.min(...ys), y1=opts.y1??Math.max(...ys);
  const X=x=>40+(x-x0)/(x1-x0)*(W-60), Y=y=>H-25-(y-y0)/(y1-y0)*(H-45); let g='';
  if(y0<0&&y1>0) g+=`<line x1="40" x2="${W-20}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--muted)"/>`; if(x0<0&&x1>0) g+=`<line x1="${X(0)}" x2="${X(0)}" y1="15" y2="${H-25}" stroke="var(--muted)"/>`;
  const step=opts.xstep||1; for(let x=Math.ceil(x0/step)*step;x<=x1+1e-9;x+=step) g+=`<text x="${X(x)}" y="${H-8}" text-anchor="middle">${fmt(x,1)}</text>`;
  return {W,H,X,Y,g,path:ys.map((y,i)=>`${X(x0+(x1-x0)*i/200)},${Y(y)}`).join(' ')}; }
const FONC = [
{ title:"Dérivées et sens de variation", html:`
  <div class="grid2">
    <div class="prop"><b>Fonctions usuelles</b><span class="mono">(xⁿ)' = n·xⁿ⁻¹<br>(1/x)' = −1/x²<br>(eˣ)' = eˣ &nbsp; (ln x)' = 1/x</span></div>
    <div class="prop"><b>Opérations</b><span class="mono">(u + v)' = u' + v'<br>(ku)' = k·u'<br>(uv)' = u'v + uv'</span></div>
    <div class="prop"><b>Quotient et composées</b><span class="mono">(u/v)' = (u'v − uv')/v²<br>(eᵘ)' = u'·eᵘ<br>(ln u)' = u'/u</span></div>
  </div>
  <div class="def"><b>Variations</b>Si f'(x) &gt; 0 sur un intervalle, f y est <b>croissante</b>. Si f'(x) &lt; 0, f y est <b>décroissante</b>. Méthode : calculer f', étudier son <b>signe</b>, dresser le <b>tableau de variations</b>. f'(a) est le <b>coefficient directeur de la tangente</b> au point d'abscisse a.</div>
  <p>Exemple : f(x) = x³ − 3x + 1, donc f'(x) = 3x² − 3 = 3(x − 1)(x + 1). f' s'annule en −1 et en 1.</p>
  <table class="tt"><tr><th>x</th><td>−2,5</td><td></td><td>−1</td><td></td><td>1</td><td></td><td>2,5</td></tr><tr><th>f'(x)</th><td></td><td>+</td><td>0</td><td>−</td><td>0</td><td>+</td><td></td></tr><tr><th>f(x)</th><td>−7,125</td><td>↗</td><td><b>3</b></td><td>↘</td><td><b>−1</b></td><td>↗</td><td>9,125</td></tr></table>
  <div class="lab"><div class="labt">🧪 Déplace le point : la pente de la tangente vaut f'(a)</div><label>a = <input type="range" class="ta" min="-2.4" max="2.4" step="0.05" value="1.6"> <b class="tv mono"></b></label><div class="tp"></div></div>`,
  init(el){ const paint=()=>{ const a=$v(el,'.ta'); const P=plotFn(f3,-2.5,2.5,{y0:-8,y1:10,xstep:0.5}); const m=df3(a), b=f3(a)-m*a;
      const t=x=>m*x+b; let g=P.g+`<polyline points="${P.path}" fill="none" stroke="var(--acc)" stroke-width="2.5"/>`;
      g+=`<line x1="${P.X(a-1)}" y1="${P.Y(t(a-1))}" x2="${P.X(a+1)}" y2="${P.Y(t(a+1))}" stroke="var(--g2)" stroke-width="2.5"/><circle cx="${P.X(a)}" cy="${P.Y(f3(a))}" r="6" fill="var(--g2)"/>`;
      el.querySelector('.tp').innerHTML=`<svg viewBox="0 0 ${P.W} ${P.H}">${g}</svg>`;
      el.querySelector('.tv').innerHTML=`${fmt(a,2)} → f'(a) = ${fmt(m,2)} ${m>0.001?'(> 0 : f croissante ici)':m<-0.001?'(< 0 : f décroissante ici)':'(tangente horizontale)'}`; };
    el.querySelector('.ta').oninput=paint; paint(); },
  check:{q:"Quelle est la dérivée de f(x) = 4x³ − 2x + 7 ?", opts:["12x² − 2","12x² − 2x","4x² − 2","12x³ − 2"], a:0, ex:"(4x³)' = 12x², (−2x)' = −2, et la dérivée d'une constante est nulle."}
},
{ title:"Exponentielle et logarithme", html:`
  <div class="grid2">
    <div class="prop"><b>Exponentielle</b><span class="mono">e⁰ = 1, eˣ &gt; 0<br>e<sup>a+b</sup> = eᵃ·eᵇ<br>(eᵃ)ⁿ = e<sup>na</sup></span></div>
    <div class="prop"><b>Logarithme népérien (x &gt; 0)</b><span class="mono">ln 1 = 0, ln e = 1<br>ln(ab) = ln a + ln b<br>ln(aⁿ) = n·ln a</span></div>
    <div class="prop"><b>Fonctions réciproques</b><span class="mono">ln(eˣ) = x<br>e<sup>ln x</sup> = x (x &gt; 0)<br>eˣ = k ⇔ x = ln k (k &gt; 0)</span></div>
    <div class="prop"><b>Limites utiles</b><span class="mono">eˣ → +∞ et ln x → +∞ (x → +∞)<br>eˣ → 0 (x → −∞)<br>ln x → −∞ (x → 0⁺)</span></div>
  </div>
  <p><b>Application aux seuils</b> : pour résoudre u₀·qⁿ ≥ S (q &gt; 1), on applique ln, qui est croissante : n·ln q ≥ ln(S/u₀), donc <b>n ≥ ln(S/u₀) / ln q</b>. Si 0 &lt; q &lt; 1, ln q &lt; 0 et <b>le sens de l'inégalité change</b> quand on divise.</p>
  <div class="lab"><div class="labt">🧪 Résolution par le logarithme</div><div class="row"><label>u₀ = <input type="number" class="l0" value="1000" style="width:90px"></label><label>q = <input type="number" class="lq" value="1.08" step="0.01" style="width:80px"></label><label>S = <input type="number" class="ls" value="2000" style="width:100px"></label></div><div class="lo"></div></div>`,
  init(el){ const paint=()=>{ const u0=$v(el,'.l0'), q=$v(el,'.lq'), S=$v(el,'.ls'); const o=el.querySelector('.lo'); if(!(u0>0&&q>0&&q!==1&&S>0)){ o.innerHTML='<i>Choisis u₀ > 0, S > 0 et q > 0, q ≠ 1.</i>'; return; }
      const up=q>1, r=Math.log(S/u0)/Math.log(q), n=Math.max(0,Math.ceil(r-1e-12));
      o.innerHTML=`<p class="mono" style="line-height:2">${fmt(u0)} × ${fmt(q)}ⁿ ${up?'≥':'≤'} ${fmt(S)}<br>⇔ ${fmt(q)}ⁿ ${up?'≥':'≤'} ${fmt(S/u0,4)}<br>⇔ n × ln(${fmt(q)}) ${up?'≥':'≤'} ln(${fmt(S/u0,4)}) &nbsp;<span class="muted">(ln est croissante)</span><br>⇔ n ≥ ln(${fmt(S/u0,4)}) / ln(${fmt(q)}) ${up?'':'<span class="muted">(ln q &lt; 0 : on change le sens)</span>'}<br>⇔ n ≥ ${fmt(r,4)} &nbsp;→ <b>n = ${n}</b></p>`; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"Quelle est la solution de eˣ = 5 ?", opts:["x = ln 5","x = e⁵","x = 5/e","x = ln(5)/e"], a:0, ex:"ln et exp sont réciproques : x = ln 5 ≈ 1,609."}
},
{ title:"Résoudre f(x) = k : solution unique et dichotomie", html:`
  <div class="def"><b>Théorème (valeurs intermédiaires, cas strictement monotone)</b>Si f est <b>continue</b> et <b>strictement monotone</b> sur [a ; b], et si k est compris entre f(a) et f(b), alors l'équation f(x) = k a <b>une unique solution</b> α dans [a ; b].</div>
  <p>Pour encadrer α, on utilise la <b>dichotomie</b> : on coupe l'intervalle en deux, on garde la moitié où se trouve la solution, et on recommence. Chaque étape divise la largeur par 2.</p>
  <p>Exemple : g(x) = 0,5x + ln x est strictement croissante sur [1 ; 8], car g'(x) = 0,5 + 1/x &gt; 0. On cherche α tel que g(α) = k.</p>
  <div class="lab"><div class="labt">🧪 Dichotomie pas à pas</div><div class="row"><label>k = <input type="number" class="dk" value="3" step="0.1" style="width:80px"></label><button class="btn sm primary dn">Étape suivante</button><button class="btn sm dr">Recommencer</button></div><div class="dt"></div></div>`,
  init(el){ let steps=0; const paint=()=>{ const k=$v(el,'.dk'); const o=el.querySelector('.dt'); if(!(k>gL(1)&&k<gL(8))){ o.innerHTML=`<i>Choisis k entre g(1) = 0,5 et g(8) ≈ ${fmt(gL(8),3)}.</i>`; return; }
      let a=1,b=8; const rows=[]; for(let s=0;s<steps;s++){ const m=(a+b)/2, v=gL(m); rows.push([a,b,m,v,v<k]); if(v<k) a=m; else b=m; }
      o.innerHTML=`<table class="tt"><tr><th>a</th><th>b</th><th>m = (a+b)/2</th><th>g(m)</th><th>Décision</th></tr>${rows.map(r=>`<tr><td>${fmt(r[0],4)}</td><td>${fmt(r[1],4)}</td><td>${fmt(r[2],4)}</td><td>${fmt(r[3],4)}</td><td>${r[4]?'g(m) < k → a = m':'g(m) ≥ k → b = m'}</td></tr>`).join('')}</table><p>Encadrement actuel : <b>${fmt(a,4)} ≤ α ≤ ${fmt(b,4)}</b> (largeur ${fmt(b-a,4)})</p>`; };
    el.querySelector('.dn').onclick=()=>{steps=Math.min(steps+1,20); paint();}; el.querySelector('.dr').onclick=()=>{steps=0; paint();}; el.querySelector('.dk').oninput=()=>{steps=0; paint();}; paint(); },
  check:{q:"Après 10 étapes de dichotomie sur un intervalle de largeur 8, quelle est la largeur de l'encadrement ?", opts:["8/2¹⁰ ≈ 0,008","8/10 = 0,8","8 − 10","0,1"], a:0, ex:"La largeur est divisée par 2 à chaque étape."}
},
{ title:"Intégrale, aire et valeur moyenne", html:`
  <div class="def"><b>Intégrale</b>Si F est une <b>primitive</b> de f (F' = f), alors <span class="big">∫ₐᵇ f(x) dx = F(b) − F(a)</span>.<br>• Si f ≥ 0 sur [a ; b], l'intégrale est l'<b>aire</b> (en unités d'aire) entre la courbe, l'axe des abscisses et les droites x = a et x = b.<br>• <b>Valeur moyenne</b> de f sur [a ; b] : <b>μ = (1/(b − a)) × ∫ₐᵇ f(x) dx</b>.</div>
  <p>Primitives usuelles : xⁿ → xⁿ⁺¹/(n + 1), 1/x → ln x, eˣ → eˣ, et x ln x − x est une primitive de ln x.<br>Exemple : g(x) = 0,5x + ln x a pour primitive G(x) = 0,25x² + x ln x − x.</p>
  <div class="lab"><div class="labt">🧪 Aire sous la courbe de g</div><div class="row"><label>a = <input type="range" class="ia" min="1" max="8" step="0.5" value="1"> <b class="iav mono"></b></label><label>b = <input type="range" class="ib" min="1" max="8" step="0.5" value="5"> <b class="ibv mono"></b></label></div><div class="ip"></div><div class="io"></div></div>
  <p class="muted">Sujet 2017 : on approchait l'aire en remplaçant la courbe par un segment (un <b>trapèze</b>), puis on en déduisait la valeur moyenne. Compare les deux valeurs.</p>`,
  init(el){ const paint=()=>{ let a=$v(el,'.ia'), b=$v(el,'.ib'); if(a>b) [a,b]=[b,a]; el.querySelector('.iav').textContent=fmt(a,1); el.querySelector('.ibv').textContent=fmt(b,1);
      const P=plotFn(gL,1,8,{y0:0,y1:6.5}); let g=P.g; const pts=[]; for(let i=0;i<=100;i++){ const x=a+(b-a)*i/100; pts.push(`${P.X(x)},${P.Y(gL(x))}`); }
      const I=GL(b)-GL(a), T=(b-a)*(gL(a)+gL(b))/2, mu=b>a?I/(b-a):gL(a);
      if(b>a) g+=`<polygon points="${P.X(a)},${P.Y(0)} ${pts.join(' ')} ${P.X(b)},${P.Y(0)}" fill="var(--acc)" opacity=".25"/><line x1="${P.X(a)}" y1="${P.Y(gL(a))}" x2="${P.X(b)}" y2="${P.Y(gL(b))}" stroke="var(--g3)" stroke-width="2" stroke-dasharray="5 4"/><line x1="${P.X(a)}" x2="${P.X(b)}" y1="${P.Y(mu)}" y2="${P.Y(mu)}" stroke="var(--g2)" stroke-width="2.5"/>`;
      g+=`<polyline points="${P.path}" fill="none" stroke="var(--acc)" stroke-width="2.5"/>`;
      el.querySelector('.ip').innerHTML=`<svg viewBox="0 0 ${P.W} ${P.H}">${g}</svg>`;
      el.querySelector('.io').innerHTML=`<p class="mono">∫ g = G(${fmt(a,1)}) − G(${fmt(b,1)})… soit G(b) − G(a) = ${fmt(GL(b),4)} − ${fmt(GL(a),4)} = <b>${fmt(I,4)}</b></p><div class="out"><div><b>Aire exacte</b><span>${fmt(I,3)} u.a.</span></div><div><b style="color:var(--g3)">Approximation par le trapèze</b><span>${fmt(T,3)}</span></div><div><b style="color:var(--g2)">Valeur moyenne μ</b><span>${fmt(mu,3)}</span></div></div>`.replace('G(${fmt(a,1)}) − G(${fmt(b,1)})… soit ','');
      el.querySelector('.io p').innerHTML=`∫<sub>${fmt(a,1)}</sub><sup>${fmt(b,1)}</sup> g(x) dx = G(${fmt(b,1)}) − G(${fmt(a,1)}) = ${fmt(GL(b),4)} − (${fmt(GL(a),4)}) = <b>${fmt(I,4)}</b>`; };
    el.querySelectorAll('input').forEach(i=>i.oninput=paint); paint(); },
  check:{q:"Que vaut ∫₀² 3x² dx ?", opts:["8","12","6","4"], a:0, ex:"Une primitive de 3x² est x³ : 2³ − 0³ = 8."}
}];
const FONC_QUIZ = [
 {q:"Quelle est la dérivée de ln x ?", opts:["1/x","eˣ","x ln x","ln x"], a:0, ex:"C'est une dérivée usuelle, pour x > 0."},
 {q:"Quelle est la dérivée de e<sup>2x</sup> ?", opts:["2e<sup>2x</sup>","e<sup>2x</sup>","2x·e<sup>2x−1</sup>","e²"], a:0, ex:"(eᵘ)' = u'eᵘ avec u = 2x, donc u' = 2."},
 {q:"Quelle est la formule de (uv)' ?", opts:["u'v + uv'","u'v'","u'v − uv'","(u'v − uv')/v²"], a:0, ex:"C'est la formule de dérivation d'un produit."},
 {q:"Si f'(x) > 0 sur un intervalle I, alors f est…", opts:["croissante sur I","positive sur I","décroissante sur I","constante sur I"], a:0, ex:"Le signe de la dérivée donne le sens de variation, pas le signe de f."},
 {q:"ln(a × b) est égal à…", opts:["ln a + ln b","ln a × ln b","ln a − ln b","ln(a + b)"], a:0, ex:"Le logarithme transforme les produits en sommes."},
 {q:"Que vaut ln 1 ?", opts:["0","1","e","n'existe pas"], a:0, ex:"e⁰ = 1, donc ln 1 = 0."},
 {q:"Résoudre 1,5ⁿ ≥ 100 (n entier). Le plus petit n est…", opts:["12","11","67","10"], a:0, ex:"n ≥ ln 100 / ln 1,5 ≈ 11,36, donc n = 12."},
 {q:"Quelle est la valeur moyenne de f sur [a ; b] ?", opts:["(1/(b − a)) ∫ₐᵇ f(x) dx","(f(a) + f(b))/2","∫ₐᵇ f(x) dx","f((a + b)/2)"], a:0, ex:"C'est la définition."},
 {q:"Quelle est une primitive de 1/x sur ]0 ; +∞[ ?", opts:["ln x","−1/x²","eˣ","x ln x"], a:0, ex:"(ln x)' = 1/x."},
 {q:"f est continue, strictement croissante sur [1 ; 8], avec f(1) = 0,5 et f(8) ≈ 6,08. Combien l'équation f(x) = 3 a-t-elle de solutions sur [1 ; 8] ?", opts:["une seule","aucune","deux","une infinité"], a:0, ex:"Théorème des valeurs intermédiaires (cas strictement monotone) : 3 est entre 0,5 et 6,08."},
 {q:"Que vaut ∫₁ᵉ (1/x) dx ?", opts:["1","e","0","e − 1"], a:0, ex:"ln e − ln 1 = 1 − 0 = 1."},
];

/* ---------- Questions de type examen (grand quiz) ---------- */
const EXAM_EXTRA = [
 {ch:'graph', q:"Sujet 2016 (robot) : la tâche A prend 1 jour de retard. Le début d'une autre tâche est-il décalé ?", opts:["Oui, B, car la marge libre de A est nulle","Non, A n'est pas critique","Oui, G","Non, C absorbe le retard"], a:0, ex:"La marge libre de A vaut 0 : B, qui commence au plus tôt au jour 1, est décalé."},
 {ch:'graph', q:"Sujet 2016 (robot) : ce retard d'un jour sur A retarde-t-il la fin du projet ?", opts:["Non, la marge totale de A vaut 2 jours","Oui, d'un jour","Oui, de deux jours","On ne peut pas savoir"], a:0, ex:"Un retard inférieur ou égal à la marge totale ne décale pas la fin."},
 {ch:'graph', q:"Sujet 2016 (robot) : quel est un chemin critique ?", opts:["D → C → F → G","A → B → G","A → C → F → G","D → E → G"], a:0, ex:"3 + 1 + 4 + 1 = 9 jours, avec des marges totales nulles (D → E → F → G convient aussi)."},
 {ch:'num', q:"Sujet 2016 (code de Hamming) : quels sont les trois plus petits entiers naturels congrus à 1 modulo 2 ?", opts:["1, 3 et 5","0, 2 et 4","1, 2 et 3","2, 4 et 6"], a:0, ex:"Ce sont les nombres impairs."},
 {ch:'logic', q:"Sujet 2016 : dire que la fonction de codage est injective, c'est dire que…", opts:["deux mots différents ont des codes différents","tout code provient d'un mot","chaque mot a deux codes","le code est plus long que le mot"], a:0, ex:"C'est la définition de l'injectivité appliquée au codage."},
 {ch:'mat', q:"Code de Hamming : avec G de dimension 4 × 7, quelle est la dimension du code c = mG pour un mot m (1 × 4) ?", opts:["1 × 7","4 × 7","7 × 1","1 × 4"], a:0, ex:"(1 × 4)(4 × 7) = 1 × 7 : 7 bits."},
 {ch:'stats', q:"Sujet 2017 : x = 200, 200, 250, 280, 370 et y = 140, 135, 160, 185, 260. Que vaut environ le coefficient de corrélation ?", opts:["0,99","0,72","−0,99","0,50"], a:0, ex:"À la calculatrice, r ≈ 0,99 : excellent ajustement affine."},
 {ch:'stats', q:"Sujet 2017 : la droite de régression est y ≈ 0,72x − 10,46. Combien de sondages renvoyés estime-t-on pour 500 clients (à la dizaine) ?", opts:["≈ 350","≈ 360","≈ 300","≈ 500"], a:0, ex:"0,72 × 500 − 10,46 ≈ 349,5, soit environ 350 (avec les coefficients exacts, 348)."},
 {ch:'proba', q:"Sujet 2017 : T suit N(12,5 ; 1,8²). Quel a (au dixième) vérifie P(12,5 − a ≤ T ≤ 12,5 + a) = 0,95 ?", opts:["3,5","1,8","1,96","5,4"], a:0, ex:"a ≈ 1,96 × 1,8 ≈ 3,53, soit 3,5 au dixième."},
 {ch:'proba', q:"Sujet 2017 : X suit B(2 000 ; 0,2). Quelle est l'espérance du nombre de questionnaires incomplets ?", opts:["400","200","20","1 600"], a:0, ex:"E(X) = np = 2 000 × 0,2 = 400."},
 {ch:'fonc', q:"Sujet 2017 : pour approcher I = ∫₄⁸ f(x) dx, on remplace la courbe par le segment joignant ses points d'abscisses 4 et 8. Quelle figure obtient-on ?", opts:["un trapèze d'aire 4 × (f(4) + f(8))/2","un rectangle d'aire 8 × f(8)","un triangle d'aire 4 × f(8)","un carré"], a:0, ex:"La largeur est 8 − 4 = 4, et les deux côtés parallèles mesurent f(4) et f(8)."},
 {ch:'suites', q:"Un serveur stocke 120 Go et sa charge augmente de 15 % par an. Quelle suite modélise la charge ?", opts:["géométrique de raison 1,15","arithmétique de raison 15","géométrique de raison 0,15","arithmétique de raison 1,15"], a:0, ex:"Un pourcentage d'augmentation constant donne une suite géométrique."},
 {ch:'bool', q:"Un système d'alarme sonne si le capteur a est actif et (b ou c) est actif. Quelle est l'expression booléenne ?", opts:["a(b + c)","a + bc","abc","a + b + c"], a:0, ex:"« ET » donne un produit, « OU » donne une somme."},
 {ch:'num', q:"Adresse IPv4 : le masque 255.255.255.0 en binaire contient combien de bits à 1 ?", opts:["24","8","32","16"], a:0, ex:"Chaque 255 vaut 11111111 (8 bits), donc 3 × 8 = 24 : c'est un /24."},
 {ch:'num', q:"Combien d'adresses contient un réseau /26 (32 − 26 = 6 bits pour les hôtes) ?", opts:["64","26","32","128"], a:0, ex:"2⁶ = 64 adresses, dont 62 utilisables pour des hôtes."},
 {ch:'num', q:"Comment s'écrit l'octet 192 en binaire ?", opts:["11000000","10100000","11100000","10010000"], a:0, ex:"192 = 128 + 64."},
];
