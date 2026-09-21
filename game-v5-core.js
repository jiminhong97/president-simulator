"use strict";
/* Fictional Baganeum 5.0 game. v4's browser save is never modified. */
const V5_SAVE="baganeum_bizarre_v5",V4_SAVE="starlight_president_v2",V5_ROUNDS=8;
const V5_KEYS=["heart","money","economy","diplomacy","energy","chaos"];
const V5_NAME={heart:"민심",money:"국고",economy:"경제",diplomacy:"외교",energy:"체력",chaos:"킹받아요;"};
const V5_ICON={heart:"❤️",money:"💰",economy:"📈",diplomacy:"🌐",energy:"⚡",chaos:"🤡"};
const V5_ART=["sleep","ceremony","blanket","double","chicken","protest","wallet","cash","phone","meeting","newspaper","tomato","medal","parade","microphone","flag","budget"];
const V5_STAFF={
 finance:[{id:"save",name:"홍자만",desc:"적자가 나면 지출 4 감소"},{id:"trade",name:"홍도니좌",desc:"국고 수입이 생길 때마다 +3"}],
 chief:[{id:"people",name:"홍줴줴",desc:"민심 회복 시 +2"},{id:"rest",name:"홍제이맨",desc:"체력 감소 시 피해 2 완화"}]
};
let G=null,tab="home",scene="desk",moreVoices=false,gameTimer=null,miniComment="";
const APP=document.getElementById("app");
function h(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function B(label,act,attrs="",cls=""){return '<button type="button" class="'+cls+'" data-action="'+act+'" '+attrs+'>'+label+'</button>';}
function PIC(name,cls="pic"){return '<img class="'+cls+'" src="assets/doodles/'+(V5_ART.includes(name)?name:"newspaper")+'.svg" width="1280" height="800" alt="'+h(name)+' 손그림" decoding="async" draggable="false">';}
function PAR(arr,cls="story-lines"){return '<div class="'+cls+'">'+(Array.isArray(arr)?arr:[arr]).map(x=>'<p>'+h(x)+'</p>').join("")+'</div>';}
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function clamp(n,max=100){return Math.min(max,Math.max(0,n));}
function save(){try{localStorage.setItem(V5_SAVE,JSON.stringify(G));}catch(e){console.warn("save failed",e);}}
function load(){try{const v=JSON.parse(localStorage.getItem(V5_SAVE));if(v&&v.version===5&&typeof v.name==="string"&&v.stats&&Array.isArray(v.history)&&Array.isArray(v.queue))return v;}catch(e){}return null;}
function oldExists(){try{return !!localStorage.getItem(V4_SAVE);}catch(e){return false;}}
function event(){return V5_FOLLOW[G.current]||V5_EVENTS.find(x=>x.id===G.current);}
function changes(d){return V5_KEYS.filter(k=>Number(d?.[k]||0)!==0).map(k=>'<span class="change '+(d[k]>0?"plus":"minus")+'">'+V5_ICON[k]+' '+V5_NAME[k]+' '+(d[k]>0?"+":"")+d[k]+'</span>').join("");}
function addStats(d){
 const copy={...d};
 if(G.cabinet.finance==="save"&&copy.money<0)copy.money=Math.min(0,copy.money+4);
 if(G.cabinet.finance==="trade"&&copy.money>0)copy.money+=3;
 if(G.cabinet.chief==="people"&&copy.heart>0)copy.heart+=2;
 if(G.cabinet.chief==="rest"&&copy.energy<0)copy.energy=Math.min(0,copy.energy+2);
 for(const k of V5_KEYS)G.stats[k]=clamp(G.stats[k]+Number(copy[k]||0),k==="money"?180:100);
 if(G.stats.money===0&&!G.flags.includes("empty-wallet"))G.flags.push("empty-wallet");
 return copy;
}
function makeDeck(first){
 const pool=shuffle(V5_EVENTS.filter(x=>x.id!=="first"&&x.id!=="letter").map(x=>x.id));
 if(first){const d=["first",...pool.slice(0,6)];d.splice(3,0,"letter");return d;}
 return shuffle(V5_EVENTS.filter(x=>x.id!=="first").map(x=>x.id)).slice(0,V5_ROUNDS);
}
function start(){
 const input=document.getElementById("president-name"),name=(input?.value||"").trim().slice(0,18);
 if(!name){alert("대통령 이름을 적어 주세요!");return;}
 if(load()&&!confirm("5.0 저장 기록을 새 게임으로 바꿀까요? 기존 4.0 기록은 지우지 않습니다."))return;
 G={version:5,name,term:1,turn:0,phase:"alarm",current:"first",deck:makeDeck(true),queue:[],history:[],latest:null,
 stats:{heart:58,money:84,economy:52,diplomacy:50,energy:75,chaos:10},flags:[],cabinet:{},staffStep:0,alarm:0,
 openedLetter:false,usedHelp:[],pending:null,mini:null,processingUntil:0,elected:false};
 tab="home";scene="desk";moreVoices=false;save();render();
}
function alarmTap(){
 if(!G||G.phase!=="alarm")return;
 G.alarm++;if(G.alarm>=3){G.phase="report";scene="report";}
 save();render();
}
function readLetter(){
 if(!G||G.current!=="letter"||G.phase!=="report")return;
 G.openedLetter=true;if(!G.flags.includes("love-letter"))G.flags.push("love-letter");
 save();render();
}
function chooseStaff(i){
 if(!G||G.phase!=="hire")return;
 const role=G.staffStep===0?"finance":"chief",p=V5_STAFF[role]?.[i];if(!p)return;
 G.cabinet[role]=p.id;G.staffStep++;
 if(G.staffStep>=2){G.phase="desk";chooseNext();}
 else{save();render();}
}
function chooseNext(){
 if(G.queue.length){G.current=G.queue.shift();G.phase="desk";save();render();return;}
 if(G.turn>=V5_ROUNDS){G.current=null;G.phase=G.term===1?"election":"end";save();render();return;}
 G.current=G.deck[G.turn]||V5_EVENTS.find(x=>x.id!=="first").id;
 G.phase="desk";save();render();
}
function setScene(n){
 if(!G||!["desk","report","decision"].includes(n))return;
 if(!["desk","report","decision"].includes(G.phase))return;
 if(n==="decision"&&G.current==="letter"&&!G.openedLetter)return;
 G.phase=n;scene=n;save();render();
}
function pick(i){
 if(!G||G.phase!=="decision")return;
 const e=event(),choice=e?.choices[i];if(!choice)return;
 if(e.id==="letter"&&!G.openedLetter)return;
 if(choice.mini){G.pending=i;G.phase="mini";G.mini={type:choice.mini,step:0,score:0};miniComment="";save();render();return;}
 commit(i,0);
}
function commit(i,bonus){
 const e=event(),o=e?.choices[i];if(!o)return;
 const d={...o.d};if(bonus){const k=o.mini==="cash"?"money":"heart";d[k]=Number(d[k]||0)+bonus;}
 const applied=addStats(d);
 if(o.badge&&!G.flags.includes(o.badge))G.flags.push(o.badge);
 if(o.follow)G.queue.push(o.follow);
 const n={term:G.term,turn:G.turn+1,title:o.headline,category:e.cat,source:e.title,choice:o.label,
 body:o.result+(bonus?" 미니게임 보너스 "+bonus+"점을 획득했습니다.":""),voices:o.voices,delta:applied,art:e.art};
 G.latest=n;G.history.push(n);
 if(!V5_FOLLOW[e.id])G.turn++;
 G.pending=null;G.mini=null;G.openedLetter=false;
 G.phase="processing";G.processingUntil=Date.now()+2800;
 tab="home";scene="desk";moreVoices=false;save();render();scheduleNews();
}
function scheduleNews(){
 if(gameTimer){clearTimeout(gameTimer);gameTimer=null;}
 if(!G||G.phase!=="processing")return;
 gameTimer=setTimeout(()=>{gameTimer=null;if(G?.phase==="processing")newsNow();},Math.max(0,G.processingUntil-Date.now()));
}
function newsNow(){
 if(gameTimer){clearTimeout(gameTimer);gameTimer=null;}
 if(!G||G.phase!=="processing")return;
 G.phase="news";G.processingUntil=0;save();render();
}
function next(){
 if(!G||G.phase!=="news")return;
 if(G.queue.length){chooseNext();return;}
 if(!G.cabinet.finance){G.phase="hire";G.staffStep=0;save();render();return;}
 chooseNext();
}
function miniTap(i){
 if(!G||G.phase!=="mini"||!G.mini)return;
 const m=G.mini,g=m.type==="cash"?[1,2,0,2,1]:m.type==="tomato"?[0,2,1,0,2]:[0,1,2],good=g[m.step];
 m.score+=Number(i===good);
 miniComment=i===good?"정답! 대통령님이 해냈습니다.":"아이고! 이건 아니었네요.";
 m.step++;
 if(m.step>=(m.type==="quiz"?3:5)){
 const bonus=m.score*(m.type==="cash"?5:m.type==="tomato"?3:4);commit(G.pending,bonus);return;
 }
 save();render();
}
function help(kind){
 if(!G||!["money","energy"].includes(kind)||!["desk","report","decision","news"].includes(G.phase))return;
 const k=G.term+":"+G.turn+":"+kind;if(G.usedHelp.includes(k))return;
 addStats(kind==="money"?{money:12,energy:-7,chaos:2}:{energy:14,heart:-3});
 G.usedHelp.push(k);save();render();
}
function campaign(i){
 if(!G||G.phase!=="election")return;
 const picks=[
 {label:"고양이 포스터",d:{heart:8,money:-4,chaos:4}},
 {label:"대통령 이불 굿즈",d:{money:15,heart:2,chaos:6}},
 {label:"동전 줍기 대회",d:{heart:6,money:8,energy:-7}}
 ];
 const p=picks[i];if(!p)return;
 const d=addStats(p.d);
 G.elected=G.stats.heart>=49&&G.stats.money>=18&&G.stats.economy>=26;
 G.latest={term:G.term,turn:"선거",title:G.elected?"재선 성공! 대통령 또 출근":"재선 실패! 대통령 드디어 퇴근",
 category:"선거",source:"게임 속 가상 선거",choice:p.label,body:"게임 내 가상 규칙으로 선거가 종료됐습니다.",
 voices:["시민: 오늘도 별일이 다 있네요.","비서실장: 이불은 돌려주세요."],delta:d,art:G.elected?"medal":"protest"};
 G.history.push(G.latest);G.phase="election-result";tab="home";save();render();
}
function secondTerm(){
 if(!G||G.phase!=="election-result"||!G.elected)return;
 G.term=2;G.turn=0;G.deck=makeDeck(false);G.queue=[];G.current=null;G.openedLetter=false;G.usedHelp=[];
 chooseNext();
}
function retire(){if(!G)return;G.phase="end";save();render();}
function reset(){
 if(!confirm("5.0 기록을 삭제하고 다시 시작할까요? 4.0 기록은 유지됩니다."))return;
 if(gameTimer)clearTimeout(gameTimer);gameTimer=null;
 try{localStorage.removeItem(V5_SAVE);}catch(e){}
 G=null;tab="home";scene="desk";render();
}
