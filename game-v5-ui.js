"use strict";
/* UI: one illustrated scene at a time; story copy breaks at authored sentence groups. */
function logo(){
 return '<header class="game-top"><img src="assets/baganeum-flag.png?v=20260919-2" alt="바가늠공화국 국기" width="58" height="34">'+
 '<div><small>BAGANEUM REPUBLIC · 허술한 국정</small><strong>'+h(G?.name||"대통령")+' 대통령</strong></div>'+
 '<span class="round">'+(G?G.term+"기 · "+Math.min(G.turn+1,V5_ROUNDS)+"/"+V5_ROUNDS:"5.0")+'</span></header>';
}
function summary(){
 return '<div class="tiny-stats"><span>❤️ 민심 <b>'+G.stats.heart+'</b></span><span>💰 국고 <b>'+G.stats.money+'</b></span><span>⚡ '+G.stats.energy+'</span></div>';
}
function nav(){
 const tabs=[["home","🏠","집무실"],["team","👔","내각"],["paper","📰","속보"],["bank","💰","국고"]];
 return '<nav class="bottom-bar" aria-label="게임 메뉴">'+tabs.map(([k,emoji,label])=>
 '<button type="button" data-action="tab" data-tab="'+k+'" aria-current="'+(tab===k?"page":"false")+'" class="'+(tab===k?"active":"")+'"><span>'+emoji+'</span><small>'+label+'</small></button>').join("")+'</nav>';
}
function card(tag,title,art,content,foot=""){
 return '<section class="scene-card"><span class="pencil-label">'+h(tag)+'</span>'+PIC(art)+
 '<h1>'+title+'</h1>'+content+(foot?'<div class="scene-footer">'+foot+'</div>':"")+'</section>';
}
function landing(){
 let old=oldExists()?'<div class="legacy-note">4.0 저장 기록은 별도로 보관됩니다.<br>5.0을 시작해도 삭제되지 않아요.</div>':"";
 return '<div class="v5-start">'+logo()+'<div class="start-panel"><span class="pencil-label">※ 약간 허술한 나라입니다.</span>'+
 PIC("sleep","opening-art")+'<h1>대통령님!<br>나라가 이상해요.</h1>'+
 PAR(["축하합니다. 대통령이 되셨습니다.","근데 취임식에 아무도 안 나왔습니다."])+
 (load()?'<div class="resume-box">💾 5.0 플레이 기록이 있어요.'+B("이어하기 →","resume","","primary")+'</div>':"")+
 '<label for="president-name">대통령 이름</label><input id="president-name" type="text" maxlength="18" autocomplete="off" placeholder="이름을 입력하세요">'+
 B("취임하러 가기 (아마도) →","start","","primary")+old+
 '<p class="smallprint">가상의 나라에서 벌어지는 허구의 게임입니다.</p></div></div>';
}
function alarmView(){
 const i=G.alarm;
 return card("취임 첫날 · 오전 9:03","대통령님,<br>일어나세요!","sleep",
 PAR(["부재중 전화 47통.","알람을 세 번 눌러 주세요.","누를수록 비서실장이 더 화가 납니다."])+
 '<div class="alarm-call">⏰ '+["삐삐삐!!","삐삐삐삐!!!!","대통령니이이임!!!"][Math.min(i,2)]+'</div>',
 B("알람 끄기 "+(i+1)+"/3","alarm","","primary alarm-button"));
}
function deskView(){
 const e=event();
 return card("제"+G.term+"기 · 오늘도 큰일","대통령님!<br>새 일이 터졌습니다.",e?.art||"sleep",
 '<div class="paper-note">'+(e?.id==="first"?"비서실장이 취임식으로 오라고 합니다.":e?.id==="letter"?"책상 위에 수상한 편지가 한 장 있습니다.":V5_FOLLOW[e?.id]?"지난번 일의 뒷수습이 또 남았습니다.":"오늘은 조용할 줄 알았는데요.")+'</div>',
 B("무슨 일인데요? →","scene",'data-scene="report"',"primary"));
}
function reportView(){
 const e=event();if(!e)return deskView();
 if(e.id==="letter"&&!G.openedLetter){
 return card("비밀 편지 도착","대통령님 앞으로<br>편지가 왔습니다.","phone",
 PAR(["봉투 그림을 직접 눌러 보세요.","편지 아래에 중복 열기 버튼은 없습니다."])+
 '<button type="button" class="letter-click" data-action="letter" aria-label="봉투를 눌러 편지를 엽니다"><img src="assets/secret-letter.png" width="493" height="459" alt="손그림 비밀 편지"></button>');
 }
 return card(e.cat,e.title,e.art,PAR(e.desc)+(e.id==="letter"?
 '<div class="letter-message">'+h(G.name)+' 대통령님!<br>뿡뿡 뿌와앙 히히 ❤️</div>':""),
 B("대통령의 결정 내리기 →","scene",'data-scene="decision"',"primary"));
}
function decisionView(){
 const e=event();if(!e)return deskView();
 return '<section class="decision-card"><span class="pencil-label">✍️ 대통령의 결정</span><h1>'+h(e.title)+'</h1>'+
 '<div class="decision-image">'+PIC(e.art,"decision-art")+'<p>당신의 선택이<br>다음 사건을 바꿉니다.</p></div>'+
 '<div class="choices">'+e.choices.map((o,i)=>B('<b>'+String.fromCharCode(65+i)+'. '+h(o.label)+'</b>'+
 '<span class="change-list">'+changes(o.d)+'</span>',"choose",'data-index="'+i+'"',"pick-button")).join("")+'</div>'+
 B("↩ 보고서 다시 보기","scene",'data-scene="report"',"text-button")+'</section>';
}
function processingView(){
 return card("결재 중...","대통령이 열심히<br>일하는 척합니다.","meeting",
 '<div class="giant-stamp" aria-label="결재 완료">결재<br>완료!</div>'+
 PAR(["비서실장: 이거 진짜 시행하실 거예요?","대통령: 이미 도장을 찍었습니다."])+
 '<p class="smallprint">잠시 뒤 뉴스가 등장합니다.<br>직접 터치해서 넘어갈 수도 있습니다.</p>',
 B("신문 먼저 보기 →","skip","","secondary"));
}
function newsView(){
 const n=G.latest;if(!n)return deskView();
 const idx=(G.history.length+G.stats.chaos)%3;
 return '<section class="news-card"><div class="flash">● 바가늠일보 · 긴급 속보</div>'+
 PIC(n.art,"news-art")+'<h1>'+h(n.title)+'</h1>'+PAR([n.body])+
 '<div class="outcome"><b>📌 방금 달라진 것</b><div class="change-list">'+changes(n.delta)+'</div></div>'+
 '<div class="voices"><strong>👥 시민들의 한마디</strong>'+
 (moreVoices?n.voices:n.voices.slice(0,1)).map((q,i)=>'<div class="voice"><img src="assets/'+["citizen-happy.png","citizen-worried.png","citizen-angry.png"][(idx+i)%3]+'" width="493" height="459" alt="손그림 시민 표정"><p>'+h(q)+'</p></div>').join("")+
 (n.voices.length>1?B(moreVoices?"첫 반응만 보기":"다른 시민 반응 보기 +","voices","","text-button"):"")+'</div>'+
 B(G.turn>=V5_ROUNDS&&!G.queue.length&&G.term===1?"첫 임기 결과 확인 →":"다음 사건으로 →","next","","primary")+'</section>';
}
function hireView(){
 const role=G.staffStep===0?"finance":"chief",list=V5_STAFF[role];
 return card("나라가 망하기 전에","장관부터<br>임명하세요.","meeting",
 PAR(G.staffStep===0?["국고 관리 담당 장관이 필요합니다.","돈을 아낄까요, 팔아서 벌까요?"]:
 ["경제부 장관을 임명했습니다.","이번에는 대통령 편을 들어 줄 참모를 골라 보세요."])+
 '<div class="staff-choices">'+list.map((p,i)=>B('<b>'+h(p.name)+'</b><span>'+h(p.desc)+'</span>',"staff",'data-index="'+i+'"',"pick-button")).join("")+'</div>');
}
function miniView(){
 const m=G.mini;if(!m)return deskView();
 if(m.type==="cash"){
 const pos=[1,2,0,2,1][m.step];
 return card("미니게임 · "+(m.step+1)+"/5","돈을 주워서<br>국고를 채워요.","cash",
 PAR(["동전처럼 보이는 물건을 골라 주세요.","영수증이면 아무 일도 일어나지 않습니다."])+
 '<b class="mini-score">동전 획득: '+m.score+'개</b>'+
 '<div class="mini-actions">'+[0,1,2].map(i=>B(i===pos?"🪙":"🧾","mini",'data-index="'+i+'"',"mini-btn")).join("")+'</div>'+
 '<p class="smallprint">'+h(miniComment)+'</p>');
 }
 if(m.type==="tomato"){
 const pos=[0,2,1,0,2][m.step];
 return card("미니게임 · "+(m.step+1)+"/5","토마토를<br>피하세요!","tomato",
 PAR(["토마토가 없는 방향을 골라 주세요.","다섯 번 중 많이 피할수록 민심 보너스!"])+
 '<b class="mini-score">회피 성공: '+m.score+'회</b>'+
 '<div class="mini-actions">'+["왼쪽","가운데","오른쪽"].map((x,i)=>B((i===pos?"🟩 ":"🍅 ")+x,"mini",'data-index="'+i+'"',"mini-btn")).join("")+'</div>'+
 '<p class="smallprint">'+h(miniComment)+'</p>');
 }
 const opts=m.step===0?[G.name,"비서실장","왕관 쓴 닭"]:m.step===1?["108기",G.term+"기","평생 임기"]:["외계인 납치","치킨 국경 분쟁","대통령 퀴즈"];
 return card("퀴즈 미니게임 · "+(m.step+1)+"/3",m.step===0?"진짜 대통령님의<br>이름은?":m.step===1?"지금 몇 번째<br>임기인가요?":"이 미니게임의<br>종류는 무엇일까요?","double",
 '<b class="mini-score">맞힌 문제: '+m.score+'개</b>'+
 '<div class="quiz-actions">'+opts.map((x,i)=>B(h(x),"mini",'data-index="'+i+'"',"quiz-btn")).join("")+'</div>'+
 '<p class="smallprint">'+h(miniComment)+'</p>');
}
function electionView(){
 return card("가상 선거 · 제1기 종료","재선에<br>도전하시겠습니까?","medal",
 PAR(["첫 번째 임기가 끝났습니다.","바가늠공화국의 게임 속 선거가 시작됩니다."])+
 '<div class="choices">'+["고양이와 포스터 찍기","대통령 이불 굿즈 팔기","동전 줍기 대회 열기"].map((x,i)=>B(h(x),"campaign",'data-index="'+i+'"',"pick-button")).join("")+'</div>'+
 '<p class="smallprint">이 선거 결과는 게임 내부 규칙으로만 결정됩니다.</p>',
 B("재선 없이 퇴임하기","retire","","text-button"));
}
function resultView(){
 return card("가상 선거 결과",G.elected?"재선 성공!<br>아직 퇴근 못 합니다.":"재선 실패!<br>이제 퇴근하세요.",G.elected?"medal":"sleep",
 PAR(G.elected?["국민들이 또 한 번 기회를 줬습니다.","이번에도 나라가 조용할 것 같지는 않습니다."]:
 ["가상 선거에서 이번 임기가 끝났습니다.","집무실 침대는 이제 자유입니다."]),
 B(G.elected?"제2기 취임하기 →":"퇴임식으로 →",G.elected?"second":"retire","","primary"));
}
function endingView(){
 return card("게임 완료","대통령님,<br>수고하셨습니다.","medal",
 PAR(["총 "+G.history.length+"건의 사건을 처리했습니다.","나라가 어떻게 됐는지는 일지를 확인해 주세요."])+
 '<div class="end-stats">❤️ '+G.stats.heart+' · 💰 '+G.stats.money+' · 🤡 '+G.stats.chaos+'</div>',
 B("다시 시작하기 →","reset","","primary"));
}
function teamView(){
 return '<section class="sub-view"><h1>👔 내각</h1><p>이상한 나라에도 장관은 출근합니다.</p>'+
 Object.keys(V5_STAFF).map(k=>'<div class="record"><strong>'+(k==="finance"?"경제부 장관":"비서실장")+'</strong><p>'+
 h(V5_STAFF[k].find(x=>x.id===G.cabinet[k])?.name||"아직 미임명")+'</p></div>').join("")+
 '<div class="record">💌 비밀 편지: '+(G.flags.includes("love-letter")?"받았습니다!":"아직 도착하지 않았습니다.")+'</div></section>';
}
function archiveView(){
 return '<section class="sub-view"><h1>📰 지난 속보</h1><p>대통령님이 저지른 일을 다시 볼 수 있습니다.</p>'+
 (G.history.length?G.history.slice().reverse().map(n=>'<details class="record"><summary>'+h(n.title)+'</summary>'+
 PAR([n.source,n.choice,n.body])+'<div class="change-list">'+changes(n.delta)+'</div></details>').join(""):'<p>아직 일지가 텅 비었습니다.</p>')+'</section>';
}
function bankView(){
 return '<section class="sub-view"><h1>💰 국고 관리</h1><p>돈이 부족하면 장터를 열고, 피곤하면 낮잠을 잡니다.</p>'+
 '<div class="stats-grid">'+V5_KEYS.map(k=>'<div class="stat-row"><span>'+V5_ICON[k]+' '+V5_NAME[k]+'</span><b>'+G.stats[k]+'</b>'+
 '<i style="--fill:'+(k==="money"?G.stats[k]/180*100:G.stats[k])+'%"></i></div>').join("")+'</div>'+
 '<div class="relief"><strong>대통령의 긴급 살림살이</strong><p>각 행동은 한 턴에 한 번만 가능합니다.</p>'+
 B("국고 바자회 · 국고 +12 / 체력 -7","help",'data-kind="money"',G.usedHelp.includes(G.term+":"+G.turn+":money")?"secondary used":"secondary")+
 B("5분 낮잠 · 체력 +14 / 민심 -3","help",'data-kind="energy"',G.usedHelp.includes(G.term+":"+G.turn+":energy")?"secondary used":"secondary")+'</div>'+
 '<p class="smallprint">이 게임은 기기 브라우저에 자동 저장됩니다.</p>'+B("새 게임 시작하기","reset","","text-button")+'</section>';
}
function render(){
 if(!G){APP.innerHTML=landing();return;}
 if(G.phase==="processing"&&G.processingUntil<=Date.now()){G.phase="news";G.processingUntil=0;save();}
 const view=tab==="team"?teamView():tab==="paper"?archiveView():tab==="bank"?bankView():
 G.phase==="alarm"?alarmView():G.phase==="hire"?hireView():G.phase==="mini"?miniView():
 G.phase==="processing"?processingView():G.phase==="news"?newsView():G.phase==="election"?electionView():
 G.phase==="election-result"?resultView():G.phase==="end"?endingView():
 G.phase==="report"?reportView():G.phase==="decision"?decisionView():deskView();
 APP.innerHTML='<div class="v5-game">'+logo()+(tab==="home"?summary():"")+'<div class="scroll-pane" id="scrollPane">'+view+'</div>'+nav()+'</div>';
}
document.addEventListener("click",function(ev){
 const x=ev.target.closest("button[data-action]");if(!x||x.disabled)return;
 const act=x.dataset.action,i=Number(x.dataset.index);
 if(act==="start")start();
 else if(act==="resume"){const loaded=load();if(loaded){G=loaded;tab="home";render();scheduleNews();}}
 else if(act==="alarm")alarmTap();else if(act==="scene")setScene(x.dataset.scene);
 else if(act==="letter")readLetter();else if(act==="choose")pick(i);
 else if(act==="staff")chooseStaff(i);else if(act==="mini")miniTap(i);
 else if(act==="skip")newsNow();else if(act==="next")next();
 else if(act==="voices"){moreVoices=!moreVoices;render();}
 else if(act==="help")help(x.dataset.kind);
 else if(act==="campaign")campaign(i);else if(act==="second")secondTerm();
 else if(act==="retire")retire();else if(act==="reset")reset();
 else if(act==="tab"&&["home","team","paper","bank"].includes(x.dataset.tab)){tab=x.dataset.tab;render();}
});
G=load();if(G?.phase==="processing"){if(G.processingUntil<=Date.now()){G.phase="news";G.processingUntil=0;save();}else scheduleNews();}
render();
