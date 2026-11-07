'use strict';
(() => {
 const version=location.pathname.includes('03-independent')?'c':location.pathname.includes('02-saas')?'b':'a';
 const names={a:'01 · Project workshop',b:'02 · Familiar workspace',c:'03 · Focused notebook'};
 const keys={a:'pm-review-a-20261107-v2',b:'pm-review-b-20261107-v2',c:'pm-review-c-20261107-v2'};
 const id='school-briefing'; let step=0, panel=null, selected=null;
 const bar=document.createElement('nav');bar.className='review-bar';bar.setAttribute('aria-label','Review versions');
 const home=document.createElement('a');home.href='../';home.textContent='All versions';bar.append(home);
 const name=document.createElement('strong');name.textContent=names[version];bar.append(name);
 function control(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);return b;}
 bar.append(control('Guided demo',()=>{step=0;showStep();}),control('Reset demo',()=>{if(confirm('Restore this version’s demo data? Your local edits in this version will be removed. Other versions are unchanged.')){localStorage.removeItem(keys[version]);location.href=location.pathname+'#projects';}}));document.body.append(bar);
 const steps=[
  {title:'Find the work that matters',text:version==='c'?'The school briefing is the current focus. Other projects remain available below. Compare this deliberate focus with the broader list in the other versions.':'Start with the school briefing. It is the same anonymized real project in every version; the other projects are clearly fictional examples.',route:'projects',target:version==='c'?'.focus':'[data-project-id="school-briefing"]'},
  {title:'Separate the result from the plan',text:'The dashboard design exists. Reliable school-data access is still unverified. The next step and milestone are labeled demo proposals; they are not claims that the learner completed them.',route:'project/'+id,target:version==='c'?'.next-block':version==='b'?'.next-task':'.action-panel'},
  {title:version==='c'?'Choose useful help':'Explore what this could become',text:version==='c'?'Try an outcome-based approach in Ways AI can help. These are reusable templates using saved context, not live AI recommendations.':'The dashboard instructions explain the work and carry the project context into your AI. Read or copy them; the tour does not open an external tool.',route:version==='c'?'project/'+id:'tools/'+id+'/dashboard',target:version==='c'?'[data-action="suggestion"]':'.build-heading'},
  {title:'Continue without losing context',text:'No private conversation links are included. The manual copy/open/paste path is available. A saved link is a shortcut, not permission for this app to read or sync a conversation.',route:version==='c'?'project/'+id:'continue/'+id,action:version==='c'?'resume':null,target:version==='c'?'#dialog':'.page-narrow'},
  {title:'Review a demonstration update',text:'This proposed result is fictional and labeled Demo exercise. Edit it, reject it, or explicitly accept it. The tour never accepts changes for you. Close this guide temporarily if you want more room.',route:'project/'+id,action:'demo-update',target:'#dialog'},
  {title:'See what was actually kept',text:'History separates saved results from changes to the plan. If you rejected the demo, the source record should be unchanged. If you accepted it, the new entry should say it was a demo exercise.',route:version==='b'?'project/'+id+'/activity':'project/'+id,action:'history',target:version==='b'?'.project-activity':version==='c'?'#main':'.history-fold'},
  {title:'Get help without a gate',text:'Optional practice lets you reconnect with the selected project. This prototype does not know attendance or lesson completion. You can return directly to your work.',route:version==='c'?'learning':'learn/'+id,target:version==='c'?'#main':'.page-narrow'},
  {title:'Try it your way',text:'Export the record, switch projects, or open this version on your phone. Use All versions to compare. Your changes stay in this browser and never affect the learner’s account.',route:'project/'+id,target:version==='c'?'[data-action="export"]':'[data-act="export"]'}
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
   if(s.action==='resume')appClick('[data-action="resume"]');
   if(s.action==='demo-update'){
    if(version==='c'){
     appClick('[data-action="record"]');
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
