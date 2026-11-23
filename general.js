/* ==================== Widgets génériques ==================== */
function flashcards(root, cards){
  let order, i, flipped, known, review;
  const start = (idx) => { order = shuffle(idx || cards.map((_,k)=>k)); i=0; flipped=false; known=0; review=[]; paint(); };
  const paint = () => {
    if(i>=order.length){
      root.innerHTML = `<div class="fcend"><b>${known} / ${order.length}</b> cartes sues.</div><div class="row" style="margin-top:8px">${review.length?`<button class="btn sm primary rv">Revoir les ${review.length} carte(s) à retravailler</button>`:''}<button class="btn sm ra">Tout recommencer</button></div>`;
      const rv=root.querySelector('.rv'); if(rv) rv.onclick=()=>start(review.slice()); root.querySelector('.ra').onclick=()=>start(); return; }
    const c = cards[order[i]];
    root.innerHTML = `<div class="muted" style="margin-bottom:6px">Carte ${i+1} / ${order.length} · clique sur la carte pour la retourner</div><div class="fc ${flipped?'back':''}">${flipped?c[1]:c[0]}</div>
      <div class="row" style="margin-top:8px">${flipped?`<button class="btn sm ok">✓ Je savais</button><button class="btn sm ko">↻ À revoir</button>`:`<button class="btn sm primary fl">Retourner</button>`}</div>`;
    root.querySelector('.fc').onclick = () => { flipped=!flipped; paint(); };
    const fl=root.querySelector('.fl'); if(fl) fl.onclick=()=>{ flipped=true; paint(); };
    const ok=root.querySelector('.ok'); if(ok) ok.onclick=()=>{ known++; i++; flipped=false; paint(); };
    const ko=root.querySelector('.ko'); if(ko) ko.onclick=()=>{ review.push(order[i]); i++; flipped=false; paint(); };
  };
  start();
}
function sorter(root, cfg){
  const order = shuffle(cfg.items.map((_,k)=>k)); const ans = {}; const useSel = cfg.cats.length > 4;
  const paint = (check=false) => {
    root.innerHTML = `${cfg.prompt?`<p>${cfg.prompt}</p>`:''}<div class="srt">${order.map(k=>{ const it=cfg.items[k]; const st = check ? (ans[k]===it[1]?'okc':'koc') : '';
      return `<div class="srow ${st}"><div class="stxt">${it[0]}</div><div class="scats">${useSel
        ? `<select data-k="${k}"><option value="">— choisir —</option>${cfg.cats.map((c,j)=>`<option value="${j}" ${ans[k]===j?'selected':''}>${c}</option>`).join('')}</select>`
        : cfg.cats.map((c,j)=>`<button class="btn sm ${ans[k]===j?'primary':''}" data-k="${k}" data-j="${j}">${c}</button>`).join('')}</div>${check&&ans[k]!==it[1]?`<div class="sfix">→ ${cfg.cats[it[1]]}${it[2]?` · ${it[2]}`:''}</div>`:check&&it[2]?`<div class="sfix" style="color:var(--ok)">✓ ${it[2]}</div>`:''}</div>`; }).join('')}</div>
      <div class="row" style="margin-top:10px"><button class="btn sm primary vf">Vérifier</button><button class="btn sm rs">Recommencer</button></div><div class="smsg"></div>`;
    root.querySelectorAll('button[data-j]').forEach(b=>b.onclick=()=>{ ans[+b.dataset.k]=+b.dataset.j; paint(); });
    root.querySelectorAll('select').forEach(s=>s.onchange=()=>{ if(s.value==='') delete ans[+s.dataset.k]; else ans[+s.dataset.k]=+s.value; });
    root.querySelector('.vf').onclick=()=>{ paint(true); const good=cfg.items.filter((it,k)=>ans[k]===it[1]).length; root.querySelector('.smsg').innerHTML=`<p><b>${good} / ${cfg.items.length}</b> bien classé(s).${good===cfg.items.length?' 🎉 Parfait !':' Les corrections sont indiquées sous chaque ligne.'}</p>`; };
    root.querySelector('.rs').onclick=()=>{ Object.keys(ans).forEach(k=>delete ans[k]); paint(); };
  };
  paint();
}
function orderer(root, steps, note){
  let cur; const init=()=>{ do { cur = shuffle(steps.map((_,k)=>k)); } while(steps.length>1 && cur.every((v,k)=>v===k)); };
  const paint=(check=false)=>{
    root.innerHTML = `<ol class="ord">${cur.map((k,p)=>`<li class="${check?(k===p?'okc':'koc'):''}"><span>${steps[k]}</span><span class="ordb"><button class="btn sm" data-p="${p}" data-d="-1" ${p===0?'disabled':''}>↑</button><button class="btn sm" data-p="${p}" data-d="1" ${p===cur.length-1?'disabled':''}>↓</button></span></li>`).join('')}</ol>
      <div class="row"><button class="btn sm primary vf">Vérifier</button><button class="btn sm so">Voir la solution</button><button class="btn sm rs">Mélanger</button></div><div class="omsg"></div>`;
    root.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ const p=+b.dataset.p, q=p+(+b.dataset.d); [cur[p],cur[q]]=[cur[q],cur[p]]; paint(); });
    root.querySelector('.vf').onclick=()=>{ paint(true); const ok=cur.every((v,k)=>v===k); root.querySelector('.omsg').innerHTML=`<p>${ok?'✅ <b>Ordre correct !</b>':'❌ Les éléments en rouge ne sont pas à leur place.'} ${ok&&note?note:''}</p>`; };
    root.querySelector('.so').onclick=()=>{ cur=steps.map((_,k)=>k); paint(true); if(note) root.querySelector('.omsg').innerHTML=`<p>${note}</p>`; };
    root.querySelector('.rs').onclick=()=>{ init(); paint(); };
  };
  init(); paint();
}
function blanks(root, sentences){
  const parsed = sentences.map(s=>{ const parts=[]; let last=0; const re=/\[\[(.+?)\]\]/g; let m; while((m=re.exec(s[0]))){ parts.push({t:s[0].slice(last,m.index)}); const opts=m[1].split('|'); const good=opts.findIndex(o=>o.endsWith('*')); parts.push({opts:opts.map(o=>o.replace(/\*$/,'')),good}); last=re.lastIndex; } parts.push({t:s[0].slice(last)}); return {parts, ex:s[1]}; });
  const paint=()=>{ root.innerHTML = `<div class="blk">${parsed.map((p,i)=>`<div class="bl" data-i="${i}">${p.parts.map((x,j)=>x.opts?`<select data-j="${j}"><option value="">…</option>${shuffle(x.opts.map((o,k)=>[o,k])).map(([o,k])=>`<option value="${k}">${o}</option>`).join('')}</select>`:x.t).join('')}<div class="bfb"></div></div>`).join('')}</div>
      <div class="row" style="margin-top:8px"><button class="btn sm primary vf">Vérifier</button><button class="btn sm so">Voir les réponses</button><button class="btn sm rs">Recommencer</button></div><div class="bmsg"></div>`;
    const verify=(fill)=>{ let good=0,tot=0; root.querySelectorAll('.bl').forEach(div=>{ const p=parsed[+div.dataset.i]; let allok=true; div.querySelectorAll('select').forEach(sel=>{ const x=p.parts[+sel.dataset.j]; tot++; if(fill) sel.value=String(x.good); const ok=sel.value===String(x.good); if(ok) good++; else allok=false; sel.className=ok?'selok':'selko'; }); const fb=div.querySelector('.bfb'); fb.innerHTML=p.ex?`<span class="muted">${allok?'✓':'→'} ${p.ex}</span>`:''; }); root.querySelector('.bmsg').innerHTML=`<p><b>${good} / ${tot}</b> bonne(s) réponse(s).</p>`; };
    root.querySelector('.vf').onclick=()=>verify(false); root.querySelector('.so').onclick=()=>verify(true); root.querySelector('.rs').onclick=paint; };
  paint();
}

/* ==================== Culture générale et expression ==================== */
const CGE = [
{ title:"L'épreuve de culture générale et expression", html:`
  <div class="def"><b>Format (session 2027)</b>Épreuve écrite de <b>3 heures</b> en deux parties notées chacune sur <b>10 points</b>.<br>• <b>Partie 1 – Analyse d'un corpus</b> : 2 à 4 questions sur un ensemble de documents (textes, images). Il faut comprendre, analyser, comparer, interpréter.<br>• <b>Partie 2 – Écriture personnelle (essai)</b> : un sujet au choix parmi deux, sur le thème de l'année. On attend un texte argumenté, structuré et nuancé, illustré par des exemples.</div>
  <p>Le thème change chaque année. Pour la session 2027, c'est <b>« Le vrai du faux »</b>. Les questions portent sur ce thème et l'essai aussi : ta culture sur le thème (œuvres, faits d'actualité, notions) fait la différence.</p>
  <div class="lab"><div class="labt">🧪 Remets dans l'ordre une bonne gestion des 3 heures</div><div class="o1"></div></div>`,
  init(el){ orderer(el.querySelector('.o1'),["Lire les questions de la partie 1 avant le corpus (≈ 5 min)","Lire et annoter le corpus : source, date, genre, idées clés (≈ 30 min)","Rédiger les réponses aux questions de la partie 1 (≈ 50 min)","Choisir le sujet d'essai, analyser ses mots-clés, chercher une problématique (≈ 15 min)","Faire un plan détaillé avec arguments et exemples (≈ 20 min)","Rédiger l'essai : introduction, développement, conclusion (≈ 50 min)","Relire l'ensemble : orthographe, syntaxe, connecteurs (≈ 10 min)"],"Le temps total fait 3 heures : c'est un repère, pas une règle officielle."); },
  check:{q:"Combien de points vaut l'écriture personnelle (essai) ?", opts:["10 points sur 20","20 points sur 40","5 points sur 20","40 points sur 60"], a:0, ex:"Les deux parties sont chacune notées sur 10."}
},
{ title:"Analyser un document", html:`
  <p>Avant de répondre aux questions, on identifie pour chaque document :</p>
  <div class="grid2">
    <div class="prop"><b>Le paratexte</b>auteur, titre, date, source, genre (roman, essai, article, tribune, affiche, photo…)</div>
    <div class="prop"><b>Le thème et la thèse</b>de quoi parle-t-il ? quelle position défend-il ?</div>
    <div class="prop"><b>Les arguments et les exemples</b>comment l'auteur justifie-t-il sa position ?</div>
    <div class="prop"><b>Les procédés</b>question rhétorique, opposition, métaphore, ironie, registre ; pour une image : cadrage, couleurs, composition, texte</div>
  </div>
  <div class="lab"><div class="labt">🧪 Document d'entraînement (texte fictif écrit pour l'exercice)</div>
  <blockquote class="doc"><b>Claire Martin, « Croire ce qu'on voit ? », tribune parue dans le magazine fictif <i>Regards numériques</i>, mars 2026.</b><br>Pendant des siècles, une photographie valait preuve. Aujourd'hui, quelques secondes suffisent à une IA pour fabriquer le visage d'un témoin qui n'a jamais existé. Faut-il pour autant renoncer à croire ? Non : il faut apprendre à douter avec méthode, croiser les sources, vérifier les dates, comme le font les journalistes. Le doute n'est pas l'ennemi de la vérité, il en est le chemin.</blockquote>
  <div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{prompt:"Classe chaque élément du document :", cats:['Paratexte','Thèse','Argument / exemple','Procédé'], items:[
    ["Claire Martin, Regards numériques, mars 2026",0],["Il s'agit d'une tribune, donc d'un texte argumentatif",0],["Il faut apprendre à douter avec méthode plutôt que renoncer à croire",1],
    ["Une IA peut fabriquer en quelques secondes le visage d'un témoin qui n'a jamais existé",2],["Croiser les sources et vérifier les dates, comme les journalistes",2],
    ["La question « Faut-il pour autant renoncer à croire ? »",3,"question rhétorique"],["L'opposition « pendant des siècles » / « aujourd'hui »",3,"opposition temporelle"]]}); },
  check:{q:"Qu'appelle-t-on le paratexte d'un document ?", opts:["Les informations qui l'entourent : auteur, titre, date, source, genre","Le résumé du document","La thèse de l'auteur","Les citations à l'intérieur du texte"], a:0, ex:"Le paratexte permet de situer le document avant même de l'analyser."}
},
{ title:"Confronter les documents", html:`
  <p>Les questions de la partie 1 demandent souvent de <b>comparer</b> les documents. Le bon réflexe : une <b>grille de confrontation</b>, avec les documents en colonnes et les idées en lignes. On repère ainsi :</p>
  <p>• les <b>points communs</b> (même constat, même thèse) ; • les <b>différences</b> (points de vue opposés, nuances) ; • les <b>complémentarités</b> (un document illustre ce que l'autre explique).</p>
  <div class="def"><b>Règles de rédaction</b>On rédige des phrases complètes, on cite les documents par leur auteur ou leur titre (« le texte d'E. Morin », « l'affiche »), on organise la réponse <b>par idées</b> et non document par document, et on <b>justifie</b> par de courtes références aux documents.</div>
  <div class="lab"><div class="labt">🧪 Choisis le bon connecteur logique</div><div class="b1"></div></div>`,
  init(el){ blanks(el.querySelector('.b1'),[
    ["Le document 1 dénonce les fausses nouvelles ; [[de même*|au contraire|donc]], le document 2 alerte sur la vitesse des rumeurs.","« de même » marque la ressemblance."],
    ["Le roman invente une histoire ; [[pourtant*|ainsi|de plus]], il dit quelque chose de vrai sur l'être humain.","« pourtant » marque la concession."],
    ["Les hypertrucages sont de plus en plus réalistes ; [[c'est pourquoi*|cependant|en revanche]] il faut éduquer au doute.","« c'est pourquoi » introduit une conséquence."],
    ["[[Alors que*|Puisque|Afin que]] l'enquête d'E. Morin analyse une rumeur réelle, le film de P. Weir imagine un monde entièrement truqué.","« alors que » oppose deux éléments."],
    ["Les deux documents s'accordent sur le danger du faux ; [[en revanche*|de même|par conséquent]], ils divergent sur les solutions.","« en revanche » introduit une différence."]]); },
  check:{q:"Comment organiser une réponse de confrontation ?", opts:["Par idées, en croisant les documents","Document par document, dans l'ordre du corpus","Par longueur des documents","En recopiant les passages importants"], a:0, ex:"Un plan par idées montre que tu as réellement confronté les documents."}
},
{ title:"Réussir l'écriture personnelle (essai)", html:`
  <p><b>1. Analyser le sujet</b> : souligne les mots-clés, définis-les, repère ce qui fait débat, puis formule une <b>problématique</b> (une vraie question à laquelle ton essai répond).</p>
  <p><b>2. Choisir un plan</b> : <b>dialectique</b> (oui… mais… / thèse, antithèse, éventuellement dépassement), <b>thématique</b> (plusieurs aspects d'une même réponse) ou <b>analytique</b> (causes, conséquences, solutions).</p>
  <p><b>3. Construire chaque paragraphe</b> : une idée, un argument expliqué, un exemple précis (œuvre, fait, expérience), puis une phrase bilan ou de transition.</p>
  <div class="lab"><div class="labt">🧪 Remets l'introduction dans l'ordre</div><div class="o1"></div></div>
  <div class="lab"><div class="labt">🧪 Remets un paragraphe argumentatif dans l'ordre</div><div class="o2"></div></div>`,
  init(el){ orderer(el.querySelector('.o1'),["Amorce : une accroche liée au thème (fait d'actualité, œuvre, citation courte)","Présentation du sujet et définition des termes importants","Problématique : la question à laquelle l'essai va répondre","Annonce du plan"]);
    orderer(el.querySelector('.o2'),["Idée directrice : « Le faux peut aussi servir à dire le vrai. »","Argument expliqué : la fiction invente des situations pour faire comprendre des réalités humaines.","Exemple précis : dans « L'Adversaire », E. Carrère raconte une imposture réelle pour comprendre le mensonge.","Bilan / transition : le faux n'est donc pas toujours l'ennemi de la vérité ; reste à savoir quand il devient dangereux."]); },
  check:{q:"Quel plan suit le schéma « oui… mais… » ?", opts:["Le plan dialectique","Le plan thématique","Le plan chronologique","Le plan analytique"], a:0, ex:"Le plan dialectique confronte une thèse et une antithèse avant de nuancer."}
},
{ title:"Le thème 2027 : « Le vrai du faux »", html:`
  <p>Le thème interroge la frontière entre le vrai et le faux dans un monde où elle est de plus en plus difficile à tracer. Trois grandes pistes :</p>
  <div class="grid2">
    <div class="prop"><b>1. Le faux qui trompe</b>manipulation du langage et des images, désinformation, rumeurs, technologies numériques et IA qui brouillent notre capacité à distinguer le vrai.</div>
    <div class="prop"><b>2. Le faux qui révèle</b>l'illusion peut avoir une valeur esthétique ou cognitive : la fiction, l'art, le jeu ou le théâtre peuvent dire des vérités profondes.</div>
    <div class="prop"><b>3. Vrai et faux liés</b>plutôt qu'opposés, ils s'entremêlent. Comprendre leur relation aide à distinguer l'artificiel du réel et à exercer son esprit critique.</div>
  </div>
  <div class="lab"><div class="labt">🧪 Classe ces arguments</div><div class="s1"></div></div>
  <div class="lab"><div class="labt">🧪 Cartes mémoire : les notions clés</div><div class="f1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Le faux est une menace','Le faux peut servir le vrai'], items:[
    ["Sur les réseaux sociaux, une fausse nouvelle peut circuler plus vite que son démenti.",0],["Un hypertrucage (deepfake) peut ruiner la réputation d'une personne.",0],["La fiction romanesque éclaire des vérités humaines : c'est le « mentir-vrai ».",1],
    ["La satire grossit le trait pour dénoncer un abus bien réel.",1],["Le mensonge d'un imposteur détruit la confiance de ses proches.",0],["Le théâtre montre l'illusion pour faire réfléchir le spectateur sur sa propre vie.",1],
    ["La propagande d'un régime totalitaire réécrit l'histoire.",0],["Une maquette ou une simulation, fausses par nature, permettent de tester le réel.",1]]});
    flashcards(el.querySelector('.f1'),[
      ["Désinformation","Diffusion <b>intentionnelle</b> d'informations fausses pour tromper ou manipuler."],["Mésinformation","Diffusion d'une information fausse <b>sans intention</b> de tromper (on la croit vraie)."],
      ["Post-vérité","Situation où les émotions et les croyances pèsent plus dans l'opinion que les faits vérifiés."],["Vraisemblance","Caractère de ce qui <b>paraît</b> vrai, sans forcément l'être."],
      ["Illusion","Perception ou croyance erronée qui fait prendre l'apparence pour la réalité."],["Fiction","Récit inventé, qui ne prétend pas être vrai mais peut éclairer le réel."],
      ["Imposture","Fait de se faire passer pour ce qu'on n'est pas afin de tromper."],["Rumeur","Information non vérifiée qui se propage de bouche à oreille ou en ligne."],
      ["Hypertrucage (deepfake)","Image, vidéo ou voix truquée par IA, très réaliste."],["Esprit critique","Capacité à examiner une information avant de l'accepter : source, preuves, recoupement."],
      ["Simulacre","Apparence qui se fait passer pour la réalité, au point de la remplacer."],["Mentir-vrai","Idée qu'une fiction, bien que mensongère, peut exprimer une vérité (titre d'une nouvelle d'Aragon)."]]); },
  check:{q:"Quelle différence entre désinformation et mésinformation ?", opts:["L'intention de tromper","Le support utilisé","La langue","Il n'y en a pas"], a:0, ex:"La désinformation est volontaire ; la mésinformation relaie une erreur de bonne foi."}
},
{ title:"Des œuvres pour nourrir ton essai", html:`
  <p>La bibliographie indicative du thème propose des œuvres variées. Il vaut mieux bien connaître <b>3 ou 4 œuvres</b> de genres différents que d'en citer vingt vaguement.</p>
  <table class="tt" style="width:100%;text-align:left"><tr><th>Genre</th><th>Œuvres</th></tr>
  <tr><td>Romans, nouvelles, théâtre</td><td style="text-align:left">Aragon, <i>Le Mentir-vrai</i> · Atwood, <i>La Servante écarlate</i> · Balzac, <i>Illusions perdues</i> · Borges, <i>Fictions</i> · Butler, <i>La Parabole du semeur</i> · Calderón, <i>La Vie est un songe</i> · Carrère, <i>L'Adversaire</i></td></tr>
  <tr><td>Essais</td><td style="text-align:left">Huyghe, <i>Désinformation : les armes du faux</i> · Le Brun, <i>Du trop de réalité</i> · Morin, <i>La Rumeur d'Orléans</i></td></tr>
  <tr><td>Films</td><td style="text-align:left">Spielberg, <i>Arrête-moi si tu peux</i> · Varda, <i>Documenteur</i> · Verhoeven, <i>Elle</i> · Weir, <i>The Truman Show</i></td></tr>
  <tr><td>Bandes dessinées</td><td style="text-align:left">Ayroles et Guarnido, <i>Les Indes fourbes</i> · Gaiman, <i>Sandman</i> · Moore et Lloyd, <i>V pour Vendetta</i> · Peeters et Schuiten, <i>Les Cités obscures</i></td></tr></table>
  <div class="lab"><div class="labt">🧪 Cartes mémoire : retrouve l'œuvre</div><div class="f1"></div></div>
  <p class="muted">Les résumés des cartes sont volontairement brefs. Lis ou regarde au moins une œuvre en entier et note 2 ou 3 passages précis à utiliser dans l'essai.</p>`,
  init(el){ flashcards(el.querySelector('.f1'),[
    ["Un homme fait croire pendant près de vingt ans à sa famille qu'il est médecin, jusqu'au drame. L'auteur enquête sur cette imposture réelle.","<b>L'Adversaire</b>, Emmanuel Carrère (récit, 2000)"],
    ["Un homme découvre que toute sa vie est un spectacle télévisé, avec un décor et des proches joués par des acteurs.","<b>The Truman Show</b>, Peter Weir (film, 1998)"],
    ["Un jeune faussaire se fait passer pour pilote, médecin et avocat, poursuivi par un agent du FBI.","<b>Arrête-moi si tu peux</b>, Steven Spielberg (film, 2002)"],
    ["Un jeune poète monte à Paris et découvre un journalisme où l'on fait et défait les réputations.","<b>Illusions perdues</b>, Honoré de Balzac (roman, XIXᵉ siècle)"],
    ["Un prince, enfermé depuis sa naissance, ne sait plus distinguer le rêve de la réalité.","<b>La Vie est un songe</b>, Calderón (théâtre, XVIIᵉ siècle)"],
    ["Un sociologue enquête sur une rumeur sans fondement qui s'est propagée dans une ville française.","<b>La Rumeur d'Orléans</b>, Edgar Morin (essai)"],
    ["Dans une dictature religieuse, le régime contrôle les femmes et réécrit la réalité à son profit.","<b>La Servante écarlate</b>, Margaret Atwood (roman dystopique)"],
    ["Un justicier masqué s'oppose à un régime totalitaire qui contrôle l'information.","<b>V pour Vendetta</b>, Alan Moore et David Lloyd (BD)"],
    ["Recueil de récits vertigineux où des mondes imaginaires finissent par contaminer le réel.","<b>Fictions</b>, Jorge Luis Borges (nouvelles)"],
    ["Un essai sur les techniques de manipulation de l'information et leurs usages stratégiques.","<b>Désinformation : les armes du faux</b>, François-Bernard Huyghe"],
    ["Un picaro (aventurier rusé) trompe tout le monde au fil d'une aventure dans l'Amérique coloniale.","<b>Les Indes fourbes</b>, Ayroles et Guarnido (BD)"],
    ["Une nouvelle autobiographique dont le titre affirme que la fiction peut dire vrai en mentant.","<b>Le Mentir-vrai</b>, Louis Aragon"]]); },
  check:{q:"Dans l'essai, comment utiliser une œuvre efficacement ?", opts:["Avec un exemple précis (personnage, scène) relié à l'argument","En citant seulement son titre","En racontant tout le résumé","En recopiant une longue citation apprise par cœur"], a:0, ex:"L'exemple doit être précis et expliqué : il prouve ton argument."}
}];
const CGE_QUIZ = [
 {q:"Combien de temps dure l'épreuve de culture générale et expression ?", opts:["3 heures","4 heures","2 heures","1 h 30"], a:0, ex:"3 heures pour les deux parties."},
 {q:"Combien de sujets d'essai sont proposés au choix ?", opts:["Deux","Un seul","Trois","Quatre"], a:0, ex:"On choisit un sujet parmi deux."},
 {q:"Quel est le thème de culture générale de la session 2027 ?", opts:["Le vrai du faux","Les animaux et nous","À table !","Invitation au voyage"], a:0, ex:"« Les animaux et nous » était le thème de 2026, et « À table ! » celui de 2025."},
 {q:"Une problématique, c'est…", opts:["la question à laquelle l'essai répond","le titre du sujet recopié","le résumé du corpus","la conclusion"], a:0, ex:"Elle guide tout le développement."},
 {q:"Quel connecteur exprime une conséquence ?", opts:["c'est pourquoi","pourtant","en revanche","alors que"], a:0, ex:"Les trois autres marquent une opposition ou une concession."},
 {q:"Quel est l'ordre d'un paragraphe argumentatif ?", opts:["Idée → argument → exemple → bilan","Exemple → conclusion → idée","Citation → résumé → avis","Bilan → idée → exemple"], a:0, ex:"Méthode classique : affirmer, expliquer, illustrer, conclure."},
 {q:"Qui a écrit « L'Adversaire », récit d'une imposture réelle ?", opts:["Emmanuel Carrère","Honoré de Balzac","Louis Aragon","Edgar Morin"], a:0, ex:"Carrère y raconte l'histoire d'un faux médecin."},
 {q:"Dans « The Truman Show », le héros découvre que…", opts:["sa vie est un spectacle télévisé truqué","il est un faussaire","il rêve depuis toujours","il est un robot"], a:0, ex:"Tout son univers est un décor : une illustration parfaite du thème."},
 {q:"« La Rumeur d'Orléans » est…", opts:["une enquête sociologique d'Edgar Morin","un roman de Balzac","une bande dessinée","un film de Varda"], a:0, ex:"Morin y analyse comment une rumeur infondée se propage."},
 {q:"Qu'est-ce que la post-vérité ?", opts:["Quand émotions et croyances pèsent plus que les faits dans l'opinion","Une vérité découverte après coup","Un genre littéraire","Une technique journalistique"], a:0, ex:"Notion centrale pour parler de l'information à l'ère numérique."},
 {q:"Dans la partie 1, il faut citer les documents…", opts:["par leur auteur ou leur titre, en courtes références","en recopiant des paragraphes entiers","sans jamais les nommer","seulement dans la conclusion"], a:0, ex:"Des références courtes et précises justifient la réponse."},
 {q:"Quel genre est « Les Cités obscures » de Peeters et Schuiten ?", opts:["Bande dessinée","Essai","Film","Théâtre"], a:0, ex:"C'est une série de BD, souvent citée pour la frontière entre réel et imaginaire."},
];

/* ==================== Anglais ==================== */
const ENG = [
{ title:"L'épreuve d'anglais (E2) en bref", html:`
  <div class="def"><b>Écrit – 2 heures</b>Un ou plusieurs documents en anglais, liés au monde de l'entreprise (50 lignes maximum).<br>• <b>Compte rendu en français</b> : environ <b>un tiers</b> de la longueur du texte, avec une introduction (source, thème) et les idées essentielles restituées sans traduction mot à mot. Une brève conclusion sur l'intérêt professionnel est valorisée.<br>• <b>Production écrite en anglais</b> : un écrit professionnel (courriel, courrier, bref rapport, instructions…) à partir d'un contexte et de consignes.<br>Dictionnaire <b>unilingue</b> autorisé.</div>
  <div class="def"><b>Oral – 20 min de préparation + 20 min d'épreuve</b>Un dossier : 1 ou 2 documents écrits et une courte vidéo authentique (1 min 30 à 2 min), avec une situation-problème.<br>• <b>Phase 1 (≈ 5 min)</b> : tu présentes le dossier en continu, sans interruption du jury.<br>• <b>Phase 2 (≈ 15 min)</b> : entretien. Tu exposes la situation-problème, la replaces dans un cadre professionnel, proposes et justifies des solutions.<br>Niveau visé : <b>B2</b>.</div>
  <div class="lab"><div class="labt">🧪 Remets la méthode du compte rendu dans l'ordre</div><div class="o1"></div></div>`,
  init(el){ orderer(el.querySelector('.o1'),["Lire le texte une première fois pour saisir le thème global","Relever la source, la date, l'auteur et le thème","Repérer les idées essentielles et les regrouper par thème","Rédiger une introduction qui présente la source et le thème","Restituer les idées clés en français, avec ses propres mots","Conclure brièvement sur l'intérêt professionnel du document","Relire : orthographe, longueur d'environ un tiers du texte"]); },
  check:{q:"Dans quelle langue rédige-t-on le compte rendu de l'écrit ?", opts:["En français","En anglais","Au choix","Dans les deux langues"], a:0, ex:"Le compte rendu est en français ; la production écrite, elle, est en anglais."}
},
{ title:"Le compte rendu en français", html:`
  <p>Le compte rendu n'est <b>ni une traduction ni un commentaire</b> : c'est une restitution fidèle et synthétique des idées du document.</p>
  <div class="lab"><div class="labt">🧪 Calcule la longueur visée</div><label>Nombre de mots du texte anglais : <input type="number" class="nw" value="420" style="width:100px"></label><div class="nwo" style="margin-top:6px"></div></div>
  <div class="lab"><div class="labt">🧪 À faire ou à éviter ?</div><div class="s1"></div></div>`,
  init(el){ const p=()=>{ const n=Math.max(0,$v(el,'.nw')||0); el.querySelector('.nwo').innerHTML=`Vise environ <b>${Math.round(n/3)} mots</b> (entre ${Math.round(n/3*0.9)} et ${Math.round(n/3*1.1)}).`; }; el.querySelector('.nw').oninput=p; p();
    sorter(el.querySelector('.s1'),{cats:['À faire','À éviter'], items:[
      ["Traduire le texte phrase par phrase",1],["Utiliser les équivalents français des termes techniques courants",0],["Présenter la source et le thème dès l'introduction",0],
      ["Donner son avis personnel tout au long du compte rendu",1],["Regrouper les idées essentielles par thème",0],["Rédiger un texte aussi long que l'original",1],
      ["Ajouter une brève conclusion sur l'intérêt professionnel",0],["Recopier des expressions anglaises sans les traduire",1]]}); },
  check:{q:"Un article anglais fait 600 mots. Quelle longueur viser pour le compte rendu ?", opts:["Environ 200 mots","Environ 600 mots","Environ 50 mots","Environ 1 200 mots"], a:0, ex:"Environ un tiers de la longueur du texte source."}
},
{ title:"Writing a professional email", html:`
  <p>La production écrite est souvent un <b>courriel professionnel</b> : répondre à un client, signaler un incident, expliquer une procédure… On évalue l'adéquation à la situation, le respect du format et la qualité de l'anglais.</p>
  <div class="grid2">
    <div class="prop"><b>Opening</b>Dear Mr Smith, / Dear Sir or Madam,<br>I am writing to inform you that… / Further to your email of…</div>
    <div class="prop"><b>Requests</b>Could you please…? / I would be grateful if you could…<br>Please find attached…</div>
    <div class="prop"><b>Closing</b>Should you have any questions, please do not hesitate to contact me.<br>I look forward to hearing from you.</div>
    <div class="prop"><b>Sign-off</b>Best regards, / Kind regards, / Yours sincerely,<br>+ nom, fonction, entreprise</div>
  </div>
  <div class="lab"><div class="labt">🧪 Remets le courriel dans l'ordre</div><div class="o1"></div></div>
  <div class="lab"><div class="labt">🧪 Formel ou informel ?</div><div class="s1"></div></div>`,
  init(el){ orderer(el.querySelector('.o1'),["Subject: Scheduled server maintenance – Saturday 14 June","Dear Ms Taylor,","I am writing to inform you that our file server will be unavailable on Saturday from 8 am to 12 pm.","During this period, we will install security updates and replace a faulty hard drive.","Please save your work and log out before Friday evening.","Should you have any questions, please do not hesitate to contact me.","Kind regards,","Lucas Martin – IT Support Technician"]);
    sorter(el.querySelector('.s1'),{cats:['Formel','Informel'], items:[["I am writing to…",0],["Hi guys!",1],["Please find attached the report.",0],["Cheers,",1],["I look forward to hearing from you.",0],["Thanks a lot!",1],["Dear Sir or Madam,",0],["Gonna send it tomorrow.",1],["Could you please confirm receipt?",0],["See ya!",1]]}); },
  check:{q:"Quelle formule convient pour joindre un fichier ?", opts:["Please find attached…","Look at the thing I sent","Here it is lol","I join you the file"], a:0, ex:"« I join you » est un calque fautif du français."}
},
{ title:"Vocabulaire informatique et professionnel", html:`
  <p>Le dossier porte toujours sur le <b>monde professionnel</b>, souvent sur le numérique. Maîtriser ce vocabulaire fait gagner du temps à l'écrit comme à l'oral.</p>
  <div class="lab"><div class="labt">🧪 Cartes mémoire anglais → français</div><div class="f1"></div></div>`,
  init(el){ flashcards(el.querySelector('.f1'),[
    ["firewall","pare-feu"],["switch","commutateur"],["router","routeur"],["backup","sauvegarde"],["data breach","fuite / violation de données"],["threat","menace"],["vulnerability","vulnérabilité"],
    ["patch / update","correctif / mise à jour"],["outage / downtime","panne / indisponibilité"],["helpdesk / ticket","support / ticket d'incident"],["to troubleshoot","diagnostiquer et dépanner"],["encryption","chiffrement"],
    ["two-factor authentication (2FA)","authentification à deux facteurs"],["ransomware","rançongiciel"],["phishing","hameçonnage"],["bandwidth","bande passante"],["to deploy","déployer"],["access rights","droits d'accès"],
    ["to log in / to log out","se connecter / se déconnecter"],["log file","fichier journal"],["to set up","installer, configurer"],["hardware / software","matériel / logiciel"],["device","appareil, équipement"],
    ["requirements","besoins, exigences"],["deadline","échéance, date limite"],["quote / invoice","devis / facture"],["warranty","garantie"],["to hire / to fire","embaucher / licencier"],["skills","compétences"],["remote work","télétravail"],
    ["cloud computing","informatique en nuage"],["data center","centre de données"]]); },
  check:{q:"Que signifie « outage » ?", opts:["Une panne, une coupure de service","Une sortie de secours","Un dépassement de budget","Une mise à jour"], a:0, ex:"« A network outage » est une panne du réseau."}
},
{ title:"Grammaire utile", html:`
  <div class="grid2">
    <div class="prop"><b>Present perfect</b>action passée avec un résultat présent, sans date : <i>We have installed a new firewall.</i></div>
    <div class="prop"><b>Past simple</b>action datée et terminée : <i>The server crashed yesterday.</i></div>
    <div class="prop"><b>Conditionnels</b>If + présent → will (réel) ; If + prétérit → would (hypothèse) : <i>If we migrated, we would save money.</i></div>
    <div class="prop"><b>Modaux</b>must (obligation), must not (interdiction), should (conseil), could (suggestion), don't have to (absence d'obligation)</div>
    <div class="prop"><b>Passif</b>be + participe passé : <i>The data is encrypted.</i></div>
    <div class="prop"><b>since / for / ago</b>since + point de départ, for + durée, ago = il y a</div>
  </div>
  <div class="lab"><div class="labt">🧪 Complète les phrases</div><div class="b1"></div></div>`,
  init(el){ blanks(el.querySelector('.b1'),[
    ["We [[have installed*|installed|install]] the new firewall, so the network is now protected.","Résultat visible maintenant, sans date : present perfect."],
    ["The server [[crashed*|has crashed|crashes]] yesterday at 3 pm.","Date précise (yesterday) : past simple."],
    ["If we [[migrated*|migrate|will migrate]] to the cloud, we would reduce costs.","Hypothèse : if + prétérit → would."],
    ["If the backup fails, the system [[will send*|would send|sent]] an alert.","Situation réelle : if + présent → will."],
    ["Users [[must not*|don't have to|should]] share their passwords.","Interdiction : must not."],
    ["The data [[is encrypted*|encrypts|is encrypting]] before being sent.","Passif : be + participe passé."],
    ["I have been working here [[since*|for|ago]] 2024 and the project started two years [[ago*|since|for]].","since + date ; ago = il y a."],
    ["The meeting is [[on*|in|at]] Monday [[at*|on|in]] 10 am.","on + jour ; at + heure."]]); },
  check:{q:"« I work here since 2024 » est incorrect. Quelle est la bonne forme ?", opts:["I have been working here since 2024","I worked here since 2024","I am working here since 2024","I work here for 2024"], a:0, ex:"Une action commencée dans le passé et qui dure : present perfect (continu) + since."}
},
{ title:"L'oral : présenter et interagir", html:`
  <p><b>Phase 1 – présentation (≈ 5 min)</b> : nature et source des documents, thème commun, idées principales de chaque document, points de vue et implicite, puis le lien entre les documents.<br><b>Phase 2 – entretien (≈ 15 min)</b> : la situation-problème, sa place dans un cadre professionnel, une ou plusieurs solutions justifiées, et des réponses aux questions du jury (reformuler, nuancer, demander de répéter si besoin).</p>
  <div class="lab"><div class="labt">🧪 À quel moment utiliser chaque phrase ?</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Présenter le dossier','Problème et solutions','Interagir avec le jury','Conclure'], items:[
    ["The video is an extract from a news report about…",0],["Both documents deal with…",0],["The main issue here is that…",1],["I would recommend implementing two-factor authentication because…",1],
    ["In my opinion, the best solution would be…",1],["Could you rephrase the question, please?",2],["If I understood correctly, you mean that…",2],["That's a fair point; however,…",2],["To sum up,…",3],["All things considered,…",3]]}); },
  check:{q:"Pendant la phase 1 de l'oral, le jury…", opts:["n'intervient pas","pose des questions en continu","présente le dossier","propose des solutions"], a:0, ex:"La phase 1 est une prise de parole en continu."}
}];
const ENG_QUIZ = [
 {q:"Quelle est la durée de l'écrit d'anglais ?", opts:["2 heures","3 heures","1 heure","4 heures"], a:0, ex:"Compte rendu en français et production écrite en anglais, en 2 heures."},
 {q:"Quel dictionnaire est autorisé à l'écrit ?", opts:["Un dictionnaire unilingue","Un dictionnaire bilingue","Un traducteur en ligne","Aucun"], a:0, ex:"Uniquement un dictionnaire anglais-anglais."},
 {q:"Combien de temps dure la vidéo du dossier oral ?", opts:["1 min 30 à 2 min","10 minutes","30 secondes","5 minutes"], a:0, ex:"C'est un document authentique court."},
 {q:"Quel niveau du cadre européen vise l'épreuve ?", opts:["B2","A2","C2","B1"], a:0, ex:"Niveau B2 du CECRL."},
 {q:"Comment traduire « pare-feu » ?", opts:["firewall","fireplace","wall fire","fire door"], a:0, ex:"firewall."},
 {q:"Comment traduire « hameçonnage » ?", opts:["phishing","fishing","spamming","hooking"], a:0, ex:"phishing, avec « ph »."},
 {q:"Que signifie « to troubleshoot » ?", opts:["diagnostiquer et résoudre un problème","créer des problèmes","tirer sur une cible","installer un logiciel"], a:0, ex:"Terme incontournable du support informatique."},
 {q:"Complète : « The server ___ down yesterday. »", opts:["went","has gone","goes","is going"], a:0, ex:"Date passée précise : past simple."},
 {q:"Quelle phrase exprime une interdiction ?", opts:["You must not share your password.","You don't have to share your password.","You could share your password.","You should share your password."], a:0, ex:"« don't have to » signifie seulement qu'on n'est pas obligé."},
 {q:"Quelle formule de clôture convient à un courriel formel ?", opts:["Kind regards,","Cheers,","See ya,","Love,"], a:0, ex:"Kind regards ou Best regards sont neutres et professionnels."},
 {q:"Que signifie « deadline » ?", opts:["une date limite","une ligne morte","un bug fatal","une coupure réseau"], a:0, ex:"Mot très fréquent en gestion de projet."},
 {q:"Comment traduire « devis » ?", opts:["quote","invoice","receipt","bill of sale"], a:0, ex:"invoice = facture ; quote = devis."},
 {q:"Le compte rendu doit…", opts:["restituer les idées essentielles avec ses propres mots","traduire chaque phrase","donner son opinion","suivre obligatoirement l'ordre du texte"], a:0, ex:"On peut réorganiser les idées et on évite le littéral."},
];

/* ==================== CEJM ==================== */
const CEJM1 = [
{ title:"L'épreuve de CEJM et la méthode de l'étude de cas", html:`
  <div class="def"><b>Format</b>Épreuve écrite de <b>4 heures</b> : un cas d'entreprise, une base documentaire (annexes) et une série d'environ <b>10 à 12 questions</b> qui mobilisent l'économie, le droit et le management. Pour le BTS SIO, l'épreuve s'appelle « Culture économique, juridique et managériale pour l'informatique ».</div>
  <p><b>Méthode pour chaque question</b> : 1) repérer le champ (économie, droit ou management) et la notion visée ; 2) <b>définir</b> la notion ; 3) aller chercher les informations dans les <b>annexes</b> ; 4) <b>appliquer au contexte</b> de l'entreprise, avec des phrases rédigées et justifiées. Une réponse sans lien avec le cas ne rapporte presque rien.</p>
  <div class="lab"><div class="labt">🧪 Quel champ disciplinaire pour chaque question ?</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Économie','Droit','Management'], items:[
    ["Identifiez la structure de marché sur laquelle se situe l'entreprise.",0],["Le client peut-il obtenir la résolution du contrat ?",1],["Caractérisez le style de direction du dirigeant.",2],
    ["Analysez l'effet d'une hausse des taux d'intérêt sur l'investissement de l'entreprise.",0],["La clause de non-concurrence du contrat de travail est-elle valable ?",1],["Réalisez le diagnostic interne de l'entreprise.",2],
    ["Repérez les externalités liées à l'activité de l'entreprise.",0],["L'entreprise respecte-t-elle ses obligations au regard du RGPD ?",1],["Justifiez le choix d'une stratégie de différenciation.",2]]}); },
  check:{q:"Quelle est la durée de l'épreuve de CEJM ?", opts:["4 heures","2 heures","3 heures","5 heures"], a:0, ex:"4 heures sur un cas d'entreprise."}
},
{ title:"Les six thèmes du programme", html:`
  <table class="tt" style="width:100%;text-align:left"><tr><th>Thème</th><th style="text-align:left">Grandes questions</th></tr>
  <tr><td>1. L'intégration de l'entreprise dans son environnement</td><td style="text-align:left">Relations avec l'environnement économique (marchés, partenaires), sécurisation par les contrats, finalités et parties prenantes.</td></tr>
  <tr><td>2. La régulation de l'activité économique</td><td style="text-align:left">Rôle de l'État (politiques économiques), régulation par le droit (concurrence, consommateur), prise en compte de l'environnement dans les décisions.</td></tr>
  <tr><td>3. L'organisation de l'activité de l'entreprise</td><td style="text-align:left">Choix de production et de coûts, forme juridique, organisation et structure, ressources.</td></tr>
  <tr><td>4. L'impact du numérique sur la vie de l'entreprise</td><td style="text-align:left">Transformation de l'environnement par le numérique, réponses du droit (données, propriété), incidence sur le management et le système d'information.</td></tr>
  <tr><td>5. Les mutations du travail</td><td style="text-align:left">Évolutions du marché du travail, droit du travail (contrats, conditions), impact sur l'emploi et les conditions de travail.</td></tr>
  <tr><td>6. Les choix stratégiques de l'entreprise</td><td style="text-align:left">Diagnostic, options stratégiques, croissance, responsabilité sociétale.</td></tr></table>
  <div class="lab"><div class="labt">🧪 Range chaque notion dans son thème</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['T1 Environnement','T2 Régulation','T3 Organisation','T4 Numérique','T5 Travail','T6 Stratégie'], items:[
    ["Formation du contrat avec un fournisseur",0],["Parties prenantes de l'entreprise",0],["Politique monétaire de la Banque centrale européenne",1],["Sanction d'un abus de position dominante",1],
    ["Choix de production et calcul des coûts",2],["Choix entre SARL et SAS",2],["Protection des données personnelles (RGPD)",3],["Plateformes numériques et effets de réseau",3],
    ["Télétravail et droit à la déconnexion",4],["Rupture du contrat de travail",4],["Diagnostic SWOT",5],["Croissance externe par acquisition",5]]}); },
  check:{q:"Dans quel thème étudie-t-on le RGPD et les plateformes ?", opts:["L'impact du numérique sur la vie de l'entreprise","Les mutations du travail","La régulation de l'activité économique","Les choix stratégiques"], a:0, ex:"C'est le thème 4."}
},
{ title:"Les notions d'économie à maîtriser", html:`
  <p>Les questions d'économie demandent de <b>définir</b> une notion puis de la <b>repérer</b> dans le cas. Les incontournables :</p>
  <div class="lab"><div class="labt">🧪 Cartes mémoire</div><div class="f1"></div></div>`,
  init(el){ flashcards(el.querySelector('.f1'),[
    ["Concurrence pure et parfaite","Modèle théorique : atomicité, homogénéité des produits, libre entrée et sortie, transparence de l'information, mobilité des facteurs."],
    ["Monopole / oligopole","Monopole : un seul offreur. Oligopole : quelques offreurs qui s'observent (ex. opérateurs télécoms)."],
    ["Externalité","Effet (positif ou négatif) de l'activité d'un agent sur un autre, sans compensation par le marché. Ex. : la pollution."],
    ["Asymétrie d'information","Une partie d'un échange en sait plus que l'autre (ex. vendeur et acheteur d'un matériel d'occasion)."],
    ["Bien public","Bien non rival et non excluable (ex. éclairage public, défense) : le marché le produit mal."],
    ["Politique budgétaire","Action de l'État par les dépenses publiques et les impôts pour soutenir ou freiner l'activité."],
    ["Politique monétaire","Action de la banque centrale (BCE) sur les taux d'intérêt et la monnaie, notamment pour stabiliser les prix."],
    ["PIB","Produit intérieur brut : somme des valeurs ajoutées produites sur un territoire en un an. Mesure de la croissance."],
    ["Valeur ajoutée","Production – consommations intermédiaires : richesse réellement créée par l'entreprise."],
    ["Productivité","Rapport entre la production et les facteurs utilisés (ex. production par heure de travail)."],
    ["Économies d'échelle","Baisse du coût unitaire quand les quantités produites augmentent."],
    ["Effet de réseau","La valeur d'un service augmente avec le nombre d'utilisateurs (réseaux sociaux, messageries)."],
    ["Plateforme biface","Intermédiaire qui met en relation deux groupes d'utilisateurs (ex. vendeurs et acheteurs d'une place de marché)."],
    ["Économie de la donnée","Création de valeur à partir de la collecte et de l'exploitation des données (publicité ciblée, services)."]]); },
  check:{q:"La pollution d'une usine qui gêne les riverains est…", opts:["une externalité négative","une économie d'échelle","un bien public","un effet de réseau"], a:0, ex:"Un effet subi par des tiers, sans compensation par le marché."}
},
{ title:"Management : diagnostic et stratégie", html:`
  <div class="grid2">
    <div class="prop"><b>Diagnostic externe</b>PESTEL (politique, économique, socioculturel, technologique, écologique, légal) ; les 5 forces de Porter.</div>
    <div class="prop"><b>SWOT</b>Forces et Faiblesses (<b>internes</b>), Opportunités et Menaces (<b>externes</b>).</div>
    <div class="prop"><b>Stratégies génériques (Porter)</b>domination par les coûts, différenciation, focalisation sur un segment.</div>
    <div class="prop"><b>Croissance</b>interne (moyens propres) ou externe (fusion, acquisition) ; intégration verticale, diversification, externalisation, partenariats.</div>
    <div class="prop"><b>GRH</b>GPEC (anticiper les emplois et les compétences), motivation, styles de direction (autoritaire, participatif…).</div>
    <div class="prop"><b>RSE</b>prise en compte des enjeux sociaux et environnementaux et des attentes des parties prenantes.</div>
  </div>
  <div class="lab"><div class="labt">🧪 SWOT de « NetSecure », entreprise de services numériques de 40 salariés spécialisée en cybersécurité (cas fictif)</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Force','Faiblesse','Opportunité','Menace'], items:[
    ["Équipe certifiée et expérimentée",0],["Forte notoriété locale",0],["Un seul client représente 40 % du chiffre d'affaires",1],["Faible présence commerciale en ligne",1],
    ["Les PME sont de plus en plus soumises à des obligations de cybersécurité",2],["Aides publiques pour sécuriser les PME",2],["Pénurie de techniciens qualifiés sur le marché du travail",3],["Arrivée de grands groupes concurrents sur la région",3]]}); },
  check:{q:"Dans un SWOT, les forces et les faiblesses relèvent…", opts:["du diagnostic interne","du diagnostic externe","du PESTEL","des 5 forces de Porter"], a:0, ex:"Opportunités et menaces viennent de l'environnement (externe)."}
}];
const CEJM1_QUIZ = [
 {q:"Combien de thèmes compte le programme de CEJM ?", opts:["6","4","8","10"], a:0, ex:"Six thèmes répartis sur les deux années."},
 {q:"Quelle est la première étape pour traiter une question de CEJM ?", opts:["Repérer le champ et la notion visée","Recopier l'annexe","Donner son avis","Rédiger la conclusion"], a:0, ex:"Puis définir, chercher dans les annexes, appliquer au cas."},
 {q:"Combien d'offreurs y a-t-il sur un marché en oligopole ?", opts:["Quelques-uns","Un seul","Une infinité","Aucun"], a:0, ex:"Monopole : un ; oligopole : quelques-uns."},
 {q:"Comment calcule-t-on la valeur ajoutée ?", opts:["Production − consommations intermédiaires","Chiffre d'affaires − salaires","Bénéfice + impôts","Production × prix"], a:0, ex:"C'est la richesse réellement créée par l'entreprise."},
 {q:"Qui mène la politique monétaire dans la zone euro ?", opts:["La Banque centrale européenne","Le gouvernement français","La Commission européenne","Les banques commerciales"], a:0, ex:"La BCE agit notamment sur les taux directeurs."},
 {q:"Plus un réseau social a d'utilisateurs, plus il est attractif. C'est…", opts:["un effet de réseau","une économie d'échelle","une externalité négative","une asymétrie d'information"], a:0, ex:"La valeur augmente avec le nombre d'utilisateurs."},
 {q:"Que signifie le « E » de PESTEL ?", opts:["Économique et Écologique (deux E)","Éthique","Entreprise","Emploi"], a:0, ex:"Politique, Économique, Socioculturel, Technologique, Écologique, Légal."},
 {q:"Vendre moins cher que les concurrents grâce à des coûts réduits, c'est…", opts:["la domination par les coûts","la différenciation","la focalisation","l'externalisation"], a:0, ex:"C'est l'une des stratégies génériques de Porter."},
 {q:"Racheter un concurrent, c'est une croissance…", opts:["externe","interne","organique","négative"], a:0, ex:"La croissance externe passe par des fusions ou des acquisitions."},
 {q:"La GPEC vise à…", opts:["anticiper les besoins en emplois et en compétences","calculer les coûts de production","fixer les prix","choisir la forme juridique"], a:0, ex:"Gestion prévisionnelle des emplois et des compétences."},
 {q:"Une pénurie de techniciens sur le marché est, pour une entreprise de services numériques…", opts:["une menace","une force","une faiblesse","une opportunité"], a:0, ex:"C'est un facteur externe défavorable."},
 {q:"Un bien non rival et non excluable est…", opts:["un bien public","un bien de luxe","un bien intermédiaire","un actif immatériel"], a:0, ex:"Exemple : l'éclairage public."},
];
const CEJM2 = [
{ title:"Le raisonnement juridique (syllogisme)", html:`
  <div class="def"><b>Les 5 étapes</b>1) <b>Faits qualifiés</b> : on résume les faits en termes juridiques (vendeur, salarié, prestataire…).<br>2) <b>Problème juridique</b> : une question de droit générale, souvent fermée.<br>3) <b>Règle de droit</b> (majeure) : l'article de loi ou le principe applicable, avec ses conditions.<br>4) <b>Application</b> (mineure) : on vérifie chaque condition sur les faits du cas.<br>5) <b>Conclusion</b> : la réponse au problème.</div>
  <p>Cas : <i>une entreprise de services numériques assure la maintenance du parc informatique d'un garage, qui ne paie plus ses factures depuis trois mois. Le prestataire peut-il cesser d'intervenir ?</i></p>
  <div class="lab"><div class="labt">🧪 Remets le raisonnement dans l'ordre</div><div class="o1"></div></div>`,
  init(el){ orderer(el.querySelector('.o1'),["Faits : un prestataire informatique et un client sont liés par un contrat de maintenance ; le client ne paie plus depuis trois mois.","Problème : une partie peut-elle suspendre l'exécution de son obligation lorsque l'autre partie n'exécute pas la sienne ?","Règle : selon l'article 1219 du Code civil, une partie peut refuser d'exécuter son obligation si l'autre n'exécute pas la sienne et si cette inexécution est suffisamment grave (exception d'inexécution).","Application : ici, trois mois de factures impayées constituent une inexécution suffisamment grave du client.","Conclusion : le prestataire peut suspendre la maintenance jusqu'au paiement."]); },
  check:{q:"Dans le syllogisme juridique, la « majeure » est…", opts:["la règle de droit","les faits","la conclusion","le problème juridique"], a:0, ex:"La mineure est l'application aux faits."}
},
{ title:"Le contrat (et les contrats informatiques)", html:`
  <div class="def"><b>Conditions de validité (art. 1128 du Code civil)</b>Le <b>consentement</b> des parties, leur <b>capacité</b> de contracter, et un <b>contenu licite et certain</b>.<br><b>Vices du consentement</b> : l'<b>erreur</b>, le <b>dol</b> (tromperie volontaire), la <b>violence</b>. Ils permettent d'obtenir la nullité du contrat.</div>
  <div class="def"><b>Force obligatoire et inexécution</b>Le contrat légalement formé tient lieu de loi à ceux qui l'ont conclu (art. 1103). En cas d'inexécution (art. 1217), on peut : invoquer l'exception d'inexécution, demander l'exécution forcée, obtenir une réduction du prix, la résolution du contrat ou des dommages et intérêts.</div>
  <p><b>Contrats informatiques</b> : licence, maintenance, infogérance, hébergement, SaaS (logiciel en ligne). Le prestataire a un <b>devoir de conseil</b>. On distingue l'obligation de <b>moyens</b> (tout mettre en œuvre) et l'obligation de <b>résultat</b> (garantir un résultat, par exemple un taux de disponibilité prévu par un <b>SLA</b>, l'accord de niveau de service).</p>
  <div class="lab"><div class="labt">🧪 Diagnostique chaque situation</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Contrat valable','Vice du consentement','Incapacité','Contenu illicite'], items:[
    ["Un vendeur cache volontairement qu'un serveur reconditionné a subi un dégât des eaux.",1,"dol"],["Un client signe librement un contrat de maintenance clair, pour un prix fixé.",0],
    ["Un enfant de 12 ans souscrit seul un abonnement cloud professionnel à 2 000 €.",2],["Un contrat porte sur la vente d'un fichier clients piraté.",3],
    ["Un dirigeant signe sous la menace de représailles physiques.",1,"violence"],["Un acheteur et un vendeur croient tous deux vendre un logiciel original ; c'est une copie sans licence.",1,"erreur"]]}); },
  check:{q:"Le dol, c'est…", opts:["une tromperie volontaire pour obtenir le consentement","une erreur commune aux deux parties","une menace physique","un défaut de capacité"], a:0, ex:"C'est un vice du consentement, qui peut entraîner la nullité du contrat."}
},
{ title:"La responsabilité", html:`
  <div class="grid2">
    <div class="prop"><b>Responsabilité contractuelle</b>Une partie n'exécute pas, ou mal, le contrat : elle doit réparer le préjudice.</div>
    <div class="prop"><b>Responsabilité extracontractuelle</b>Hors contrat (art. 1240) : un fait générateur (une faute), un dommage, un lien de causalité.</div>
    <div class="prop"><b>Du fait d'autrui</b>L'employeur répond des dommages causés par ses salariés dans l'exercice de leurs fonctions.</div>
    <div class="prop"><b>Responsabilité pénale</b>Une infraction prévue par la loi (élément légal, matériel, moral) est punie d'une peine. Ex. : l'accès frauduleux à un système d'information (art. 323-1 du Code pénal).</div>
  </div>
  <div class="lab"><div class="labt">🧪 Complète</div><div class="b1"></div></div>`,
  init(el){ blanks(el.querySelector('.b1'),[
    ["La responsabilité extracontractuelle suppose un [[fait générateur*|contrat|casier judiciaire]], un [[dommage*|bénéfice|procès]] et un [[lien de causalité*|lien de subordination|lien hiérarchique]].","Ce sont les trois conditions cumulatives."],
    ["Un salarié cause un dommage à un client pendant son travail : l'employeur engage sa responsabilité [[du fait d'autrui*|pénale|contractuelle personnelle]].","L'employeur est le commettant du salarié."],
    ["S'introduire sans droit dans le serveur d'une entreprise est une infraction [[pénale*|civile|commerciale]].","Article 323-1 du Code pénal."],
    ["Un hébergeur s'engage à une disponibilité de 99,9 % : c'est une obligation de [[résultat*|moyens|conseil]].","Le résultat promis est mesurable."]]); },
  check:{q:"Un prestataire ne respecte pas son contrat. Quelle responsabilité est engagée ?", opts:["La responsabilité contractuelle","La responsabilité pénale","La responsabilité du fait des choses","Aucune"], a:0, ex:"L'inexécution d'un contrat engage la responsabilité contractuelle."}
},
{ title:"Droit du numérique : RGPD, propriété intellectuelle, charte", html:`
  <div class="def"><b>RGPD – grands principes</b>Licéité, loyauté et transparence ; finalité déterminée ; <b>minimisation</b> des données ; exactitude ; durée de conservation limitée ; sécurité (intégrité et confidentialité) ; responsabilité du responsable de traitement, qui doit pouvoir prouver sa conformité.<br><b>Droits des personnes</b> : accès, rectification, effacement, opposition, limitation, portabilité.<br><b>Violation de données</b> : notification à la CNIL dans les <b>72 heures</b> si elle présente un risque. Sanctions possibles jusqu'à <b>20 M€ ou 4 % du chiffre d'affaires mondial</b>.</div>
  <p><b>Propriété intellectuelle</b> : le logiciel est protégé par le <b>droit d'auteur</b> (y compris le code source). Les licences (propriétaires, libres comme la GPL) fixent les droits d'utilisation. Les bases de données bénéficient d'une protection spécifique.<br><b>Charte informatique</b> : elle fixe les règles d'usage des outils ; annexée au règlement intérieur, elle devient <b>opposable</b> aux salariés. Le contrôle par l'employeur doit être proportionné et les salariés informés.</p>
  <div class="lab"><div class="labt">🧪 Sur quelle base légale repose chaque traitement ?</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Consentement','Contrat','Obligation légale','Intérêts vitaux','Mission d\'intérêt public','Intérêt légitime'], items:[
    ["Inscription volontaire à une newsletter (case à cocher)",0],["Utilisation de l'adresse de livraison d'une commande",1],["Conservation des factures pendant 10 ans",2],
    ["Accès au dossier médical d'un patient inconscient aux urgences",3],["Tenue de l'état civil par une mairie",4],["Vidéosurveillance d'un entrepôt pour prévenir les vols",5]]}); },
  check:{q:"Dans quel délai faut-il notifier une violation de données à la CNIL ?", opts:["72 heures","24 heures","1 semaine","1 mois"], a:0, ex:"72 heures après en avoir pris connaissance, si la violation présente un risque pour les personnes."}
},
{ title:"Droit du travail", html:`
  <p>Les mutations du travail (télétravail, plateformes, besoin de compétences numériques) sont au cœur du thème 5.</p>
  <div class="lab"><div class="labt">🧪 Cartes mémoire</div><div class="f1"></div></div>`,
  init(el){ flashcards(el.querySelector('.f1'),[
    ["Contrat de travail : 3 éléments","Une prestation de travail, une rémunération, un <b>lien de subordination</b> (pouvoir de direction, de contrôle et de sanction)."],
    ["CDI / CDD","Le CDI est la forme normale. Le CDD n'est possible que dans des cas limités (remplacement, accroissement temporaire d'activité…) et doit être écrit."],
    ["Période d'essai","Permet d'évaluer les compétences ; chaque partie peut rompre plus librement, en respectant un délai de prévenance."],
    ["Clause de non-concurrence","Valable si elle protège les intérêts légitimes de l'entreprise, est limitée dans le temps et l'espace, tient compte de l'emploi du salarié et prévoit une <b>contrepartie financière</b>."],
    ["Rupture conventionnelle","Rupture du CDI d'un commun accord, homologuée par l'administration ; ouvre droit à une indemnité."],
    ["Licenciement","Pour motif personnel (cause réelle et sérieuse) ou économique ; une procédure est à respecter (entretien préalable, lettre…)."],
    ["Télétravail","Travail effectué hors des locaux grâce au numérique ; mis en place par accord collectif, charte ou accord individuel."],
    ["Droit à la déconnexion","Droit du salarié de ne pas être sollicité en dehors de son temps de travail."],
    ["Requalification (plateformes)","Un juge peut requalifier un travailleur « indépendant » en salarié s'il existe un lien de subordination réel."],
    ["Charte informatique","Règles d'usage des outils numériques, opposables si elles sont annexées au règlement intérieur ; un manquement peut être sanctionné."]]); },
  check:{q:"Quel élément distingue le contrat de travail d'un contrat de prestation ?", opts:["Le lien de subordination","La rémunération","La durée","L'écrit"], a:0, ex:"Le salarié travaille sous l'autorité de l'employeur."}
}];
const CEJM2_QUIZ = [
 {q:"Quelles sont les 3 conditions de validité d'un contrat ?", opts:["Consentement, capacité, contenu licite et certain","Écrit, signature, prix","Offre, acceptation, livraison","Capacité, notaire, enregistrement"], a:0, ex:"Article 1128 du Code civil."},
 {q:"Les vices du consentement sont…", opts:["l'erreur, le dol et la violence","le retard, la faute et le dommage","l'incapacité et l'illicéité","la lésion et la fraude fiscale"], a:0, ex:"Ils permettent d'obtenir la nullité du contrat."},
 {q:"Le contrat légalement formé tient lieu de loi à ceux qui l'ont conclu : c'est…", opts:["la force obligatoire du contrat","la liberté contractuelle","l'exception d'inexécution","la responsabilité délictuelle"], a:0, ex:"Article 1103 du Code civil."},
 {q:"Quelles sont les 3 conditions de la responsabilité extracontractuelle ?", opts:["Fait générateur, dommage, lien de causalité","Contrat, faute, sanction","Infraction, peine, juge","Faute, amende, prison"], a:0, ex:"Les trois sont cumulatives."},
 {q:"Accéder frauduleusement à un système informatique relève…", opts:["du droit pénal","du droit de la famille","du droit commercial uniquement","du droit fiscal"], a:0, ex:"C'est une infraction du Code pénal."},
 {q:"Un SLA garantit 99,9 % de disponibilité. L'obligation est…", opts:["de résultat","de moyens","de conseil","morale"], a:0, ex:"Un résultat précis et mesurable est promis."},
 {q:"Quel principe du RGPD impose de ne collecter que les données nécessaires ?", opts:["La minimisation","La portabilité","La licéité","L'accountability"], a:0, ex:"Seules les données nécessaires à la finalité sont collectées."},
 {q:"Quel est le montant maximal d'une sanction RGPD ?", opts:["20 M€ ou 4 % du CA mondial","1 M€","100 000 €","10 % du bénéfice"], a:0, ex:"Le montant le plus élevé des deux s'applique."},
 {q:"Le code source d'un logiciel est protégé par…", opts:["le droit d'auteur","le brevet automatiquement","le droit des marques","rien du tout"], a:0, ex:"Le logiciel est une œuvre de l'esprit."},
 {q:"Une charte informatique devient opposable aux salariés lorsqu'elle est…", opts:["annexée au règlement intérieur","affichée sur un site public","signée par un seul salarié","envoyée à la CNIL"], a:0, ex:"Elle suit alors le régime du règlement intérieur."},
 {q:"Une clause de non-concurrence doit notamment prévoir…", opts:["une contrepartie financière","une durée illimitée","une interdiction de travailler partout","l'accord du client"], a:0, ex:"Sinon elle est nulle."},
 {q:"Conserver des factures 10 ans repose sur quelle base légale ?", opts:["Une obligation légale","Le consentement","L'intérêt légitime","Les intérêts vitaux"], a:0, ex:"La loi impose cette conservation."},
];

/* ==================== Cybersécurité (U7 SISR) ==================== */
function riskMatrix(root){
  const G=['G1 Mineure','G2 Significative','G3 Grave','G4 Critique'], V=['V1 Peu vraisemblable','V2 Vraisemblable','V3 Très vraisemblable','V4 Quasi certain'];
  const M=[['Sauvegardes chiffrées, déconnectées et testées','g'],['Bac à sable / isolation des navigateurs','v'],['MFA et sensibilisation à l\'hameçonnage','v'],['Segmentation du réseau (VLAN, pare-feu)','g']];
  let g=4, v=3; const on=M.map(()=>false);
  const lvl=s=>s<=3?['Faible','#cfead8']:s<=5?['Modéré','#fff0b3']:s<=6?['Élevé','#ffd2a8']:['Critique','#f6b3a8'];
  const paint=()=>{ const rg=Math.max(1,g-M.filter((m,k)=>on[k]&&m[1]==='g').length), rv=Math.max(1,v-M.filter((m,k)=>on[k]&&m[1]==='v').length);
    let t=`<table class="tt rm"><tr><th>Gravité ↓ / Vraisemblance →</th>${V.map(x=>`<th>${x}</th>`).join('')}</tr>`;
    for(let gi=4;gi>=1;gi--){ t+=`<tr><th>${G[gi-1]}</th>`; for(let vi=1;vi<=4;vi++){ const L=lvl(gi+vi); const here=gi===g&&vi===v, res=gi===rg&&vi===rv; t+=`<td style="background:${L[1]}">${here?'<b>●</b> initial':''}${res&&!here?'<b>◆</b> résiduel':''}${res&&here?' = résiduel':''}</td>`; } t+='</tr>'; }
    root.innerHTML=`<div class="row"><label>Gravité <select class="sg">${G.map((x,k)=>`<option value="${k+1}" ${k+1===g?'selected':''}>${x}</option>`).join('')}</select></label><label>Vraisemblance <select class="sv">${V.map((x,k)=>`<option value="${k+1}" ${k+1===v?'selected':''}>${x}</option>`).join('')}</select></label></div>${t}</table>
      <div style="margin-top:8px"><b>Mesures de sécurité :</b>${M.map((m,k)=>`<label class="chk" style="margin-top:6px"><input type="checkbox" data-k="${k}" ${on[k]?'checked':''}> ${m[0]} <span class="muted">(réduit la ${m[1]==='g'?'gravité':'vraisemblance'})</span></label>`).join('')}</div>
      <div class="out"><div><b>Risque initial</b><span>${lvl(g+v)[0]}</span></div><div><b>Risque résiduel</b><span>${lvl(rg+rv)[0]}</span></div></div>`;
    root.querySelector('.sg').onchange=e=>{g=+e.target.value; paint();}; root.querySelector('.sv').onchange=e=>{v=+e.target.value; paint();};
    root.querySelectorAll('input[type=checkbox]').forEach(c=>c.onchange=()=>{on[+c.dataset.k]=c.checked; paint();}); };
  paint(); }
function entropyCalc(root){
  root.innerHTML=`<label>Mot de passe à tester (calcul local, rien n'est envoyé) : <input type="text" class="pw" value="Bts-Sio2027!" style="width:260px" autocomplete="off"></label><div class="po"></div>`;
  const paint=()=>{ const s=root.querySelector('.pw').value; let N=0; const sets=[]; if(/[a-z]/.test(s)){N+=26;sets.push('minuscules (26)');} if(/[A-Z]/.test(s)){N+=26;sets.push('majuscules (26)');} if(/[0-9]/.test(s)){N+=10;sets.push('chiffres (10)');} if(/[^a-zA-Z0-9]/.test(s)){N+=33;sets.push('spéciaux (≈ 33)');}
    const bits=s.length&&N?s.length*Math.log2(N):0; const sec=Math.pow(2,bits)/2/1e10;
    const human=sec<1?'moins d\'une seconde':sec<3600?`${Math.round(sec/60)} minute(s)`:sec<86400*365?`${Math.round(sec/86400)} jour(s)`:sec<1e12*31536000?`${fmt(sec/31536000,0)} an(s)`:'plus de mille milliards d\'années';
    const r=bits<50?['Faible','var(--ko)']:bits<80?['Moyen','var(--g5)']:['Robuste','var(--ok)'];
    root.querySelector('.po').innerHTML=`<p class="mono">Entropie = longueur × log₂(taille de l'alphabet) = ${s.length} × log₂(${N}) ≈ <b>${fmt(bits,1)} bits</b></p><p>Alphabet utilisé : ${sets.join(', ')||'—'}</p><div class="out"><div><b>Niveau (repère indicatif)</b><span style="color:${r[1]}">${r[0]}</span></div><div><b>Force brute à 10¹⁰ essais/s</b><span>${human}</span></div></div><p class="muted">⚠ Ce calcul suppose un mot de passe <b>aléatoire</b>. Un mot du dictionnaire avec une majuscule et « 123! » est deviné bien plus vite : les attaquants testent d'abord ces modèles.</p>`; };
  root.querySelector('.pw').oninput=paint; paint(); }
const FW_RULES=[['ADMIN','DMZ','22','ACCEPT','SSH d\'administration'],['Internet','DMZ','443','ACCEPT','HTTPS public'],['Internet','DMZ','80','ACCEPT','HTTP (redirigé vers HTTPS)'],['LAN','Internet','80,443','ACCEPT','Navigation web des postes'],['LAN','DMZ','443','ACCEPT','Intranet'],['DMZ','LAN','*','DROP','La DMZ ne doit jamais initier vers le LAN'],['*','*','*','DROP','Politique par défaut : tout ce qui n\'est pas autorisé est interdit']];
function firewallSim(root){
  const on=FW_RULES.map(()=>true); const Z=['Internet','LAN','DMZ','ADMIN']; let src='Internet', dst='DMZ', port='443';
  const match=(r)=> (r[0]==='*'||r[0]===src)&&(r[1]==='*'||r[1]===dst)&&(r[2]==='*'||r[2].split(',').includes(port));
  const paint=()=>{ const idx=FW_RULES.findIndex((r,k)=>on[k]&&match(r));
    root.innerHTML=`<div class="row"><label>Source <select class="fs">${Z.map(z=>`<option ${z===src?'selected':''}>${z}</option>`).join('')}</select></label><label>Destination <select class="fd">${Z.map(z=>`<option ${z===dst?'selected':''}>${z}</option>`).join('')}</select></label><label>Port TCP <select class="fp">${['22','53','80','443','3306','3389'].map(p=>`<option ${p===port?'selected':''}>${p}</option>`).join('')}</select></label></div>
    <table class="tt" style="margin-top:8px"><tr><th>Active</th><th>#</th><th>Source</th><th>Destination</th><th>Port</th><th>Action</th><th style="text-align:left">Commentaire</th></tr>${FW_RULES.map((r,k)=>`<tr class="${k===idx?'cur':''}"><td><input type="checkbox" data-k="${k}" ${on[k]?'checked':''} ${k===FW_RULES.length-1?'disabled':''}></td><td>${k+1}</td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td style="color:${r[3]==='ACCEPT'?'var(--ok)':'var(--ko)'};font-weight:700">${r[3]}</td><td style="text-align:left">${r[4]}</td></tr>`).join('')}</table>
    <p>Paquet ${src} → ${dst} sur le port ${port} : <b style="color:${FW_RULES[idx][3]==='ACCEPT'?'var(--ok)':'var(--ko)'}">${FW_RULES[idx][3]}</b> (règle n° ${idx+1}, la <b>première</b> qui correspond).</p>`;
    root.querySelector('.fs').onchange=e=>{src=e.target.value; paint();}; root.querySelector('.fd').onchange=e=>{dst=e.target.value; paint();}; root.querySelector('.fp').onchange=e=>{port=e.target.value; paint();};
    root.querySelectorAll('input[type=checkbox]').forEach(c=>c.onchange=()=>{on[+c.dataset.k]=c.checked; paint();}); };
  paint(); }
function raidCalc(root){
  root.innerHTML=`<div class="row"><label>Niveau <select class="rl"><option>RAID 0</option><option selected>RAID 1</option><option>RAID 5</option><option>RAID 6</option><option>RAID 10</option></select></label><label>Nombre de disques <input type="number" class="rn" value="2" min="2" max="16" style="width:70px"></label><label>Taille d'un disque (To) <input type="number" class="rs" value="4" min="1" style="width:70px"></label></div><div class="ro"></div>`;
  const paint=()=>{ const l=root.querySelector('.rl').value, n=Math.round($v(root,'.rn')), s=$v(root,'.rs'); let u,t,min,txt;
    if(l==='RAID 0'){min=2;u=n*s;t=0;txt="Agrégation (striping) : performances, mais <b>aucune tolérance</b> : un disque perdu = toutes les données perdues.";}
    if(l==='RAID 1'){min=2;u=s;t=n-1;txt="Miroir : chaque disque contient la même copie.";}
    if(l==='RAID 5'){min=3;u=(n-1)*s;t=1;txt="Données et parité réparties : supporte la perte d'<b>un</b> disque.";}
    if(l==='RAID 6'){min=4;u=(n-2)*s;t=2;txt="Double parité : supporte la perte de <b>deux</b> disques.";}
    if(l==='RAID 10'){min=4;u=Math.floor(n/2)*s;t=1;txt="Miroirs agrégés : au moins un disque par miroir peut tomber (1 garanti, parfois plus).";}
    const o=root.querySelector('.ro'); if(!(n>=min)||(l==='RAID 10'&&n%2)){ o.innerHTML=`<p style="color:var(--ko)">${l} nécessite au moins ${min} disques${l==='RAID 10'?' en nombre pair':''}.</p>`; return; }
    o.innerHTML=`<div class="out"><div><b>Capacité utile</b><span>${fmt(u)} To</span></div><div><b>Capacité brute</b><span>${fmt(n*s)} To</span></div><div><b>Disques pouvant tomber</b><span>${t}</span></div></div><p>${txt}</p><p class="muted">⚠ Le RAID n'est pas une sauvegarde : une suppression ou un rançongiciel est répliqué sur tous les disques.</p>`; };
  root.querySelectorAll('input,select').forEach(i=>i.oninput=paint); root.querySelector('.rl').onchange=paint; paint(); }
const CYB1 = [
{ title:"L'épreuve de cybersécurité (U7, option SISR)", html:`
  <div class="def"><b>Format</b>Étude de cas écrite de <b>4 heures</b>, spécifique à l'option, à partir d'un contexte d'organisation et d'un dossier documentaire (schémas réseau, configurations, journaux, extraits de recommandations de l'ANSSI…). Aucun document n'est autorisé.</div>
  <p><b>Compétences du bloc 3</b> : protéger les données à caractère personnel ; préserver l'identité numérique de l'organisation ; sécuriser les équipements et les usages des utilisateurs ; garantir la disponibilité, l'intégrité et la confidentialité des services et des données ; pour SISR, assurer la cybersécurité d'une infrastructure réseau, d'un système, d'un service.</p>
  <p><b>Exemple (sujet 2023, « Ville du Parc », 80 points)</b> : dossier A <b>Évaluation des risques</b> (données personnelles, rançongiciel, matrice gravité/vraisemblance) ; dossier B <b>Mesures de protection</b> (mots de passe et script PowerShell Active Directory, haute disponibilité avec HAProxy et TLS, règles de pare-feu, sécurité des ports d'un commutateur Cisco) ; dossier C <b>Réponse à incident</b> (analyse de journaux, indicateurs de compromission, éradication, mesures contre l'hameçonnage).</p>
  <div class="lab"><div class="labt">🧪 Quel critère de sécurité est principalement atteint ?</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{prompt:"Les critères DICP : <b>D</b>isponibilité, <b>I</b>ntégrité, <b>C</b>onfidentialité, <b>P</b>reuve (traçabilité).", cats:['Disponibilité','Intégrité','Confidentialité','Preuve'], items:[
    ["Une attaque DDoS rend le site web inaccessible",0],["Un rançongiciel chiffre tous les fichiers du serveur",0],["Un attaquant modifie le montant d'un virement dans la base",1],["Une mise à jour corrompue altère des fichiers de configuration",1],
    ["La liste des usagers est publiée sur un forum",2],["Un courriel interne est intercepté en clair sur un Wi-Fi public",2],["Impossible de savoir qui a supprimé un compte : aucun journal",3],["Un administrateur nie avoir modifié une règle de pare-feu, et rien ne permet de le prouver",3]]}); },
  check:{q:"Que signifie le « I » de DICP ?", opts:["Intégrité","Identification","Infrastructure","Interopérabilité"], a:0, ex:"Les données ne doivent pas être modifiées de façon non autorisée."}
},
{ title:"Évaluer les risques (méthode EBIOS RM)", html:`
  <div class="def"><b>Le risque</b>Un risque combine une <b>gravité</b> (l'impact sur l'organisation si le scénario se réalise) et une <b>vraisemblance</b> (la probabilité qu'il se réalise). La méthode <b>EBIOS Risk Manager</b> de l'ANSSI identifie les valeurs métier, les sources de risque, les scénarios stratégiques puis opérationnels, et les mesures de traitement.</div>
  <p><b>Traiter un risque</b> : le <b>réduire</b> (mesures de sécurité), le <b>transférer</b> (assurance, prestataire), l'<b>éviter</b> (renoncer à l'activité) ou l'<b>accepter</b> (risque résiduel jugé acceptable). Une mesure peut réduire la vraisemblance (empêcher l'attaque) ou la gravité (limiter les dégâts).</p>
  <div class="lab"><div class="labt">🧪 Scénario : rançongiciel sur les serveurs (grille d'exemple)</div><div class="rm"></div></div>`,
  init(el){ riskMatrix(el.querySelector('.rm')); },
  check:{q:"Des sauvegardes déconnectées et testées réduisent surtout…", opts:["la gravité d'un rançongiciel","la vraisemblance d'un rançongiciel","la confidentialité","le nombre d'attaques"], a:0, ex:"L'attaque reste possible, mais on peut restaurer : l'impact diminue."}
},
{ title:"Protéger les données à caractère personnel", html:`
  <div class="def"><b>Définitions</b>• <b>Donnée personnelle</b> : toute information se rapportant à une personne identifiée ou identifiable, directement ou indirectement (nom, e-mail, adresse IP, identifiant…).<br>• <b>Données sensibles</b> : origine raciale ou ethnique, opinions politiques, convictions religieuses ou philosophiques, appartenance syndicale, données génétiques, biométriques, de santé, vie ou orientation sexuelle. Leur traitement est <b>interdit par principe</b>, sauf exceptions.</div>
  <p><b>Obligations de l'organisation</b> : tenir un <b>registre des traitements</b> ; informer les personnes ; respecter les finalités et les durées de conservation ; sécuriser les données (droits d'accès, chiffrement, journalisation) ; mener une <b>analyse d'impact (AIPD)</b> pour les traitements à risque ; appliquer la protection des données dès la conception et par défaut ; désigner un <b>DPO</b> dans certains cas ; notifier les violations à la CNIL.</p>
  <p><b>Pseudonymisation</b> (on remplace l'identité par un alias, réversible avec une clé : ce sont toujours des données personnelles) et <b>anonymisation</b> (irréversible : ce ne sont plus des données personnelles).</p>
  <div class="lab"><div class="labt">🧪 Quel type de donnée ?</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Donnée personnelle','Donnée sensible','Non personnelle'], items:[
    ["Adresse IP du poste d'un agent",0],["Nom et prénom d'un usager",0],["Adresse e-mail prenom.nom@mairie.fr",0],["Motif médical d'un arrêt de travail",1],["Empreinte digitale utilisée par une badgeuse",1,"biométrique"],
    ["Adhésion d'un salarié à un syndicat",1],["Statistiques de fréquentation anonymes et agrégées",2],["Nombre total de serveurs du datacenter",2]]}); },
  check:{q:"Une adresse IP est-elle une donnée personnelle ?", opts:["Oui, elle permet d'identifier indirectement une personne","Non, c'est une donnée technique","Seulement en IPv6","Seulement si elle est publique"], a:0, ex:"Croisée avec d'autres informations, elle peut identifier une personne."}
},
{ title:"Authentification et mots de passe", html:`
  <div class="def"><b>Facteurs d'authentification</b>ce que l'on <b>sait</b> (mot de passe, code), ce que l'on <b>possède</b> (téléphone, clé de sécurité, carte), ce que l'on <b>est</b> (biométrie). L'authentification <b>multifacteur (MFA)</b> combine au moins deux facteurs de natures différentes.</div>
  <p><b>Bonnes pratiques (dans l'esprit des recommandations de l'ANSSI)</b> : privilégier la <b>longueur</b> (phrases de passe) ; ne jamais réutiliser un mot de passe ; un gestionnaire de mots de passe ; <b>comptes à privilèges séparés</b> des comptes du quotidien et protégés par la MFA ; verrouillage ou ralentissement après plusieurs échecs ; stockage côté serveur sous forme de <b>hachés salés</b>. Une expiration trop fréquente pousse aux mots de passe prévisibles (Été2026!, Automne2026!…). Pour les comptes à privilèges, on fixe une durée de validité et on surveille les mots de passe trop anciens (attribut <span class="mono">PasswordLastSet</span> dans Active Directory, comme dans le sujet 2023).</p>
  <div class="lab"><div class="labt">🧪 Calcul d'entropie</div><div class="ec"></div></div>`,
  init(el){ entropyCalc(el.querySelector('.ec')); },
  check:{q:"Un mot de passe + un code reçu sur le téléphone, c'est…", opts:["une authentification à deux facteurs","deux mots de passe","de la biométrie","du chiffrement"], a:0, ex:"Ce que l'on sait + ce que l'on possède."}
},
{ title:"Préserver l'identité numérique de l'organisation", html:`
  <p>L'identité numérique de l'organisation, c'est son nom de domaine, ses sites, ses adresses e-mail, ses comptes sur les réseaux sociaux et sa réputation en ligne. Les attaquants cherchent à l'<b>usurper</b> (faux sites, faux e-mails) ou à la <b>dégrader</b>.</p>
  <div class="lab"><div class="labt">🧪 Cartes mémoire</div><div class="f1"></div></div>`,
  init(el){ flashcards(el.querySelector('.f1'),[
    ["SPF","Enregistrement DNS (TXT) qui liste les serveurs autorisés à envoyer des e-mails pour le domaine."],
    ["DKIM","Signature cryptographique des e-mails sortants ; la clé publique est publiée dans le DNS. Prouve que le message n'a pas été modifié."],
    ["DMARC","Politique publiée dans le DNS qui indique quoi faire des e-mails qui échouent aux contrôles SPF/DKIM (laisser passer, quarantaine, rejet), et qui fournit des rapports."],
    ["Certificat TLS","Lie un nom de domaine à une clé publique ; signé par une autorité de certification reconnue, il permet au navigateur de faire confiance au site (HTTPS)."],
    ["Autorité de certification (AC)","Tiers de confiance qui signe les certificats. Les navigateurs ne font confiance qu'aux AC reconnues : un certificat auto-signé déclenche une alerte."],
    ["Typosquatting","Enregistrement d'un nom de domaine proche du vrai (mairie-du-parc.fr imité par mairie-dupark.fr) pour piéger les utilisateurs."],
    ["Usurpation d'identité","Se faire passer pour l'organisation (faux site, faux compte, faux e-mail du directeur pour demander un virement)."],
    ["E-réputation","Image de l'organisation en ligne ; elle se surveille (veille, alertes) et se défend (droit de réponse, signalements)."],
    ["Protection du nom de domaine","Renouvellement automatique, verrouillage chez le bureau d'enregistrement, MFA sur le compte, achat des variantes proches."]]); },
  check:{q:"Quel mécanisme liste dans le DNS les serveurs autorisés à envoyer les e-mails d'un domaine ?", opts:["SPF","DKIM","TLS","VPN"], a:0, ex:"DKIM signe les messages ; DMARC définit la politique."}
}];
const CYB1_QUIZ = [
 {q:"Combien de temps dure l'épreuve U7 de cybersécurité ?", opts:["4 heures","2 heures","3 heures","6 heures"], a:0, ex:"Une étude de cas de 4 heures."},
 {q:"Que signifie le « P » de DICP ?", opts:["Preuve (traçabilité)","Protection","Performance","Pare-feu"], a:0, ex:"Pouvoir prouver qui a fait quoi : journaux, signatures."},
 {q:"Une attaque DDoS porte surtout atteinte à…", opts:["la disponibilité","la confidentialité","la preuve","l'intégrité"], a:0, ex:"Le service devient inaccessible."},
 {q:"Comment exprime-t-on un risque ?", opts:["Par sa gravité et sa vraisemblance","Par le nombre de serveurs","Par le prix du pare-feu","Par la vitesse du réseau"], a:0, ex:"C'est la base de la matrice des risques."},
 {q:"Souscrire une cyberassurance, c'est…", opts:["transférer le risque","réduire le risque","éviter le risque","ignorer le risque"], a:0, ex:"Une partie des conséquences financières est prise en charge par un tiers."},
 {q:"Quelle méthode d'analyse de risques publie l'ANSSI ?", opts:["EBIOS Risk Manager","ITIL","Scrum","Merise"], a:0, ex:"Elle est citée dans les sujets d'examen."},
 {q:"Les données de santé sont…", opts:["des données sensibles","des données non personnelles","des données publiques","des métadonnées sans protection"], a:0, ex:"Elles font partie des catégories particulières du RGPD."},
 {q:"La pseudonymisation…", opts:["reste réversible : les données restent personnelles","rend les données anonymes définitivement","supprime les données","chiffre le disque"], a:0, ex:"Seule l'anonymisation irréversible fait sortir du RGPD."},
 {q:"Pourquoi séparer les comptes d'administration des comptes du quotidien ?", opts:["Pour limiter les dégâts si un compte du quotidien est compromis","Pour aller plus vite","Pour économiser des licences","Ce n'est pas recommandé"], a:0, ex:"Un hameçonnage sur un compte standard ne donne pas les droits d'administration."},
 {q:"Comment stocker les mots de passe côté serveur ?", opts:["Sous forme de hachés salés","En clair dans la base","Chiffrés avec une clé connue de tous","Dans un fichier texte"], a:0, ex:"On ne peut pas retrouver le mot de passe à partir du haché."},
 {q:"Un certificat auto-signé sur le site public d'une mairie provoque…", opts:["une alerte de sécurité dans le navigateur des usagers","une connexion plus rapide","un meilleur référencement","rien de particulier"], a:0, ex:"Seules les autorités reconnues sont acceptées sans avertissement."},
 {q:"Quel mécanisme indique quoi faire des e-mails qui échouent aux contrôles SPF/DKIM ?", opts:["DMARC","DHCP","NAT","RAID"], a:0, ex:"DMARC : laisser passer, mettre en quarantaine ou rejeter."},
 {q:"Combien de facteurs de natures différentes faut-il au minimum pour une MFA ?", opts:["2","1","3","4"], a:0, ex:"Par exemple, un mot de passe et une clé de sécurité."},
];
const CYB2 = [
{ title:"Attaques courantes et contre-mesures", html:`
  <p>Les sujets demandent souvent d'<b>identifier une attaque</b> à partir d'un symptôme (capture réseau, journal), puis de <b>proposer une contre-mesure</b> adaptée.</p>
  <div class="lab"><div class="labt">🧪 Associe chaque attaque à sa contre-mesure principale</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Port-security / 802.1X','DHCP snooping','Sauvegardes 3-2-1 hors ligne','MFA + verrouillage de compte','Sensibilisation + filtrage des e-mails','SYN cookies / limitation / anti-DDoS','Requêtes préparées','Dynamic ARP Inspection'], items:[
    ["Un PC pirate branché sur une prise murale",0],["Un faux serveur DHCP distribue une mauvaise passerelle",1],["Un rançongiciel chiffre les serveurs",2],["Une attaque par force brute sur les comptes VPN",3],
    ["Un e-mail piégé imite la direction (hameçonnage)",4],["Une inondation de demandes SYN (SYN flood)",5],["Une injection SQL dans un formulaire web",6],["Un empoisonnement ARP pour intercepter le trafic",7]]}); },
  check:{q:"Une capture montre des milliers de SYN sans ACK final. De quelle attaque s'agit-il ?", opts:["Une inondation SYN (déni de service)","Un hameçonnage","Une injection SQL","Une usurpation DHCP"], a:0, ex:"La poignée de main TCP (SYN, SYN-ACK, ACK) n'est jamais terminée et sature le serveur."}
},
{ title:"Segmenter et filtrer le réseau", html:`
  <div class="def"><b>Principes</b>• <b>Segmentation</b> : séparer les usages dans des VLAN (utilisateurs, serveurs, administration, Wi-Fi invités) et une <b>DMZ</b> pour les services exposés à Internet.<br>• <b>Filtrage</b> : un pare-feu applique des règles <b>dans l'ordre</b> ; la <b>première règle qui correspond</b> s'applique.<br>• <b>Politique par défaut « tout interdire »</b>, puis on n'autorise que le nécessaire (moindre privilège).<br>• Un pare-feu <b>à états</b> (stateful) suit les connexions : les réponses aux connexions autorisées passent automatiquement.</div>
  <div class="lab"><div class="labt">🧪 Simulateur de pare-feu : choisis un flux et active ou désactive des règles</div><div class="fw"></div></div>
  <p class="muted">Essaie : Internet → DMZ port 3389 (bureau à distance), DMZ → LAN port 443, puis désactive la règle 2 et teste à nouveau Internet → DMZ port 443.</p>`,
  init(el){ firewallSim(el.querySelector('.fw')); },
  check:{q:"Pourquoi place-t-on les serveurs web publics dans une DMZ ?", opts:["Pour qu'une compromission ne donne pas accès directement au réseau interne","Pour qu'ils soient plus rapides","Pour économiser des adresses IP","Pour ne pas avoir besoin de pare-feu"], a:0, ex:"La DMZ isole les services exposés à Internet."}
},
{ title:"Sécuriser les commutateurs", html:`
  <p>Une prise réseau libre est une porte d'entrée. Sur les commutateurs, on : désactive les ports inutilisés ; place les ports dans le bon VLAN en mode <b>access</b> ; active la <b>port-security</b> (nombre limité d'adresses MAC, apprentissage <b>sticky</b> automatique) ou mieux, <b>802.1X</b> (authentification du poste) ; active le <b>DHCP snooping</b> et l'inspection ARP dynamique ; protège l'accès d'administration (SSH, pas Telnet).</p>
  <div class="lab"><div class="labt">🧪 Complète la configuration Cisco (comme dans le sujet 2023, sans relever les adresses MAC à la main)</div><div class="b1"></div></div>`,
  init(el){ blanks(el.querySelector('.b1'),[
    ["<span class='mono'>Switch(config)# interface range fa0/1 - 24</span>",""],
    ["<span class='mono'>Switch(config-if-range)# switchport mode [[access*|trunk|dynamic]]</span>","La port-security s'applique aux ports d'accès."],
    ["<span class='mono'>Switch(config-if-range)# switchport [[port-security*|nonegotiate|voice vlan]]</span>","Active la sécurité de port."],
    ["<span class='mono'>Switch(config-if-range)# switchport port-security maximum [[1*|0|100]]</span>","Une seule adresse MAC autorisée par prise."],
    ["<span class='mono'>Switch(config-if-range)# switchport port-security mac-address [[sticky*|dynamic|learn]]</span>","« sticky » apprend automatiquement la première adresse MAC et l'enregistre dans la configuration."],
    ["<span class='mono'>Switch(config-if-range)# switchport port-security violation [[shutdown*|block|deny]]</span>","En cas de violation, le port passe en err-disabled (les modes restrict et protect existent aussi)."],
    ["Pour un port inutilisé : <span class='mono'>[[shutdown*|no shutdown|reload]]</span>","On éteint les ports qui ne servent pas."]]); },
  check:{q:"Que fait l'option « sticky » de la port-security ?", opts:["Elle apprend et mémorise automatiquement l'adresse MAC connectée","Elle bloque toutes les adresses MAC","Elle chiffre le trafic","Elle crée un VLAN"], a:0, ex:"Inutile de relever les adresses MAC à la main."}
},
{ title:"Chiffrement, certificats et VPN", html:`
  <div class="grid2">
    <div class="prop"><b>Chiffrement symétrique</b>Une même clé pour chiffrer et déchiffrer (AES). Rapide ; le problème est d'échanger la clé.</div>
    <div class="prop"><b>Chiffrement asymétrique</b>Une clé publique et une clé privée (RSA, courbes elliptiques). Sert à échanger des clés et à signer.</div>
    <div class="prop"><b>Hachage</b>Empreinte de taille fixe (SHA-256) : la moindre modification change l'empreinte. Sert à l'<b>intégrité</b>.</div>
    <div class="prop"><b>Signature</b>Empreinte chiffrée avec la clé privée : garantit l'<b>authenticité</b>, l'intégrité et la non-répudiation.</div>
    <div class="prop"><b>TLS / HTTPS</b>Certificat du serveur vérifié par une autorité, puis échange d'une clé de session symétrique.</div>
    <div class="prop"><b>VPN</b>Tunnel chiffré (IPsec, OpenVPN, WireGuard) entre deux sites ou pour un nomade. SSH pour l'administration à distance.</div>
  </div>
  <p><b>Répartiteur de charge et TLS (sujet 2023)</b> : en <b>terminaison TLS</b>, le certificat est sur le répartiteur (HAProxy) : le trafic est chiffré jusqu'à lui, et il peut inspecter les requêtes. En <b>pass-through</b>, le certificat est sur les serveurs web : le chiffrement va de bout en bout.</p>
  <div class="lab"><div class="labt">🧪 Quelle propriété apporte surtout chaque mécanisme ?</div><div class="s1"></div></div>`,
  init(el){ sorter(el.querySelector('.s1'),{cats:['Confidentialité','Intégrité','Authentification'], items:[
    ["Chiffrement AES d'un disque d'ordinateur portable",0],["Tunnel VPN entre le siège et une agence",0],["Empreinte SHA-256 publiée avec une image ISO",1],["Somme de contrôle vérifiée après un téléchargement",1],
    ["Certificat du serveur vérifié par le navigateur",2],["Clé publique SSH déposée sur un serveur pour s'y connecter",2],["Signature électronique d'un document",2,"et non-répudiation"]]}); },
  check:{q:"Avec le chiffrement asymétrique, on chiffre un message pour Alice avec…", opts:["la clé publique d'Alice","la clé privée d'Alice","sa propre clé privée","une clé partagée"], a:0, ex:"Seule la clé privée d'Alice pourra déchiffrer."}
},
{ title:"Disponibilité : redondance et sauvegardes", html:`
  <div class="def"><b>Éviter les SPOF</b>Un <b>point unique de défaillance</b> (SPOF) fait tomber tout le service s'il tombe. On redonde : disques (RAID), serveurs (cluster, répartiteurs de charge doublés), alimentations, liens (agrégation, RSTP), sites (réplication).</div>
  <div class="def"><b>Sauvegardes : règle 3-2-1</b>3 copies des données, sur 2 supports différents, dont 1 hors site ou <b>hors ligne</b> (déconnectée), à l'abri d'un rançongiciel. Il faut <b>tester les restaurations</b>.<br><b>RPO</b> : perte de données maximale admissible (le temps écoulé depuis la dernière sauvegarde). <b>RTO</b> : durée maximale d'interruption admissible. Le PCA (continuité) et le PRA (reprise) organisent la réponse.</div>
  <div class="lab"><div class="labt">🧪 Calculateur RAID</div><div class="rc"></div></div>`,
  init(el){ raidCalc(el.querySelector('.rc')); },
  check:{q:"Les sauvegardes ont lieu chaque nuit à 2 h. Une panne survient à 17 h. Quelle perte de données subit-on au maximum ?", opts:["15 heures de données : c'est le RPO","2 heures","24 heures","aucune"], a:0, ex:"On restaure la sauvegarde de 2 h : tout ce qui a été fait depuis est perdu."}
},
{ title:"Journaux, supervision et réponse à incident", html:`
  <p><b>Journalisation et supervision</b> : centraliser les journaux (syslog, journaux d'événements Windows, proxy, pare-feu) sur un serveur dédié ou un SIEM, synchroniser l'heure (NTP), conserver et protéger les journaux, définir des alertes. Les <b>indicateurs de compromission (IOC)</b> sont des traces d'attaque : adresse IP ou domaine malveillant, empreinte d'un fichier, tâche planifiée suspecte, clé de registre…</p>
  <div class="lab"><div class="labt">🧪 Remets les 6 phases de réponse à incident (modèle du SANS) dans l'ordre</div><div class="o1"></div></div>
  <div class="lab"><div class="labt">🧪 À quelle phase appartient chaque action ?</div><div class="s1"></div></div>`,
  init(el){ orderer(el.querySelector('.o1'),["Préparation : plan de réponse, sauvegardes testées, journaux centralisés","Identification : détecter, qualifier l'alerte (incident ou faux positif), relever les IOC","Confinement : isoler les machines touchées pour stopper la propagation","Éradication : supprimer le code malveillant et ses mécanismes de persistance","Récupération : restaurer depuis des sauvegardes saines, remettre en service sous surveillance","Retour d'expérience : analyser l'incident, rédiger le rapport, renforcer les mesures"]);
    sorter(el.querySelector('.s1'),{cats:['Préparation','Identification','Confinement','Éradication','Récupération','Retour d\'expérience'], items:[
      ["Débrancher du réseau le poste infecté",2],["Analyser les journaux du proxy pour confirmer une connexion vers un serveur de commande",1],["Supprimer les tâches planifiées et les clés de registre malveillantes",3],
      ["Restaurer le serveur à partir d'une sauvegarde saine",4],["Organiser une campagne de sensibilisation à l'hameçonnage après l'incident",5],["Rédiger et tester un plan de réponse aux incidents",0]]}); },
  check:{q:"Isoler du réseau un poste infecté relève de quelle phase ?", opts:["Le confinement","L'éradication","La préparation","La récupération"], a:0, ex:"On empêche d'abord la propagation, avant de nettoyer."}
}];
const CYB2_QUIZ = [
 {q:"Dans un pare-feu, quand plusieurs règles correspondent à un paquet, laquelle s'applique ?", opts:["La première dans l'ordre","La dernière","La plus permissive","La plus récente"], a:0, ex:"D'où l'importance de l'ordre des règles."},
 {q:"Quelle politique par défaut recommande-t-on pour un pare-feu ?", opts:["Tout interdire sauf ce qui est explicitement autorisé","Tout autoriser sauf ce qui est interdit","Tout autoriser","Aucune politique"], a:0, ex:"C'est le principe du moindre privilège appliqué aux flux."},
 {q:"Contre un faux serveur DHCP, on active…", opts:["le DHCP snooping","le NAT","le RAID","DKIM"], a:0, ex:"Seuls les ports de confiance peuvent répondre aux requêtes DHCP."},
 {q:"Un pare-feu à états (stateful)…", opts:["suit les connexions et laisse passer les réponses aux flux autorisés","bloque tout le trafic retour","ne filtre que les adresses MAC","remplace l'antivirus"], a:0, ex:"Il n'est pas nécessaire d'écrire une règle pour chaque réponse."},
 {q:"Un RAID 5 de 4 disques de 2 To offre une capacité utile de…", opts:["6 To","8 To","4 To","2 To"], a:0, ex:"(n − 1) × taille = 3 × 2 To."},
 {q:"Le RAID remplace-t-il une sauvegarde ?", opts:["Non, une suppression ou un chiffrement est répliqué","Oui, toujours","Oui, en RAID 1","Oui, en RAID 6"], a:0, ex:"Le RAID protège contre une panne de disque, pas contre une erreur ou une attaque."},
 {q:"Dans la règle 3-2-1, le « 1 » désigne…", opts:["une copie hors site ou hors ligne","un seul serveur","une sauvegarde par jour","un seul administrateur"], a:0, ex:"C'est elle qui résiste à un sinistre ou à un rançongiciel."},
 {q:"Quel algorithme est symétrique ?", opts:["AES","RSA","SHA-256","ECDSA"], a:0, ex:"RSA et ECDSA sont asymétriques ; SHA-256 est une fonction de hachage."},
 {q:"En terminaison TLS sur un répartiteur de charge, où se trouve le certificat ?", opts:["Sur le répartiteur (HAProxy)","Sur chaque poste client","Sur le serveur DNS","Nulle part"], a:0, ex:"Le flux est chiffré jusqu'au répartiteur, qui peut ensuite l'inspecter."},
 {q:"Qu'est-ce qu'un SPOF ?", opts:["Un point unique de défaillance","Un protocole de routage","Une attaque par force brute","Un type de VLAN"], a:0, ex:"On le supprime grâce à la redondance."},
 {q:"Quel ordre suivent les premières phases de réponse à incident ?", opts:["Identification → confinement → éradication","Éradication → identification → confinement","Récupération → préparation → confinement","Confinement → préparation → identification"], a:0, ex:"On identifie, on contient, puis on éradique."},
 {q:"Pourquoi synchroniser l'heure (NTP) de tous les équipements ?", opts:["Pour corréler les journaux lors d'une enquête","Pour accélérer le réseau","Pour chiffrer les données","Pour économiser de l'énergie"], a:0, ex:"Sans heure fiable, impossible de reconstituer la chronologie d'une attaque."},
 {q:"Une tâche planifiée inconnue qui relance un exécutable suspect est…", opts:["un indicateur de compromission (IOC)","une mise à jour normale","une règle de pare-feu","une sauvegarde"], a:0, ex:"C'est un mécanisme de persistance typique d'un logiciel malveillant."},
];
