(() => {
 const root=document.querySelector('[data-experience]'); if(!root)return;
 const en=root.dataset.language==='en', models=[...root.querySelectorAll('.bx-model')], dock=root.querySelector('[data-tour]');
 const play=root.querySelector('[data-play]'), prev=root.querySelector('[data-prev]'), next=root.querySelector('[data-next]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0, running=false, timer;
 const label=(ar,eng)=>en?eng:ar;
 function select(model,scene){model.querySelectorAll('[data-scene]').forEach((button,j)=>button.setAttribute('aria-pressed',String(j===scene)));model.querySelectorAll('[data-panel]').forEach((panel,j)=>panel.hidden=j!==scene);}
 function schedule(){clearTimeout(timer);if(running)timer=setTimeout(()=>{if(index===17){running=false;update();}else{index++;show(true);}},10000);}
 function update(){prev.disabled=index===0;next.disabled=index===17;play.textContent=running?label('إيقاف','Pause'):index===17?label('إعادة الجولة','Replay'):label('استكمال','Resume');play.setAttribute('aria-pressed',String(running));root.querySelector('[data-tour-label]').textContent='BOWDY '+models[Math.floor(index/3)].id.toUpperCase()+' · '+models[Math.floor(index/3)].querySelectorAll('[data-scene]')[index%3].textContent;root.querySelector('[data-tour-narration]').textContent=models[Math.floor(index/3)].querySelectorAll('[data-panel]')[index%3].querySelector('.bx-scene-notes li p').textContent;root.querySelector('[data-tour-count]').textContent=`${index+1} / 18`;root.querySelector('[data-tour-progress]').value=index+1;schedule();}
 function show(scroll){const model=models[Math.floor(index/3)];select(model,index%3);models.forEach(m=>m.classList.toggle('bx-active-model',m===model));if(scroll)model.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});update();}
 models.forEach((model,i)=>{select(model,0);model.querySelectorAll('[data-scene]').forEach((button,j)=>button.addEventListener('click',()=>{running=false;index=i*3+j;show(false);}));});
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
