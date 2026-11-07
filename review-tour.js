'use strict';
(() => {
 const version=location.pathname.includes('03-independent')?'c':location.pathname.includes('02-saas')?'b':'a';
 const names={a:'Version 1',b:'Version 2',c:'Version 3'};
 const keys={a:'pm-review-a-20261107-v2',b:'pm-review-b-20261107-v2',c:'pm-review-c-20261107-v2'};
 const id='school-briefing'; let step=0, panel=null, selected=null;
 const bar=document.createElement('nav');bar.className='review-bar';bar.setAttribute('aria-label','Review versions');
 const home=document.createElement('a');home.href='../';home.textContent='All versions';bar.append(home);
 const name=document.createElement('strong');name.textContent=names[version];bar.append(name);
 function control(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);return b;}
 bar.append(control('Guided demo',()=>{step=0;showStep();}),control('Reset demo',()=>{if(confirm('Reset this version? Local edits will be removed.')){localStorage.removeItem(keys[version]);location.href=location.pathname+'#projects';}}));document.body.append(bar);
 const steps=[
  {title:'Registry',text:'Open the school briefing. The other entries are fictional examples.',route:'projects',target:version==='c'?'.selected-work':'[data-project-id="school-briefing"]'},
  {title:'Preview & status',text:'The preview is illustrative. Design recorded; live data unverified.',route:'project/'+id,target:'.work-preview'},
  {title:'Build tools',text:'Choose an approach. Copy its instructions into your AI.',route:version==='c'?'project/'+id:'tools/'+id+'/dashboard',action:version==='c'?'help':null,target:version==='c'?'#ways-help':'.build-heading'},
  {title:'Continue',text:'Copy context, open your AI, then paste. Nothing syncs automatically.',route:version==='c'?'project/'+id:'continue/'+id,action:version==='c'?'resume':null,target:version==='c'?'#dialog':'.page-narrow'},
  {title:'Review an update',text:'Fictional exercise. Edit, reject or accept it yourself.',route:'project/'+id,action:'demo-update',target:'#dialog'},
  {title:'History',text:'Only accepted changes enter the saved record.',route:version==='b'?'project/'+id+'/activity':'project/'+id,action:'history',target:version==='b'?'.project-activity':version==='c'?'#main':'.history-fold'},
  {title:'Learning',text:'Optional practice. No lesson tracking is connected.',route:version==='c'?'learning':'learn/'+id,target:'#main'},
  {title:'Export',text:'Download the record, or return to compare the other versions.',route:'project/'+id,target:version==='c'?'[data-action="export"]':'[data-act="export"]'}
 ];
 function end(){if(panel)panel.remove();panel=null;if(selected)selected.classList.remove('tour-target');selected=null;}
 function closeAppDialog(){const d=document.querySelector('#dialog');if(d?.open){const close=d.querySelector('[data-act="close-dialog"],[data-action="close"]');if(close)close.click();else d.close();}}
 function appClick(selector){const b=document.querySelector(selector);if(b)b.click();return b;}
 function fill(selector,value){const f=document.querySelector(selector);if(f){f.value=value;f.dispatchEvent(new Event('input',{bubbles:true}));}}
 function showStep(){
  if(panel)panel.remove();if(selected)selected.classList.remove('tour-target');closeAppDialog();const s=steps[step];location.hash=s.route;
  panel=document.createElement('aside');panel.className='review-tour';panel.setAttribute('aria-label','Guided demo');
  const top=document.createElement('div');top.className='tour-top';const count=document.createElement('span');count.textContent=`Step ${step+1} of ${steps.length}`;top.append(count);
  const fold=control('Minimize',()=>{const collapsed=panel.classList.toggle('collapsed');fold.textContent=collapsed?'Expand':'Minimize';});fold.className='tour-close';top.append(fold);const exit=control('Close',end);exit.className='tour-close';top.append(exit);panel.append(top);
  const body=document.createElement('div');body.className='tour-body';const h=document.createElement('h2');h.textContent=s.title;const p=document.createElement('p');p.textContent=s.text;body.append(h,p);const controls=document.createElement('div');controls.className='tour-controls';const back=control('Back',()=>{step--;showStep();});back.disabled=step===0;const next=control(step===steps.length-1?'Finish demo':'Next',()=>{if(step===steps.length-1)end();else{step++;showStep();}});next.className='primary';controls.append(back,next);body.append(controls);panel.append(body);document.body.append(panel);
  setTimeout(()=>{
   if(s.action==='help')appClick('[data-action="quick-help"]');
   if(s.action==='resume')appClick('[data-action="resume"]');
   if(s.action==='demo-update'){
    if(version==='c'){
     appClick('[data-action="review"]')||appClick('[data-action="record"]');
     if(document.querySelector('#record-result')){fill('#record-result',window.REVIEW_SAMPLE.demoDraft.result);fill('#record-next',window.REVIEW_SAMPLE.demoDraft.next);document.querySelector('#record-form')?.requestSubmit();}
    }else{appClick('[data-act="update"]');fill('#result',window.REVIEW_SAMPLE.demoDraft.result);fill('#next-action',window.REVIEW_SAMPLE.demoDraft.next);}
   }
   if(s.action==='history'){
    if(version==='c')appClick('[data-action="tab"][data-id="history"]');
    if(version==='a'){const h=document.querySelector('.history-fold');if(h)h.open=true;}
   }
   const modal=document.querySelector('#dialog');if(modal?.open&&panel)modal.append(panel);
   selected=document.querySelector(s.target);if(selected&&!selected.matches('dialog')){selected.classList.add('tour-target');selected.scrollIntoView({block:'center',behavior:'instant'});}
  },100);
 }
 const appDialog=document.querySelector('#dialog');if(appDialog)new MutationObserver(()=>{if(!panel)return;const host=appDialog.open?appDialog:document.body;if(panel.parentNode!==host)host.append(panel);}).observe(appDialog,{attributes:true,attributeFilter:['open'],childList:true});
 if(new URLSearchParams(location.search).get('tour')==='1')showStep();
})();
