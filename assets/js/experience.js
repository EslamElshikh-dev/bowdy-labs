(() => {
 const root=document.querySelector('[data-experience]'); if(!root)return;
 const en=root.dataset.language==='en', models=[...root.querySelectorAll('.bx-model')], dock=root.querySelector('[data-tour]');
 const play=root.querySelector('[data-play]'), prev=root.querySelector('[data-prev]'), next=root.querySelector('[data-next]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0, running=false, timer;
 const label=(ar,eng)=>en?eng:ar;
 function select(model,scene,animate=true){
  const buttons=[...model.querySelectorAll('[data-scene]')],panels=[...model.querySelectorAll('[data-panel]')],target=panels[scene];
  buttons.forEach((button,j)=>button.setAttribute('aria-pressed',String(j===scene)));
  panels.forEach((panel,j)=>{panel.hidden=j!==scene;panel.classList.remove('bx-scene-active');});
  model.style.setProperty('--scene-progress',`${(scene+1)*33.333}%`);
  target.classList.add('bx-scene-active');
  if(animate&&!reduced.matches&&target.animate){
   target.animate([{opacity:0,transform:`translateX(${document.dir==='rtl'?'-':' '}22px) scale(.985)`,filter:'blur(5px)'},{opacity:1,transform:'translateX(0) scale(1)',filter:'blur(0)'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
 }
 function schedule(){clearTimeout(timer);if(running)timer=setTimeout(()=>{if(index===17){running=false;update();}else{index++;show(true);}},8000);}
 function update(){root.classList.toggle('bx-tour-running',running);prev.disabled=index===0;next.disabled=index===17;play.textContent=running?label('إيقاف','Pause'):index===17?label('إعادة الجولة','Replay'):label('استكمال','Resume');play.setAttribute('aria-pressed',String(running));root.querySelector('[data-tour-label]').textContent='BOWDY '+models[Math.floor(index/3)].id.toUpperCase()+' · '+models[Math.floor(index/3)].querySelectorAll('[data-scene]')[index%3].textContent.trim();root.querySelector('[data-tour-narration]').textContent=models[Math.floor(index/3)].querySelectorAll('[data-panel]')[index%3].querySelector('.bx-scene-notes li p').textContent;root.querySelector('[data-tour-count]').textContent=`${index+1} / 18`;root.querySelector('[data-tour-progress]').value=index+1;schedule();}
 function show(scroll){const model=models[Math.floor(index/3)];select(model,index%3,true);models.forEach(m=>m.classList.toggle('bx-active-model',m===model));if(scroll)model.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});update();}
 models.forEach((model,i)=>{select(model,0,false);model.querySelectorAll('[data-scene]').forEach((button,j)=>button.addEventListener('click',()=>{running=false;index=i*3+j;show(false);}));});
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('bx-in-view',entry.isIntersecting)),{threshold:0.12});models.forEach(m=>observer.observe(m));
 root.querySelector('[data-start-tour]').hidden=false;
 root.querySelector('[data-start-tour]').addEventListener('click',()=>{index=0;running=true;dock.hidden=false;show(true);});
 prev.addEventListener('click',()=>{running=false;index=Math.max(0,index-1);show(true);});next.addEventListener('click',()=>{running=false;index=Math.min(17,index+1);show(true);});
 play.addEventListener('click',()=>{if(index===17&&!running)index=0;running=!running;show(true);});
 function close(){running=false;clearTimeout(timer);dock.hidden=true;models.forEach(m=>m.classList.remove('bx-active-model'));}
 root.querySelector('[data-close]').addEventListener('click',()=>{close();root.querySelector('[data-start-tour]').focus({preventScroll:true});});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;update();}});
 root.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{running=false;update();}));
})();
