import { sections, sectionIds, sectionAliases, normaliseSection, browsingLabel } from './sections.js?v=content-names-20261117-1';
import { contentTabs, contentItems, selectedContentIndex, contactIconsHTML, photos, videos, lists, menuPreviews, previewHTML, slideshowView, indexCaption, viewHTML } from './portfolio-views.js?v=photo-playback-1';
import { createPhotoZoom } from './photo-zoom.js?v=4';
import { createMobilePhotoViewer } from './mobile-photo-viewer.js?v=photo-playback-1';

const views=sectionIds;
const navViews=new Set(views.filter(view=>view!=='home'));
// Keep the static fallback useful without JavaScript; hydrate live labels from one registry.
document.querySelectorAll('[data-view]').forEach(button=>{
 const label=button.querySelector('.control-label')||button;
 label.textContent=sections[button.dataset.view];
});
// Hide duplicate lettering only when the visible model/poster supplies the printed ink.
const cameraBody=document.querySelector('.camera');
const cameraPoster=cameraBody.querySelector('.camera-shell');
const cameraDesktop=matchMedia('(min-width:1001px)');
function updatePrintedControls(){
 const posterReady=cameraPoster.complete&&cameraPoster.naturalWidth>0;
 const modelReady=cameraDesktop.matches&&cameraBody.classList.contains('camera-3d-ready');
 const printed=modelReady?cameraBody.classList.contains('camera-printed-model'):posterReady;
 cameraBody.classList.toggle('camera-ink',printed);
}
cameraPoster.addEventListener('load',updatePrintedControls);
cameraPoster.addEventListener('error',updatePrintedControls);
cameraDesktop.addEventListener('change',updatePrintedControls);
new MutationObserver(updatePrintedControls).observe(cameraBody,{attributes:true,attributeFilter:['class']});
updatePrintedControls();

let current='home';
let photoIndex=0;
let photoMode='index';
let photoTab='all';
let allIndex=0;
let videoIndex=0;
const listIndex={projects:0};
const lcd=document.getElementById('lcd');
const display=document.getElementById('display-content');
const cameraMenu=document.getElementById('camera-menu');
const menuToggle=document.getElementById('menu-toggle');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let desktopZoom;
let desktopZoomLoad;
function bindDesktopZoom(){
 desktopZoom?.dispose();
 desktopZoomLoad?.abort();
 const stage=display.querySelector('.lcd-photo-zoom');
 desktopZoom=null;
 if(!stage)return;
 desktopZoom=createPhotoZoom({stage,button:stage});
 const image=stage.querySelector('img');
 if(image.complete)desktopZoom.setImage(image);
 else {
  desktopZoomLoad=new AbortController();
  const zoom=desktopZoom;
  image.addEventListener('load',()=>zoom.setImage(image),{once:true,signal:desktopZoomLoad.signal});
 }
}
const mobilePhotos=createMobilePhotoViewer({photos,reducedMotion,onStep:changePhoto,onClose:()=>setPhotoMode('index',{focus:true})});
const dialIndicator=document.getElementById('dial-indicator');
const dialAngles={home:0,projects:90,photos:180,resume:270,contact:0};
let indicatorAngle=0;
function setDialIndicator(degrees){
 // Take the short route across the 0/360 boundary; an interrupted turn starts
 // from the current visual angle through the browser's CSS transition.
 degrees+=Math.round((indicatorAngle-degrees)/360)*360;
 indicatorAngle=degrees;
 dialIndicator.style.setProperty('--angle',degrees+'deg');
}
const keyboardNavigation=()=>document.documentElement.dataset.navigation==='keyboard';
let resumeResizeObserver;
let resumeLoadingTimer;
let menuOpener;
const viewState=()=>({photoIndex,photoMode:!cameraDesktop.matches&&photoMode==='show'?'index':photoMode,photoTab,allIndex,videoIndex,listIndex,mobile:!cameraDesktop.matches});

// ---------------------------------------------------------------- navigation
const normalise=normaliseSection;
function updateNav(){
 const navOn=!cameraMenu.hidden?false:navViews.has(current)&&!(current==='photos'&&photoMode!=='index');
 lcd.dataset.nav=navOn?'on':'off';
 const menuButton=document.querySelector('.mobile-nav [data-open-menu]');
 const menuCurrent=!cameraMenu.hidden||['resume','contact'].includes(current);
 if(menuCurrent)menuButton.setAttribute('aria-current','page');else menuButton.removeAttribute('aria-current');
 menuButton.setAttribute('aria-expanded',String(!cameraMenu.hidden));
}
function iframeViewportRatio(host){
 // How many CSS px of iframe viewport one layout px gives inside this host.
 const probe=document.createElement('iframe');
 probe.style.cssText='position:absolute;left:0;top:0;width:100px;height:10px;border:0;visibility:hidden;pointer-events:none';
 probe.setAttribute('aria-hidden','true');probe.tabIndex=-1;
 host.append(probe);
 const inner=probe.contentWindow?.innerWidth;
 probe.remove();
 return inner>0?inner/100:1;
}
function observeResumeFrame(frame){
 const viewer=frame.parentElement;
 const observer=new ResizeObserver(()=>{
  const width=viewer.clientWidth,height=viewer.clientHeight;
  if(!width||!height)return;
  const ratio=iframeViewportRatio(viewer);
  const frameWidth=1000/ratio,cropWidth=870/ratio,scale=width/cropWidth;
  frame.style.width=`${frameWidth}px`;
  frame.style.height=`${height/scale}px`;
  frame.style.transform=`scale(${scale}) translateX(${-(frameWidth-cropWidth)/2}px)`;
 });
 observer.observe(viewer);
 return observer;
}
function applyView(view,{focus=false,hash=true}={}){
 mobilePhotos.close({animate:false,restoreFocus:false});
 const changed=current!==normalise(view);
 view=normalise(view);
 current=view;
 setMenuOpen(false);
 document.body.dataset.cameraView=view;
 resumeResizeObserver?.disconnect();resumeResizeObserver=null;
 clearTimeout(resumeLoadingTimer);
 display.innerHTML=`<div class="view">${viewHTML(view,viewState())}</div>`;
 bindDesktopZoom();
 display.scrollTop=0;
 updateNav();
 if(view==='home'){
  const focusBox=display.querySelector('.lcd-focus');
  setTimeout(()=>focusBox?.classList.add('is-locked'),reducedMotion.matches?0:350);
 }
 const resumeFrame=display.querySelector('.resume-frame');
 if(resumeFrame){
  // Google's preview centres an ~820px page once its viewport is wide enough, and pins it
  // left (cutting the right side) when it is not. Browsers differ in how a zoomed parent
  // changes an iframe's own viewport, so measure that, give the preview a 1000px viewport,
  // and crop to the page plus a small margin.
  const viewer=resumeFrame.parentElement;
  resumeResizeObserver=observeResumeFrame(resumeFrame);
  resumeLoadingTimer=setTimeout(()=>{
   const loading=viewer.querySelector('.resume-loading');
   if(loading&&!loading.hidden)loading.textContent=`Preview taking a while? Open the résumé ${cameraDesktop.matches?'above':'below'}`;
  },10000);
  resumeFrame.addEventListener('load',()=>{
   clearTimeout(resumeLoadingTimer);
   viewer.removeAttribute('data-loading');
   resumeFrame.previousElementSibling.hidden=true;
  },{once:true});
 }
 document.querySelectorAll('.dial-item,.dial-center,.lcd-nav [data-view],.mobile-nav [data-view]').forEach(b=>{
  if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
 });
 if(!wheelDrag?.turning)setDialIndicator(dialAngles[view]);
 updateBrowseLabels();
 const route=view==='photos'?`content/${photoTab}`:view;
 if(hash&&location.hash!==`#${route}`)history.pushState(photoHistory(),'',`#${route}`);
 document.title=`Roger McKenzie | ${view==='home'?'Software, photography & content':sections[view]}`;
 if(focus)display.focus({preventScroll:true});
 if(changed&&!cameraDesktop.matches)window.scrollTo({top:0,behavior:'instant'});
 watchImages();
 if(view==='photos'&&photoMode==='show'&&!cameraDesktop.matches)mobilePhotos.open(photoIndex);
}
function render(view,options={}){
 const [section,filter]=view.split('/');
 const alias=Object.hasOwn(sectionAliases,location.hash.slice(1));
 view=normalise(section);
 // Retain legacy section bookmarks; media routes include their selected filter.
 if(alias&&view!=='photos'&&normalise(location.hash.slice(1))===view)history.replaceState(history.state,'',`#${view}`);
 if(view==='photos'&&!options.keepPhotoMode){
  photoMode='index';photoTab=contentTabs.includes(filter)?filter:'all';
 }
 const unchanged=current===view;
 applyView(view,options);
 if(options.instant||unchanged||reducedMotion.matches||keyboardNavigation())return;
 display.firstElementChild.animate([{opacity:.6},{opacity:1}],{duration:160,easing:'ease-out'});
}
function step(direction){
 if(!cameraMenu.hidden){selectMenu(menuIndex+direction,{focus:true});return;}
 if(current==='photos'&&photoMode==='show'){changePhoto(direction);return;}
 if(current==='photos'&&photoMode==='play'){changeVideo(direction);return;}
 if(current==='photos'){selectThumbnail(selectedContentIndex(viewState())+direction,{focus:true});return;}
 if(lists[current]){selectItem(current,listIndex[current]+direction,{focus:true});return;}
 render(views[(views.indexOf(current)+direction+views.length)%views.length],{focus:true});
}

// ---------------------------------------------------------------- menu
const menuButtons=[...cameraMenu.querySelectorAll('[data-view]')];
const menuPreviewImage=document.getElementById('menu-preview-image');
const menuPreviewText=document.getElementById('menu-preview-text');
const menuPreviewSocials=document.getElementById('menu-preview-socials');
const menuPreviewPanel=document.getElementById('menu-preview-panel');
const menuPreviewOpen=cameraMenu.querySelector('[data-open-preview]');
menuButtons.forEach(button=>button.setAttribute('aria-controls','menu-preview-panel'));
menuPreviewSocials.innerHTML=contactIconsHTML;
const menuResume=document.getElementById('menu-preview-resume');
const menuResumeFrame=menuResume.querySelector('iframe');
const menuResumeLoading=menuResume.querySelector('.resume-loading');
let menuResumeObserver,menuResumeTimer;
menuResumeFrame.addEventListener('load',()=>{
 if(!menuResumeFrame.hasAttribute('src'))return;
 clearTimeout(menuResumeTimer);
 menuResume.removeAttribute('data-loading');
 menuResumeLoading.hidden=true;
});
function clearMenuResume(){
 menuResumeObserver?.disconnect();menuResumeObserver=null;
 clearTimeout(menuResumeTimer);
 menuResumeFrame.removeAttribute('src');
}
let menuIndex=0;
function selectMenu(index,{focus=false}={}){
 menuIndex=(index+menuButtons.length)%menuButtons.length;
 menuButtons.forEach((b,i)=>b.setAttribute('aria-current',String(i===menuIndex)));
 const previewView=menuButtons[menuIndex].dataset.view;
 const preview=menuPreviews[previewView];
 cameraMenu.dataset.preview=previewView;
 menuPreviewPanel.setAttribute('aria-hidden',String(cameraDesktop.matches));
 menuPreviewOpen.hidden=cameraDesktop.matches;
 menuPreviewOpen.textContent=`Open ${sections[previewView]}`;
 menuPreviewImage.hidden=!preview.img;
 if(preview.img)menuPreviewImage.src=preview.img;
 menuResume.hidden=!preview.document;
 if(preview.document){
  if(!menuResumeFrame.hasAttribute('src')){
   menuResume.setAttribute('data-loading','');
   menuResumeLoading.hidden=false;menuResumeLoading.textContent='Loading résumé';
   menuResumeFrame.src=preview.document;
   menuResumeTimer=setTimeout(()=>{menuResumeLoading.textContent='Select Résumé to open the full document';},10000);
  }
  menuResumeObserver??=observeResumeFrame(menuResumeFrame);
 }
 menuPreviewSocials.hidden=previewView!=='contact';
 menuPreviewText.hidden=!preview.text;
 menuPreviewText.textContent=preview.text;
 if(previewView==='contact'&&!cameraDesktop.matches){
  const split=preview.text.indexOf('@')+1;
  menuPreviewText.replaceChildren(document.createTextNode(preview.text.slice(0,split)),document.createElement('wbr'),document.createTextNode(preview.text.slice(split)));
 }
 if(focus)menuButtons[menuIndex].focus({preventScroll:true});
}
function updateBrowseLabels(){
 const browsing=cameraMenu.hidden?browsingLabel(current,photoMode==='show'?'photos':photoMode==='play'?'videos':photoTab):'menu item';
 document.getElementById('previous').setAttribute('aria-label',`Previous ${browsing}`);
 document.getElementById('next').setAttribute('aria-label',`Next ${browsing}`);
}
function setMenuOpen(open,{focus=false}={}){
 if(!open)clearMenuResume();
 if(open){
  menuOpener=document.activeElement;
  const at=menuButtons.findIndex(b=>b.dataset.view===current);
  selectMenu(at<0?0:at);
 }
 cameraMenu.hidden=!open;
 updateBrowseLabels();
 display.inert=open;
 document.querySelectorAll('.mobile-nav [data-view]').forEach(b=>b.removeAttribute('aria-current'));
 if(!open)document.querySelector(`.mobile-nav [data-view="${current}"]`)?.setAttribute('aria-current','page');
 menuToggle.setAttribute('aria-expanded',String(open));
 updateNav();
 if(open&&focus)menuButtons[menuIndex].focus({preventScroll:true});
 if(!open&&focus)(menuOpener?.isConnected?menuOpener:!cameraDesktop.matches?document.querySelector('.mobile-nav [data-open-menu]'):menuToggle).focus({preventScroll:true});
}
menuToggle.addEventListener('click',()=>setMenuOpen(cameraMenu.hidden,{focus:true}));
menuButtons.forEach((button,i)=>{
 button.addEventListener('pointerenter',()=>selectMenu(i));
 button.addEventListener('focus',()=>selectMenu(i));
});
cameraMenu.addEventListener('keydown',e=>{
 if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
 e.preventDefault();selectMenu(menuIndex+(e.key==='ArrowDown'?1:-1),{focus:true});
});

// ---------------------------------------------------------------- projects
function selectItem(kind,index,{focus=false}={}){
 const items=lists[kind].items;
 const next=(index+items.length)%items.length;
 const list=display.querySelector(`[data-list="${kind}"]`);
 if(!list){
  if(cameraDesktop.matches)return;
  const project=display.querySelector(`[data-project="${next}"]`);
  const section=project;
  if(!section)return;
  listIndex[kind]=next;
  if(project){
   display.querySelectorAll('[data-project]').forEach(item=>{item.open=item===project;});
  }
  display.scrollTop=section.offsetTop-16;
  if(focus){
   const target=section.querySelector('summary,h2');
   if(target){if(target.tagName==='H2')target.tabIndex=-1;target.focus({preventScroll:true});}
  }
  return;
 }
 const changed=next!==listIndex[kind];
 listIndex[kind]=next;
 list.querySelectorAll('[data-item]').forEach((b,i)=>b.setAttribute('aria-current',String(i===next)));
 if(focus)list.querySelector(`[data-item="${next}"]`)?.focus({preventScroll:true});
 if(!changed)return;
 const preview=list.querySelector('.lcd-preview');
 preview.innerHTML=previewHTML(items[next]);
 if(!reducedMotion.matches)preview.animate([{opacity:.4},{opacity:1}],{duration:140,easing:'ease-out'});
}
display.addEventListener('toggle',e=>{
 const project=e.target.closest('details[data-project]');
 if(!project?.open)return;
 listIndex.projects=Number(project.dataset.project);
 display.querySelectorAll('details[data-project]').forEach(other=>{if(other!==project)other.open=false;});
},true);
display.addEventListener('pointermove',e=>{
 const item=e.target.closest('[data-item]');
 if(item&&e.pointerType!=='touch')selectItem(item.closest('[data-list]').dataset.list,Number(item.dataset.item));
 const thumb=e.target.closest('[data-photo],[data-video]');
 if(thumb&&e.pointerType!=='touch')selectThumbnail(Number(thumb.dataset.contentIndex));
});
display.addEventListener('focusin',e=>{
 const item=e.target.closest('[data-item]');
 if(item)selectItem(item.closest('[data-list]').dataset.list,Number(item.dataset.item));
 const thumb=e.target.closest('[data-photo],[data-video]');
 if(thumb)selectThumbnail(Number(thumb.dataset.contentIndex));
});
display.addEventListener('keydown',e=>{
 const tab=e.target.closest('[data-photo-tab]');
 if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
  e.preventDefault();
  const index=contentTabs.indexOf(tab.dataset.photoTab);
  setPhotoTab(contentTabs[e.key==='Home'?0:e.key==='End'?contentTabs.length-1:(index+(e.key==='ArrowRight'?1:contentTabs.length-1))%contentTabs.length]);
  return;
 }
 if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
 const item=e.target.closest('[data-item]');
 if(!item)return;
 e.preventDefault();
 selectItem(item.closest('[data-list]').dataset.list,Number(item.dataset.item)+(e.key==='ArrowDown'?1:-1),{focus:true});
});

// ---------------------------------------------------------------- photos
function changePhoto(direction){
 if(mobilePhotos.isOpen){
  const next=Math.max(0,Math.min(photos.length-1,photoIndex+direction));
  if(next===photoIndex)return;
  photoIndex=next;
  selectThumbnail(photoTab==='all'?videos.length+photoIndex:photoIndex);
  mobilePhotos.update(photoIndex,direction);
  history.replaceState(photoHistory(),'',location.href);
  return;
 }
 photoIndex=(photoIndex+direction+photos.length)%photos.length;
 if(photoTab==='all')allIndex=videos.length+photoIndex;
 const viewerFocused=document.activeElement?.classList.contains('lcd-show-img');
 const focusedStep=document.activeElement?.dataset.photoStep;
 display.innerHTML=`<div class="view">${slideshowView(viewState())}</div>`;
 bindDesktopZoom();
 watchImages();
 history.replaceState(photoHistory(),'',location.href);
 if(viewerFocused)display.querySelector('.lcd-show-img')?.focus({preventScroll:true});
 else if(focusedStep)display.querySelector(`[data-photo-step="${focusedStep}"]`)?.focus({preventScroll:true});
 if(!reducedMotion.matches&&!keyboardNavigation()){
  display.querySelector('.lcd-show-img img').animate([{opacity:.5},{opacity:1}],{duration:180,easing:'ease-out'});
 }
}
function selectThumbnail(index,{focus=false}={}){
 const grid=display.querySelector('.lcd-thumbs');
 if(!grid)return;
 const items=contentItems(viewState()),count=items.length;
 if(!count)return;
 const next=(index+count)%count,entry=items[next];
 if(photoTab==='all')allIndex=next;
 if(entry.type==='video')videoIndex=entry.index;else photoIndex=entry.index;
 grid.querySelectorAll('[data-content-index]').forEach((b,i)=>b.setAttribute('aria-current',String(i===next)));
 display.querySelector('.lcd-index-cap').innerHTML=indexCaption(viewState());
 if(focus){
  const target=grid.querySelector(`[data-content-index="${next}"]`);
  target?.focus({preventScroll:true});
  target?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
 }
}
function changeVideo(direction){
 if(videos.length<2)return;
 videoIndex=(videoIndex+direction+videos.length)%videos.length;
 if(photoTab==='all')allIndex=videoIndex;
 render('photos',{keepPhotoMode:true});
 history.replaceState(photoHistory(),'',location.href);
}
function setPhotoTab(tab){
 if(!contentTabs.includes(tab))return;
 photoTab=tab;photoMode='index';
 render('photos',{keepPhotoMode:true});
 history.replaceState(photoHistory(),'',location.href);
 display.querySelector(`[data-photo-tab="${tab}"]`)?.focus({preventScroll:true});
}
function setPhotoMode(mode,{focus=false}={}){
 if(mode==='index'&&history.state?.photoDetail){history.back();return;}
 const wasIndex=photoMode==='index';
 if(wasIndex&&mode!=='index')history.replaceState(photoHistory(),'',location.href);
 photoMode=mode;
 if(!cameraDesktop.matches&&mode==='show'){
  mobilePhotos.open(photoIndex,{origin:display.querySelector(`[data-photo="${photoIndex}"]`)});
  if(wasIndex)history.pushState({...photoHistory(),photoDetail:true},'',location.href);
  return;
 }
 render('photos',{keepPhotoMode:true,focus:false});
 if(wasIndex&&mode!=='index')history.pushState({...photoHistory(),photoDetail:true},'',location.href);
 if(focus){
  const target=mode==='index'?display.querySelector(`[data-content-index="${selectedContentIndex(viewState())}"]`):display.querySelector(mode==='play'?'.lcd-all':'.lcd-show-img');
  target?.focus({preventScroll:true});
  if(mode==='index')target?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
 }
}
function photoHistory(){return {photoMode,photoTab,photoIndex,videoIndex,allIndex,photoDetail:photoMode!=='index'&&current==='photos'};}
function watchImages(){
 display.querySelectorAll('.lcd-show-img img,.lcd-live .lcd-feed,.lcd-thumbs img').forEach(img=>{
  const host=img.parentElement;
  const finish=()=>{host.removeAttribute('data-image-loading');host.classList.remove('image-failed');};
  const fail=()=>{finish();host.classList.add('image-failed');};
  if(img.complete){if(img.naturalWidth)finish();else fail();return;}
  host.setAttribute('data-image-loading','');
  img.addEventListener('load',finish,{once:true});
  img.addEventListener('error',fail,{once:true});
 });
}
let lastPhotoScroll=0;
document.addEventListener('wheel',e=>{
 if(!cameraDesktop.matches)return;
 if(current!=='photos'||photoMode!=='show'||e.ctrlKey||!e.target.closest('.lcd-show-img'))return;
 if(desktopZoom?.zoomed){e.preventDefault();return;}
 const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
 if(Math.abs(delta)<8)return;
 e.preventDefault();
 const now=performance.now();
 if(now-lastPhotoScroll<260)return;
 lastPhotoScroll=now;changePhoto(delta>0?1:-1);
},{passive:false});
let photoGesture=null;
document.addEventListener('pointerdown',e=>{
 const viewer=e.target.closest('.lcd-show-img');
 if(!viewer||e.button!==0||desktopZoom?.zoomed)return;
 photoGesture={x:e.clientX,y:e.clientY,pointerId:e.pointerId};
});
document.addEventListener('pointerup',e=>{
 if(!photoGesture||e.pointerId!==photoGesture.pointerId)return;
 const dx=e.clientX-photoGesture.x,dy=e.clientY-photoGesture.y;
 photoGesture=null;
 if(current==='photos'&&photoMode==='show'&&Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)changePhoto(dx<0?1:-1);
});
document.addEventListener('pointercancel',()=>{photoGesture=null;});

// ---------------------------------------------------------------- hardware wheel
// The physical wheel steps through the four printed sections. Inside the menu it moves the
// selection instead. Dragging preserves a simple click until a real turn starts.
const sectionWheel=document.querySelector('.dial');
const wheelSections=['contact','projects','photos','resume'];
let wheelScroll=0,wheelScrollAt=0,wheelChangedAt=-Infinity;
function stepWheel(direction){
 if(!cameraMenu.hidden){selectMenu(menuIndex+direction,{focus:true});return;}
 const index=wheelSections.indexOf(current);
 const next=index<0?(direction>0?0:wheelSections.length-1)
  :(index+direction+wheelSections.length)%wheelSections.length;
 render(wheelSections[next]);
}
sectionWheel.addEventListener('wheel',e=>{
 if(e.ctrlKey)return;
 const delta=Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX;
 if(!delta)return;
 e.preventDefault();
 const now=performance.now();
 if(now-wheelScrollAt>160||Math.sign(delta)!==Math.sign(wheelScroll))wheelScroll=0;
 wheelScrollAt=now;
 wheelScroll+=delta*(e.deltaMode===1?16:e.deltaMode===2?200:1);
 if(Math.abs(wheelScroll)>=36&&now-wheelChangedAt>=220){
  stepWheel(Math.sign(wheelScroll));wheelScroll=0;wheelChangedAt=now;
 }
},{passive:false});
sectionWheel.addEventListener('keydown',e=>{
 if(!['ArrowUp','ArrowDown'].includes(e.key)||e.altKey||e.ctrlKey||e.metaKey)return;
 e.preventDefault();stepWheel(e.key==='ArrowDown'?1:-1);
});
// Dragging turns the wheel 1:1 with the pointer (camera3d.js draws it from 'camera-wheel'
// events). The section under the red segment opens as soon as the segment reaches it.
const WHEEL_ANGLE={contact:0,projects:-Math.PI/2,photos:Math.PI,resume:Math.PI/2};
let dialAngle=0;
function nearAngle(angle,reference){return angle+Math.round((reference-angle)/(2*Math.PI))*2*Math.PI;}
function sendWheel(angle,active){
 setDialIndicator(active?-angle*180/Math.PI:dialAngles[current]);
 document.dispatchEvent(new CustomEvent('camera-wheel',{detail:{angle,active}}));
}
let wheelDrag=null,wheelSuppressClick=false;
function wheelPoint(e){
 if(cameraBody.classList.contains('camera-embedded')){
  const rect=cameraBody.getBoundingClientRect();
  const local=new DOMPoint(e.clientX-rect.left,e.clientY-rect.top)
   .matrixTransform(new DOMMatrix(getComputedStyle(sectionWheel).transform).inverse());
  return {x:local.x-sectionWheel.offsetWidth/2,y:local.y-sectionWheel.offsetHeight/2};
 }
 const rect=sectionWheel.getBoundingClientRect();
 const x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2;
 return cameraDesktop.matches?{x,y}:{x:y,y:-x};
}
sectionWheel.addEventListener('pointerdown',e=>{
 if(e.button!==0||e.target.closest('.dial-center'))return;
 const p=wheelPoint(e);
 if(Math.hypot(p.x,p.y)<sectionWheel.offsetWidth*.23)return;
 wheelSuppressClick=false;
 const base=nearAngle(WHEEL_ANGLE[current]??0,dialAngle);
 wheelDrag={id:e.pointerId,angle:Math.atan2(p.y,p.x),travel:0,menuTravel:0,base,dial:base,x:e.clientX,y:e.clientY,turning:false};
});
sectionWheel.addEventListener('pointermove',e=>{
 if(!wheelDrag||e.pointerId!==wheelDrag.id)return;
 if(!wheelDrag.turning&&Math.hypot(e.clientX-wheelDrag.x,e.clientY-wheelDrag.y)<8)return;
 if(!wheelDrag.turning){
  wheelDrag.turning=true;wheelSuppressClick=true;
  sectionWheel.setPointerCapture(e.pointerId);sectionWheel.classList.add('is-turning');
 }
 const p=wheelPoint(e),angle=Math.atan2(p.y,p.x);
 const delta=Math.atan2(Math.sin(angle-wheelDrag.angle),Math.cos(angle-wheelDrag.angle));
 wheelDrag.angle=angle;wheelDrag.travel+=delta;
 e.preventDefault();
 if(!cameraMenu.hidden){
  // In the menu the wheel steps the selection, one item per 60° of turn.
  wheelDrag.menuTravel+=delta;
  const turn=Math.PI/3;
  while(Math.abs(wheelDrag.menuTravel)>=turn){
   const direction=Math.sign(wheelDrag.menuTravel);stepWheel(direction);wheelDrag.menuTravel-=direction*turn;
  }
  return;
 }
 // Clockwise on screen is a negative wheel angle (see WHEEL_ANGLE).
 wheelDrag.dial=wheelDrag.base-wheelDrag.travel;
 sendWheel(wheelDrag.dial,true);
 const section=wheelSections[((Math.round(-wheelDrag.dial/(Math.PI/2))%4)+4)%4];
 if(section!==current)render(section);
});
function endWheelDrag(e){
 if(!wheelDrag||e.pointerId!==wheelDrag.id)return;
 const turned=wheelDrag.turning;
 if(turned){dialAngle=wheelDrag.dial;sendWheel(wheelDrag.dial,false);}
 wheelDrag=null;sectionWheel.classList.remove('is-turning');
 if(turned)setTimeout(()=>{wheelSuppressClick=false;},0);
}
document.addEventListener('pointerup',endWheelDrag);
document.addEventListener('pointercancel',e=>{endWheelDrag(e);wheelSuppressClick=false;});
sectionWheel.addEventListener('lostpointercapture',endWheelDrag);
sectionWheel.addEventListener('click',e=>{
 if(wheelSuppressClick){e.preventDefault();e.stopImmediatePropagation();wheelSuppressClick=false;}
},true);
// A click on the ring between the printed sections picks the nearest one, so the whole wheel works.
sectionWheel.addEventListener('click',e=>{
 if(e.detail===0||e.target.closest('.dial-item,.dial-center')||!cameraMenu.hidden)return;
 const p=wheelPoint(e);
 if(Math.hypot(p.x,p.y)<sectionWheel.offsetWidth*.16)return;
 const quarter=((Math.round(Math.atan2(p.y,p.x)/(Math.PI/2))%4)+4)%4;
 render(['projects','photos','resume','contact'][quarter],{focus:true});
});
// The centre button confirms the menu selection while the menu is open.
document.querySelector('.dial-center').addEventListener('click',e=>{
 if(cameraMenu.hidden)return;
 e.preventDefault();e.stopImmediatePropagation();
 render(menuButtons[menuIndex].dataset.view,{focus:true});
},true);

// ---------------------------------------------------------------- clicks and keys
document.addEventListener('pointerdown',()=>{document.documentElement.dataset.navigation='pointer';},{passive:true});
document.addEventListener('keydown',()=>{document.documentElement.dataset.navigation='keyboard';},true);
document.addEventListener('click',e=>{
 const target=e.target.closest('[data-play-video],[data-view],[data-open-preview],[data-open-menu],[data-close-menu],[data-photo],[data-video],[data-photo-tab],[data-photo-mode],[data-photo-step],[data-video-step],[data-item]');
 if(!target)return;
 if(target.matches('a[data-view]'))e.preventDefault();
 if(target.hasAttribute('data-play-video')){
  // Load YouTube only on request. If the owner has embedding turned off, YouTube's own
  // message offers "Watch on YouTube".
  const v=videos[videoIndex];
  target.outerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1" title="${v.title}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
 }
 else if(target.hasAttribute('data-open-preview'))render(menuButtons[menuIndex].dataset.view,{focus:true});
 else if(!cameraDesktop.matches&&menuButtons.includes(target))selectMenu(menuButtons.indexOf(target),{focus:true});
 else if(target.hasAttribute('data-close-menu'))setMenuOpen(false,{focus:true});
 else if(target.hasAttribute('data-open-menu'))setMenuOpen(cameraMenu.hidden,{focus:true});
 else if(target.dataset.view==='photos'&&current==='photos'&&photoMode!=='index')setPhotoMode('index',{focus:true});
 else if(target.dataset.view)render(target.dataset.view,{focus:true});
 else if(target.dataset.photo){photoIndex=Number(target.dataset.photo);setPhotoMode('show',{focus:true});}
 else if(target.dataset.video){videoIndex=Number(target.dataset.video);setPhotoMode('play',{focus:true});}
 else if(target.dataset.photoTab)setPhotoTab(target.dataset.photoTab);
 else if(target.dataset.videoStep)changeVideo(Number(target.dataset.videoStep));
 else if(target.dataset.photoMode)setPhotoMode(target.dataset.photoMode,{focus:true});
 else if(target.dataset.photoStep)changePhoto(Number(target.dataset.photoStep));
 else if(target.dataset.item)selectItem(target.closest('[data-list]').dataset.list,Number(target.dataset.item));
});
// Playback opens the Videos tab of Content (YouTube itself is on the 3D camera's record button).
document.querySelector('.hardware-playback')?.addEventListener('click',()=>setPhotoTab('videos'));
document.getElementById('previous').addEventListener('click',()=>step(-1));
document.getElementById('next').addEventListener('click',()=>step(1));
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented)return;
 if(e.key==='Escape'&&!cameraMenu.hidden){e.preventDefault();setMenuOpen(false,{focus:true});return;}
 if(e.key==='Escape'&&current==='photos'&&photoMode!=='index'){e.preventDefault();setPhotoMode('index',{focus:true});return;}
 if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}
});

// ---------------------------------------------------------------- LCD scale
// Desktop lays the screen out at 620 × 465 and zooms it to the projected LCD size.
const screenElement=lcd.parentElement;
function fitLCD(){
 if(!cameraDesktop.matches){lcd.style.removeProperty('zoom');return;}
 const width=screenElement.clientWidth;
 if(width)lcd.style.zoom=String(width/620);
}
new ResizeObserver(fitLCD).observe(screenElement);
cameraDesktop.addEventListener('change',()=>{fitLCD();render(current,{hash:false,instant:true,keepPhotoMode:true});});
fitLCD();

function hashView(){
 const route=location.hash.slice(1);
 return ['photos','outside'].includes(route)?'content/photos':route||'home';
}
window.addEventListener('popstate',e=>{
 const state=e.state;
 const closeMobilePhoto=mobilePhotos.isOpen&&!cameraDesktop.matches&&normalise(location.hash.slice(1).split('/')[0])==='photos'&&(state?.photoMode||'index')==='index'&&['photos','all'].includes(state?.photoTab||'all');
 if(closeMobilePhoto){
  photoMode='index';photoTab=state?.photoTab||'all';
  allIndex=photoTab==='all'?videos.length+photoIndex:allIndex;
  mobilePhotos.close();
  selectThumbnail(photoTab==='all'?videos.length+photoIndex:photoIndex);
  history.replaceState(photoHistory(),'',location.href);
  return;
 }
 photoMode=state?.photoMode||'index';
 const filter=state?.photoTab||hashView().split('/')[1];
 photoTab=contentTabs.includes(filter)?filter:'all';
 allIndex=state?.allIndex||0;
 photoIndex=state?.photoIndex||0;videoIndex=state?.videoIndex||0;
 render(hashView(),{hash:false,instant:true,keepPhotoMode:true,focus:true});
 if(current==='photos'&&photoMode==='index')selectThumbnail(selectedContentIndex(viewState()),{focus:true});
});
render(hashView(),{hash:false,instant:true});
history.replaceState(photoHistory(),'',location.href);
document.documentElement.classList.add('js');
