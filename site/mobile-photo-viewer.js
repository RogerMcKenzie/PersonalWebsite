import { createPhotoZoom } from './photo-zoom.js?v=4';

// The contact sheet stays mounted behind a native modal, preserving its scroll position.
export function createMobilePhotoViewer({photos,reducedMotion,onStep,onClose}){
 const dialog=document.createElement('dialog');
 dialog.className='mobile-photo-viewer';
 dialog.setAttribute('aria-labelledby','mobile-photo-title');
 dialog.innerHTML=`<header class="mobile-photo-top"><button type="button" class="mobile-photo-close" aria-label="Return to camera"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>All photos</button><span class="mobile-photo-count" aria-live="polite"></span><button type="button" class="mobile-photo-zoom" disabled>Zoom in</button></header><div class="mobile-photo-stage" tabindex="0" role="region" aria-label="Photograph. Swipe left or right to browse"><span class="mobile-photo-status" role="status" hidden></span><button type="button" class="mobile-photo-retry" hidden>Try again</button></div><footer class="mobile-photo-bottom"><div class="mobile-photo-caption"><h1 id="mobile-photo-title"></h1><p></p></div><div class="mobile-photo-arrows"><button type="button" aria-label="Previous photograph"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button type="button" aria-label="Next photograph"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div></footer>`;
 document.body.append(dialog);
 const stage=dialog.querySelector('.mobile-photo-stage');
 const status=dialog.querySelector('.mobile-photo-status');
 const retry=dialog.querySelector('.mobile-photo-retry');
 const previous=dialog.querySelector('[aria-label="Previous photograph"]');
 const next=dialog.querySelector('[aria-label="Next photograph"]');
 const closeButton=dialog.querySelector('.mobile-photo-close');
 let index=0,displayedIndex=-1,image=null,request=0,gesture=null,closing=false;
 let transition=null,transitionImage=null,photoAnimation=null,outgoingImage=null,outgoingAnimation=null;
 let surfaceAnimations=[];
 let openingOrigin=null,completeClose=null,closeRequested=false;
 const zoom=createPhotoZoom({stage,button:dialog.querySelector('.mobile-photo-zoom'),pinch:true,onGesture(){
  gesture=null;
  stopMotion();
 }});

 function stopMotion(){
  transition?.cancel();transition=null;
  transitionImage?.remove();transitionImage=null;
  for(const animation of surfaceAnimations)animation.cancel();surfaceAnimations=[];
  photoAnimation?.cancel();photoAnimation=null;
  outgoingAnimation?.cancel();outgoingAnimation=null;
  outgoingImage?.remove();outgoingImage=null;
  if(image){image.style.visibility='';image.style.transform='';}
 }
 function thumb(){return document.querySelector(`[data-photo="${index}"]`);}
 function visibleThumbRect(element){
  if(!element)return null;
  const rect=element.getBoundingClientRect();
  const lcd=document.getElementById('display-content').getBoundingClientRect();
  return rect.width&&rect.top>=Math.max(0,lcd.top)-1&&rect.bottom<=Math.min(innerHeight,lcd.bottom)+1?rect:null;
 }
 function imageRect(){
  const rect=stage.getBoundingClientRect();
  const scale=Math.min(rect.width/image.naturalWidth,rect.height/image.naturalHeight);
  const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
  return {left:rect.left+(rect.width-width)/2,top:rect.top+(rect.height-height)/2,width,height};
 }
 function sharedTransition(origin,reverse=false){
  const rect=visibleThumbRect(origin);
  if(reducedMotion.matches||!rect||!image?.naturalWidth)return null;
  stopMotion();
  const target=imageRect();
  const clone=image.cloneNode();
  clone.className='mobile-photo-transition';clone.alt='';clone.setAttribute('aria-hidden','true');
  dialog.append(clone);transitionImage=clone;image.style.visibility='hidden';
  const frames=[{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`},{left:`${target.left}px`,top:`${target.top}px`,width:`${target.width}px`,height:`${target.height}px`}];
  const options={duration:reverse?180:230,easing:reverse?'cubic-bezier(.4,0,1,1)':'cubic-bezier(0,0,.2,1)',fill:'both'};
  transition=clone.animate(reverse?frames.reverse():frames,options);
  const surface=[{backgroundColor:'#0b0b0c00'},{backgroundColor:'#0b0b0c'}];
  const chrome=[{opacity:0},{opacity:1}];
  surfaceAnimations=[dialog.animate(reverse?surface.reverse():surface,options),...['.mobile-photo-top','.mobile-photo-bottom'].map(selector=>dialog.querySelector(selector).animate(reverse?[...chrome].reverse():chrome,options))];
  for(const animation of surfaceAnimations)animation.finished.catch(()=>{});
  return transition;
 }
 function loadPhoto({origin=null,direction=0}={}){
  const token=++request,p=photos[index];
  stopMotion();
  zoom.setImage(null);
  dialog.querySelector('h1').textContent=p.title;
  dialog.querySelector('.mobile-photo-caption p').textContent=[p.location,p.year].filter(Boolean).join(' · ');
  stage.setAttribute('aria-busy','true');
  status.textContent='Loading photo';status.hidden=false;retry.hidden=true;
  const incoming=new Image();
  incoming.className='mobile-photo-image';incoming.alt=p.alt;incoming.draggable=false;
  incoming.onload=()=>{
   if(token!==request||!dialog.open||closing)return;
   stage.removeAttribute('aria-busy');status.hidden=true;
   const outgoing=image;
   outgoing?.setAttribute('aria-hidden','true');
   stage.prepend(incoming);image=incoming;displayedIndex=index;
   zoom.setImage(incoming);
   if(origin){
    outgoing?.remove();
    const animation=sharedTransition(origin);
    animation?.finished.then(()=>stopMotion()).catch(()=>{});
   }else if(outgoing&&!reducedMotion.matches){
    outgoingImage=outgoing;
    outgoingAnimation=outgoing.animate([{opacity:1},{opacity:0}],{duration:160,easing:'ease-out'});
    outgoingAnimation.finished.then(()=>{outgoing.remove();if(outgoingImage===outgoing){outgoingImage=null;outgoingAnimation=null;}},()=>outgoing.remove());
    photoAnimation=incoming.animate([{opacity:0,transform:`translateX(${direction*18}px)`},{opacity:1,transform:'translateX(0)'}],{duration:200,easing:'ease-out'});
    photoAnimation.finished.catch(()=>{});
   }else outgoing?.remove();
   for(const neighbour of [index-1,index+1])if(photos[neighbour]){const preload=new Image();preload.src=photos[neighbour].src;}
  };
  incoming.onerror=()=>{
   if(token!==request||!dialog.open||closing)return;
   stage.removeAttribute('aria-busy');status.textContent='This photo couldn’t load';retry.hidden=false;
  };
  incoming.src=p.src;
 }
 function updateControls(){
  previous.disabled=index===0;next.disabled=index===photos.length-1;
  dialog.querySelector('.mobile-photo-count').textContent=`${index+1} / ${photos.length}`;
 }
 function open(at,{origin=null}={}){
  if(closing)completeClose?.();
  if(dialog.open){update(at);return;}
  index=at;closing=false;closeRequested=false;openingOrigin=origin;
  document.documentElement.classList.add('mobile-photo-open');
  dialog.showModal();
  updateControls();loadPhoto({origin});
  closeButton.focus({preventScroll:true});
 }
 function update(at,direction=0){
  if(!dialog.open||closing||at===index)return;
  index=at;updateControls();loadPhoto({direction});
 }
 function close({animate=true,restoreFocus=true}={}){
  if(!dialog.open||closing)return;
  closing=true;const closeRequest=++request;gesture=null;stopMotion();zoom.setImage(null);
  const origin=thumb()||openingOrigin;
  const finish=()=>{
   if(!closing||request!==closeRequest)return;
   stopMotion();dialog.close();image?.remove();image=null;
   document.documentElement.classList.remove('mobile-photo-open');
   closing=false;closeRequested=false;completeClose=null;
   if(restoreFocus&&origin?.isConnected)origin.focus({preventScroll:true});
  };
  completeClose=finish;
  const animation=animate&&displayedIndex===index?sharedTransition(origin,true):null;
  if(animation)animation.finished.then(finish,finish);else finish();
 }
 function requestClose(){if(closing||closeRequested)return;closeRequested=true;onClose();}
 closeButton.addEventListener('click',requestClose);
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(zoom.zoomed)zoom.reset();else requestClose();});
 previous.addEventListener('click',()=>{if(!closing)onStep(-1);});
 next.addEventListener('click',()=>{if(!closing)onStep(1);});
 retry.addEventListener('click',()=>loadPhoto({origin:image?null:thumb()}));
 stage.addEventListener('pointerdown',event=>{
  if(event.button!==0||!event.isPrimary||closing||event.target.closest('button'))return;
  stopMotion();
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,dragging:false};
 });
 stage.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.dragging){
   if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){gesture=null;return;}
   if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy)*1.2)return;
   gesture.dragging=true;stage.setPointerCapture(event.pointerId);
  }
  const atEnd=(index===0&&dx>0)||(index===photos.length-1&&dx<0);
  if(image)image.style.transform=`translateX(${atEnd?dx/(1+Math.abs(dx)/60):dx}px)`;
 });
 function endGesture(event,cancelled=false){
  if(!gesture||event.pointerId!==gesture.id)return;
  const dx=event.clientX-gesture.x,dragging=gesture.dragging;
  gesture=null;
  if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
  const direction=dx<0?1:-1;
  const canStep=index+direction>=0&&index+direction<photos.length;
  if(!cancelled&&dragging&&Math.abs(dx)>Math.min(60,stage.clientWidth*.18)&&canStep){onStep(direction);return;}
  if(image){
   const from=image.style.transform;
   image.style.transform='';
   if(from&&!reducedMotion.matches){
    photoAnimation=image.animate([{transform:from},{transform:'translateX(0)'}],{duration:160,easing:'ease-out'});
    photoAnimation.finished.catch(()=>{});
   }
  }
 }
 stage.addEventListener('pointerup',event=>endGesture(event));
 stage.addEventListener('pointercancel',event=>endGesture(event,true));
 stage.addEventListener('lostpointercapture',event=>{
  if(event.target===stage)endGesture(event,true);
 });
 window.addEventListener('resize',stopMotion);
 reducedMotion.addEventListener('change',stopMotion);
 return {get isOpen(){return dialog.open;},open,update,close};
}
