'use strict';
(() => {
 const version=location.pathname.includes('03-independent')?'c':location.pathname.includes('02-saas')?'b':'a';
 const keys={a:'pm-review-a-20261107-v2',b:'pm-review-b-20261107-v2',c:'pm-review-c-20261107-v2'};
 const id='school-briefing', project='project/'+id;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let step=0,panel=null,selected=null,layer=null,cursor=null,mask=null,run=0,busy=false,frame=0,returnFocus=null;
 const bar=document.createElement('nav');bar.className='review-bar';bar.setAttribute('aria-label','Review versions');
 const home=document.createElement('a');home.href='../';home.textContent='All versions';bar.append(home);
 const name=document.createElement('strong');name.textContent={a:'Version 1',b:'Version 2',c:'Version 3'}[version];bar.append(name);
 function control(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);return b;}
 const launch=control('Guided demo',()=>start());
 bar.append(launch,control('Reset demo',()=>{if(confirm('Reset this version? Local edits will be removed.')){localStorage.removeItem(keys[version]);location.href=location.pathname+'#projects';}}));document.body.append(bar);
 const steps=[
  {title:'Registry',text:'Open the school briefing. The other entries are fictional examples.',route:'projects',target:version==='c'?'.selected-work':'[data-project-id="school-briefing"]'},
  {title:'Preview & status',text:'The preview is illustrative. Design recorded; live data unverified.',route:project,target:'.work-preview'},
  {title:'Build tools',text:'Choose an approach. Copy its instructions into your AI.',route:version==='c'?project:'tools/'+id+'/dashboard',action:version==='c'?'help':null,target:version==='c'?'#ways-help':'.form-panel'},
  {title:'Continue',text:'Copy context, open your AI, then paste. Nothing syncs automatically.',route:version==='c'?project:'continue/'+id,action:version==='c'?'resume':null,target:version==='c'?'#dialog':'.page-narrow'},
  {title:'Review an update',text:'Fictional exercise. Edit, reject or accept it yourself.',route:project,action:'demo-update',target:'#dialog'},
  {title:'History',text:'Only accepted changes enter the saved record.',route:version==='b'?project+'/activity':project,action:'history',target:version==='b'?'.project-activity':version==='c'?'.record-tools':'.history-fold'},
  {title:'Learning',text:'Optional practice. No lesson tracking is connected.',route:version==='c'?'learning':'learn/'+id,target:version==='c'?'.practice-list':'.practice-steps'},
  {title:'Export',text:'Download the record, or return to compare the other versions.',route:version==='b'?project+'/record':project,target:version==='c'?'[data-action="export"]':'[data-act="export"]'}
 ];
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const visible=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
 const find=selector=>Array.from(document.querySelectorAll(selector)).find(visible);
 function clearTarget(){selected?.classList.remove('tour-target');selected=null;}
 function end(){run++;busy=false;cancelAnimationFrame(frame);clearTarget();panel?.remove();layer?.remove();panel=layer=cursor=mask=null;document.body.classList.remove('tour-running');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 function hostLayers(){if(!panel)return;const d=document.querySelector('#dialog'),host=d?.open?d:document.body;for(const el of [layer,panel])if(el&&el.parentNode!==host)host.append(el);}
 function drawSpotlight(){if(!layer||!mask)return;const w=innerWidth,h=innerHeight;let hole='';if(selected?.isConnected&&visible(selected)){const r=selected.getBoundingClientRect(),x=Math.max(4,r.left-7),y=Math.max(4,r.top-7),right=Math.min(w-4,r.right+7),bottom=Math.min(h-4,r.bottom+7);if(right>x&&bottom>y)hole=` M${x} ${y}H${right}V${bottom}H${x}Z`;}
  mask.setAttribute('d',`M0 0H${w}V${h}H0Z${hole}`);
 }
 function scheduleSpotlight(){cancelAnimationFrame(frame);frame=requestAnimationFrame(drawSpotlight);}
 function focusTarget(el){clearTarget();selected=el;if(el&&!el.matches('dialog'))el.classList.add('tour-target');drawSpotlight();}
 function positionPanel(el){if(!panel)return;panel.style.top='';panel.style.bottom='16px';panel.style.left='';panel.style.right='16px';if(!el)return;const r=el.getBoundingClientRect(),ph=panel.getBoundingClientRect().height;
  // Keep the instruction card away from a small control near the bottom.
  if(r.top>innerHeight-ph-40&&r.height<innerHeight/2){panel.style.bottom='auto';panel.style.top='80px';}
  if(innerWidth>800&&r.left>innerWidth/2){panel.style.right='auto';panel.style.left='16px';}
 }
 async function clickVisible(selector,token){
  let el=find(selector);if(!el){const hidden=document.querySelector(selector);if(hidden){const parents=[];for(let p=hidden.parentElement;p;p=p.parentElement)if(p.matches('details:not([open])'))parents.unshift(p);for(const p of parents)await clickVisible('summary[data-tour-reveal="'+markSummary(p)+'"]',token);el=find(selector);}}
  if(!el||token!==run)return false;
  el.scrollIntoView({block:'center',behavior:'instant'});await pause(80);if(token!==run)return false;
  hostLayers();focusTarget(el);positionPanel(el);const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  panel.querySelector('.tour-progress').textContent='Opening '+(el.getAttribute('aria-label')||el.textContent.trim()||'section');
  cursor.hidden=false;cursor.classList.remove('clicking');cursor.style.transform=`translate(${Math.max(12,x-65)}px,${Math.min(innerHeight-30,y+55)}px)`;
  await pause(30);if(token!==run)return false;
  cursor.style.transform=`translate(${x}px,${y}px)`;
  await pause(reduced.matches?100:500);if(token!==run)return false;
  cursor.classList.add('clicking');await pause(reduced.matches?100:300);if(token!==run)return false;
  // Only same-page navigation and explicitly selected local controls enter here.
  el.click();cursor.hidden=true;await pause(120);return token===run;
 }
 let revealId=0;
 function markSummary(details){const s=details.querySelector(':scope > summary');if(!s.dataset.tourReveal)s.dataset.tourReveal=String(++revealId);return s.dataset.tourReveal;}
 async function navigate(route,token){
  if(location.hash==='#'+route)return;
  const selector='a[href="#'+route+'"]';
  if(await clickVisible(selector,token))return;
  if(token!==run)return;
  // Tool pages have a breadcrumb back to the record; every app has Registry navigation.
  if(route!==project&&route!=='projects'&&location.hash!=='#'+project)await navigate(project,token);
  if(await clickVisible(selector,token))return;
  if(token!==run)return;
  if(route.startsWith('tools/')){await clickVisible('a[href="#tools/'+id+'"]',token);if(await clickVisible(selector,token))return;}
  if(token!==run)return;
  if(route===project){await clickVisible('a[href="#projects"]',token);if(await clickVisible(selector,token))return;}
  if(token===run){location.hash=route;await pause(120);}
 }
 function fill(selector,value){const f=document.querySelector(selector);if(f){f.value=value;f.dispatchEvent(new Event('input',{bubbles:true}));}}
 function makePanel(){
  panel=document.createElement('aside');panel.className='review-tour';panel.setAttribute('aria-label','Guided demo');
  const top=document.createElement('div');top.className='tour-top';const count=document.createElement('span');count.className='tour-count';top.append(count);
  const fold=control('Minimize',()=>{const collapsed=panel.classList.toggle('collapsed');fold.textContent=collapsed?'Expand':'Minimize';layer.hidden=collapsed;});fold.className='tour-close';top.append(fold);const exit=control('Close',end);exit.className='tour-close';top.append(exit);panel.append(top);
  const body=document.createElement('div');body.className='tour-body';body.innerHTML='<h2 tabindex="-1"></h2><p></p><span class="tour-progress" role="status" aria-live="polite"></span>';
  const controls=document.createElement('div');controls.className='tour-controls';const back=control('Back',()=>{if(!busy)showStep(step-1);});back.dataset.tour='back';const next=control('Next',()=>{if(!busy){if(step===steps.length-1)end();else showStep(step+1);}});next.dataset.tour='next';next.className='primary';controls.append(back,next);body.append(controls);panel.append(body);
  layer=document.createElement('div');layer.className='tour-spotlight';layer.setAttribute('aria-hidden','true');layer.innerHTML='<svg class="tour-shade" width="100%" height="100%"><path fill-rule="evenodd"></path></svg><span class="tour-cursor" hidden><svg viewBox="0 0 28 34"><path d="M3 2v26l7-7 5 11 5-2-5-11h10Z"/></svg></span>';mask=layer.querySelector('path');cursor=layer.querySelector('.tour-cursor');hostLayers();
 }
 async function showStep(index){
  const token=++run;busy=true;step=index;const s=steps[step];clearTarget();panel.classList.remove('collapsed');layer.hidden=false;panel.setAttribute('aria-busy','true');panel.querySelectorAll('[data-tour]').forEach(b=>b.disabled=true);
  panel.querySelector('.tour-progress').textContent='';
  const d=document.querySelector('#dialog');if(d?.open){await clickVisible('[data-act="close-dialog"],[data-action="close"]',token);if(token!==run)return;if(d.open)d.close();hostLayers();}
  await navigate(s.route,token);if(token!==run)return;
  if(s.action==='help')await clickVisible('[data-action="quick-help"]',token);
  if(s.action==='resume')await clickVisible('[data-action="resume"]',token);
  if(s.action==='demo-update'){
   if(version==='c'){
    if(find('[data-action="review"]'))await clickVisible('[data-action="review"]',token);
    else{await clickVisible('[data-action="record"]',token);if(token===run){fill('#record-result',window.REVIEW_SAMPLE.demoDraft.result);fill('#record-next',window.REVIEW_SAMPLE.demoDraft.next);}}
   }else{await clickVisible('[data-act="update"]',token);if(token===run){fill('#result',window.REVIEW_SAMPLE.demoDraft.result);fill('#next-action',window.REVIEW_SAMPLE.demoDraft.next);}}
  }
  if(s.action==='history'){
   if(version==='c')await clickVisible('[data-action="tab"][data-id="history"]',token);
   if(version==='a'&&!document.querySelector('.history-fold')?.open)await clickVisible('.history-fold > summary',token);
  }
  if(token!==run)return;hostLayers();
  const target=find(s.target)||find('#main');if(target&&!target.matches('dialog'))target.scrollIntoView({block:'center',behavior:'instant'});
  panel.querySelector('.tour-count').textContent=`Step ${step+1} of ${steps.length}`;
  panel.querySelector('h2').textContent=s.title;panel.querySelector('.tour-body > p').textContent=s.text;panel.querySelector('.tour-progress').textContent='';
  panel.querySelector('[data-tour="back"]').disabled=step===0;const next=panel.querySelector('[data-tour="next"]');next.disabled=false;next.textContent=step===steps.length-1?'Finish demo':'Next';panel.setAttribute('aria-busy','false');busy=false;
  focusTarget(target);positionPanel(target);panel.querySelector('h2').focus({preventScroll:true});
 }
 function start(){end();returnFocus=document.activeElement;document.body.classList.add('tour-running');makePanel();showStep(0);}
 window.addEventListener('resize',scheduleSpotlight);document.addEventListener('scroll',scheduleSpotlight,true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel){e.preventDefault();end();}},true);
 const appDialog=document.querySelector('#dialog');if(appDialog)new MutationObserver(()=>{hostLayers();scheduleSpotlight();}).observe(appDialog,{attributes:true,attributeFilter:['open'],childList:true});
 if(new URLSearchParams(location.search).get('tour')==='1')start();
})();
