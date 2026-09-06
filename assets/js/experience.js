(() => {
 const root=document.querySelector('[data-experience]'); if(!root)return;
 const en=root.dataset.language==='en', models=[...root.querySelectorAll('.bx-model')], dock=root.querySelector('[data-tour]');
 const play=root.querySelector('[data-play]'), prev=root.querySelector('[data-prev]'), next=root.querySelector('[data-next]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0, running=false, timer;
 const label=(ar,eng)=>en?eng:ar;
 function select(model,scene,animate=true){
  const buttons=[...model.querySelectorAll('[data-scene]')],panels=[...model.querySelectorAll('[data-panel]')],target=panels[scene],previous=Number(model.dataset.activeScene??scene);
  buttons.forEach((button,j)=>button.setAttribute('aria-pressed',String(j===scene)));
  panels.forEach((panel,j)=>{panel.hidden=j!==scene;panel.classList.remove('bx-scene-active');});
  model.style.setProperty('--scene-progress',`${(scene+1)*33.333}%`);
  model.dataset.direction=scene>=previous?'forward':'backward';
  model.dataset.activeScene=String(scene);
  model.querySelector('[data-model-current]').textContent=String(scene+1).padStart(2,'0');
  model.querySelector('[data-model-prev]').disabled=scene===0;
  model.querySelector('[data-model-next]').disabled=scene===panels.length-1;
  target.classList.add('bx-scene-active');
  if(animate&&!reduced.matches&&target.animate){
   model.classList.remove('bx-path-moving');
   void model.offsetWidth;
   model.classList.add('bx-path-moving');
   const flow=(scene>=previous?1:-1)*(document.dir==='rtl'?-1:1);
   target.animate([{opacity:0,transform:`translateX(${flow*28}px) scale(.98)`,filter:'blur(6px)'},{opacity:1,transform:'translateX(0) scale(1)',filter:'blur(0)'}],{duration:560,easing:'cubic-bezier(.16,1,.3,1)'});
  }
 }
 function schedule(){clearTimeout(timer);if(running)timer=setTimeout(()=>{if(index===17){running=false;update();}else{index++;show(true);}},8000);}
 function update(){const model=models[Math.floor(index/3)],scene=index%3,sceneName=model.querySelectorAll('[data-scene]')[scene].querySelector('b').textContent,modelName='BOWDY '+model.id.toUpperCase(),sceneNo=String(scene+1).padStart(2,'0');root.classList.toggle('bx-tour-running',running);prev.disabled=index===0;next.disabled=index===17;play.textContent=running?label('إيقاف','Pause'):index===17?label('إعادة الجولة','Replay'):label('استكمال','Resume');play.setAttribute('aria-pressed',String(running));root.querySelector('[data-tour-label]').textContent=en?`${modelName} · ${sceneNo} · ${sceneName}`:`${sceneName} · ${sceneNo} · ${modelName}`;root.querySelector('[data-tour-narration]').textContent=model.querySelectorAll('[data-panel]')[scene].querySelector('.bx-scene-notes li p').textContent;root.querySelector('[data-tour-count]').textContent=`${index+1} / 18`;root.querySelector('[data-tour-progress]').value=index+1;schedule();}
 function show(scroll){const model=models[Math.floor(index/3)];select(model,index%3,true);models.forEach(m=>m.classList.toggle('bx-active-model',m===model));if(scroll)model.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});update();}
 models.forEach((model,i)=>{
  const move=scene=>{running=false;index=i*3+Math.max(0,Math.min(2,scene));show(false);};
  let swipeStart=null;
  select(model,0,false);
  model.querySelectorAll('[data-scene]').forEach((button,j)=>button.addEventListener('click',()=>move(j)));
  model.querySelector('[data-model-prev]').addEventListener('click',()=>move(Number(model.dataset.activeScene)-1));
  model.querySelector('[data-model-next]').addEventListener('click',()=>move(Number(model.dataset.activeScene)+1));
  model.querySelector('.bx-demo').addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'&&!event.target.closest('button,a'))swipeStart=event.clientX;});
  model.querySelector('.bx-demo').addEventListener('pointerup',event=>{if(swipeStart===null)return;const distance=event.clientX-swipeStart,current=Number(model.dataset.activeScene);swipeStart=null;if(Math.abs(distance)>48)move(current+(distance<0?1:-1));});
  model.querySelector('.bx-demo').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;const forward=document.dir==='rtl'?event.key==='ArrowLeft':event.key==='ArrowRight';event.preventDefault();move(Number(model.dataset.activeScene)+(forward?1:-1));});
 });
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
