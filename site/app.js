const views=['home','about','work','photos','resume','contact'];
const navViews=new Set(['about','work','photos','resume','contact']);
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

// ---------------------------------------------------------------- content
const EMAIL='McKenzieRoger83@gmail.com';
const YOUTUBE='https://www.youtube.com/@RogerMcKenzie1';
const RESUME='https://docs.google.com/document/d/15JX0X1Reny-b6ptbkC4ADLikTLXrJYg3';
const svg=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICON={
 menu:svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
 out:svg('<path d="M7 17 17 7M9 7h8v8"/>'),
 left:svg('<path d="m15 6-6 6 6 6"/>'),
 right:svg('<path d="m9 6 6 6-6 6"/>'),
 play:svg('<path d="M7 5v14l12-7z"/>'),
 grid:svg('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
 photo:svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 17 5-5 4 4 3-3 4 4"/>'),
 video:svg('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>'),
 mail:svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>'),
 down:svg('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>')
};
const external='target="_blank" rel="noopener noreferrer"';
const socialLinks=`<div class="lcd-links"><a href="https://github.com/RogerMcKenzie" ${external}>GitHub</a><a href="https://www.linkedin.com/in/rogermckenzie/" ${external}>LinkedIn</a><a href="${YOUTUBE}" ${external}>YouTube</a></div>`;

const photos=[
 {src:'assets/photography/sunset-cathedral.jpg',alt:'Orange sunset over a cathedral silhouette and city rooftops',title:'Cathedral sunset',location:'Washington, DC',year:'2026'},
 {src:'assets/photography/terrace-lights.jpg',alt:'Rooftop terrace with string lights over a city at night',title:'Terrace lights',location:'',year:'2026'},
 {src:'assets/photography/caesars-palace.jpg',alt:'Caesars Palace entrance at golden hour with crowds on the Las Vegas Strip',title:'Caesars Palace',location:'Las Vegas, NV',year:'2026'},
 {src:'assets/photography/north-beach-night.jpg',alt:'North Beach street scene at night with neon signs and city lights',title:'North Beach nights',location:'San Francisco, CA',year:'2026'}
];
// Add a video with its YouTube id; 'vertical' is for Shorts. The grid fills the last slot
// with a link to the channel while there are fewer than four.
const videos=[
 {id:'hrOAiSEx3Ww',title:'AfroTech 2025',location:'Houston, TX',year:'2025',vertical:true}
];
const lists={
 work:{label:'Apps I’ve built',items:[
  {name:'Studio Stack',text:'Production scheduling, brief intake and gear reservations for The Agency at UF. As lead developer I built the cloud backend with role-based sign-in and workflow tracking.',meta:'TypeScript, AWS Lambda, PostgreSQL, S3'},
  {name:'ResMatch',text:'Tailors a résumé to the job description you’re applying for.',meta:'Next.js, TypeScript, OpenAI'},
  {name:'SnapCal',text:'A Chrome extension that turns events on a webpage into Google Calendar entries, with a preview to check before saving.',meta:'Chrome extension, Gemini, Google Calendar'},
  {name:'Jenna’s Recipes',img:'assets/jennas-recipes.jpg',text:'Search recipes by ingredient, get Gemini suggestions and keep a shopping list between visits.',meta:'React, TypeScript, MUI',url:'https://jennarecipes.vercel.app',cta:'Open the app'}
 ]},
 about:{label:'About me',items:[
  {name:'Background',img:'assets/profile.jpg',text:'I’m from Miami and the first in my family to go to college. I study Information Systems at the University of Florida, with minors in Computer Science and Statistics.',links:true},
  {name:'Experience',img:'assets/profile.jpg',text:'Software engineering intern at Amazon in Arlington, Virginia, in 2025 and 2026. Lead developer at The Agency at UF since April 2026.'},
  {name:'Off the clock',img:'assets/profile.jpg',text:'Cooking, climbing, gaming and tinkering with a home server. I also make videos about tech on YouTube.',links:true}
 ]}
};
const menuPreviews={
 about:{img:'assets/profile.jpg',text:'Software developer and photographer at the University of Florida'},
 work:{img:'assets/jennas-recipes.jpg',text:'Studio Stack, ResMatch, SnapCal and Jenna’s Recipes'},
 photos:{img:'assets/photography/sunset-cathedral.jpg',text:'Four photographs from Washington, Las Vegas and San Francisco'},
 resume:{text:'Two software engineering internships at Amazon, and lead developer at The Agency at UF'},
 contact:{text:EMAIL}
};

let current='home';
let photoIndex=0;
let photoMode='index';
let photoTab='photos';
let videoIndex=0;
const listIndex={work:0,about:0};
const lcd=document.getElementById('lcd');
const display=document.getElementById('display-content');
const cameraMenu=document.getElementById('camera-menu');
const menuToggle=document.getElementById('menu-toggle');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const keyboardNavigation=()=>document.documentElement.dataset.navigation==='keyboard';
let resumeResizeObserver;

// ---------------------------------------------------------------- views
function homeView(){
 return `<div class="lcd-live"><img class="lcd-feed" src="assets/profile.jpg" alt="Roger McKenzie" width="1512" height="1375" fetchpriority="high"><span class="lcd-where lcd-narrow lcd-shadow">Gainesville, FL</span><span class="lcd-status lcd-shadow" aria-hidden="true"><span class="lcd-rec"></span><span class="lcd-batt"><b></b></span></span><div class="lcd-focus" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="lcd-who lcd-shadow"><h1>Roger McKenzie</h1><p>Software developer and content creator</p></div><button class="lcd-menu-btn" data-open-menu aria-haspopup="true">${ICON.menu}Menu</button></div>`;
}
function previewHTML(item){
 return (item.img?`<img src="${item.img}" alt="" width="262" height="157" loading="lazy">`:'')
  +`<p>${item.text}</p>`
  +(item.meta?`<p class="lcd-meta">${item.meta}</p>`:'')
  +(item.url?`<a class="lcd-cta" href="${item.url}" ${external}>${item.cta}${ICON.out}</a>`:'')
  +(item.links?socialLinks:'');
}
function listView(kind){
 const {label,items}=lists[kind];const index=listIndex[kind];
 return `<div class="lcd-list" data-list="${kind}"><h1 class="lcd-sr">${label}</h1><ul aria-label="${label}">${items.map((item,i)=>`<li><button data-item="${i}" aria-current="${i===index}">${item.name}</button></li>`).join('')}</ul><div class="lcd-preview" aria-live="polite">${previewHTML(items[index])}</div></div>`;
}
function photoPlace(p){return [p.location,p.year].filter(Boolean).join('<br>');}
function slideshowView(){
 const p=photos[photoIndex],n=photoIndex+1;
 return `<div class="lcd-show"><div class="lcd-show-img" role="region" tabindex="0" aria-label="Photograph ${n} of ${photos.length}. Swipe, scroll or use the arrow keys to browse"><img src="${p.src}" alt="${p.alt}" width="1574" height="2200" draggable="false"></div><div class="lcd-show-side is-left lcd-narrow"><span class="lcd-file">${ICON.play}100-${String(n).padStart(4,'0')}</span><h1>${p.title}</h1><span class="lcd-place">${photoPlace(p)}</span></div><div class="lcd-show-side is-right lcd-narrow"><span>${n} / ${photos.length}</span><div class="lcd-bars" aria-hidden="true">${photos.map((_,i)=>`<i class="${i===photoIndex?'is-on':''}"></i>`).join('')}</div><button class="lcd-all" data-photo-mode="index">${ICON.grid}All photos</button></div><button class="lcd-arrow is-prev" data-photo-step="-1" aria-label="Previous photograph">${ICON.left}</button><button class="lcd-arrow is-next" data-photo-step="1" aria-label="Next photograph">${ICON.right}</button></div>`;
}
function indexCaption(){
 const list=photoTab==='videos'?videos:photos,index=photoTab==='videos'?videoIndex:photoIndex,p=list[index];
 return `<span>${p.title}</span><span class="lcd-dim">${p.year}</span><span class="lcd-dim">${index+1} / ${list.length}</span>`;
}
const videoThumb=v=>`https://i.ytimg.com/vi/${v.id}/${v.vertical?'oardefault':'maxresdefault'}.jpg`;
function thumbsHTML(){
 if(photoTab==='photos')return photos.map((p,i)=>`<button data-photo="${i}" aria-current="${i===photoIndex}" aria-label="View ${p.title}"><img src="${p.src}" alt="" width="214" height="143" loading="lazy" draggable="false"></button>`).join('');
 const tiles=videos.map((v,i)=>`<button class="lcd-video-tile" data-video="${i}" aria-current="${i===videoIndex}" aria-label="Play ${v.title}"><img src="${videoThumb(v)}" alt="" width="214" height="143" loading="lazy" draggable="false"><span class="lcd-play-badge">${ICON.play}</span></button>`);
 if(videos.length<4)tiles.push(`<a class="lcd-channel-tile" href="${YOUTUBE}" ${external}><span>More on YouTube</span>${ICON.out}</a>`);
 return tiles.join('');
}
function indexView(){
 return `<div class="lcd-page lcd-index"><h1 class="lcd-sr">Photographs</h1><div class="lcd-tabs lcd-narrow" role="tablist"><button role="tab" data-photo-tab="photos" aria-selected="${photoTab==='photos'}" class="${photoTab==='photos'?'is-on':''}">${ICON.photo}Photos</button><button role="tab" data-photo-tab="videos" aria-selected="${photoTab==='videos'}" class="${photoTab==='videos'?'is-on':''}">${ICON.video}Videos</button></div><div class="lcd-thumbs">${thumbsHTML()}</div><div class="lcd-index-cap" aria-live="polite">${indexCaption()}</div></div>`;
}
function resumeView(){
 return `<div class="lcd-resume"><div class="lcd-resume-top"><h1>Résumé</h1><a class="lcd-plain" href="${RESUME}/edit" ${external}>Open in Google Docs</a><a class="lcd-cta" href="${RESUME}/export?format=pdf">${ICON.down}Download PDF</a></div><div class="lcd-doc resume-viewer" data-loading><span class="resume-loading" role="status">Loading résumé</span><iframe class="resume-frame" src="${RESUME}/preview" title="Roger McKenzie’s résumé" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div></div>`;
}
function contactView(){
 return `<div class="lcd-contact"><h1>Email me about internships, collaborations or photo work</h1><a class="lcd-cta" href="mailto:${EMAIL}">${ICON.mail}${EMAIL}</a>${socialLinks}</div>`;
}
function videoView(){
 const v=videos[videoIndex],n=videoIndex+1,many=videos.length>1;
 return `<div class="lcd-show lcd-movie"><div class="lcd-show-img${v.vertical?' is-vertical':''}"><button class="lcd-poster" data-play-video aria-label="Play ${v.title}"><img src="${videoThumb(v)}" alt="" draggable="false"><span class="lcd-play-badge is-large">${ICON.play}</span></button></div><div class="lcd-show-side is-left lcd-narrow"><span class="lcd-file">${ICON.play}C${String(n).padStart(4,'0')}.MP4</span><h1>${v.title}</h1><span class="lcd-place">${photoPlace(v)}</span></div><div class="lcd-show-side is-right lcd-narrow"><span>${n} / ${videos.length}</span><div class="lcd-bars" aria-hidden="true">${videos.map((_,i)=>`<i class="${i===videoIndex?'is-on':''}"></i>`).join('')}</div><a class="lcd-all lcd-watch" href="https://www.youtube.com/watch?v=${v.id}" ${external}>Watch on YouTube${ICON.out}</a><button class="lcd-all" data-photo-mode="index">${ICON.grid}All videos</button></div>${many?`<button class="lcd-arrow is-prev" data-video-step="-1" aria-label="Previous video">${ICON.left}</button><button class="lcd-arrow is-next" data-video-step="1" aria-label="Next video">${ICON.right}</button>`:''}</div>`;
}
function viewHTML(view){
 if(view==='home')return homeView();
 if(view==='about'||view==='work')return listView(view);
 if(view==='photos')return photoMode==='index'?indexView():photoMode==='play'?videoView():slideshowView();
 if(view==='resume')return resumeView();
 return contactView();
}

// ---------------------------------------------------------------- navigation
function normalise(view){
 if(view==='outside')view='photos';
 if(view==='experience')view='resume';
 return views.includes(view)?view:'home';
}
function updateNav(){
 const navOn=!cameraMenu.hidden?false:navViews.has(current)&&!(current==='photos'&&photoMode!=='index');
 lcd.dataset.nav=navOn?'on':'off';
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
function applyView(view,{focus=false,hash=true}={}){
 view=normalise(view);
 current=view;
 setMenuOpen(false);
 document.body.dataset.cameraView=view;
 resumeResizeObserver?.disconnect();resumeResizeObserver=null;
 display.innerHTML=`<div class="view">${viewHTML(view)}</div>`;
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
  resumeResizeObserver=new ResizeObserver(()=>{
   const width=viewer.clientWidth,height=viewer.clientHeight;
   if(!width||!height)return;
   const ratio=iframeViewportRatio(viewer);
   const frameWidth=1000/ratio,cropWidth=870/ratio,scale=width/cropWidth;
   resumeFrame.style.width=`${frameWidth}px`;
   resumeFrame.style.height=`${height/scale}px`;
   resumeFrame.style.transform=`scale(${scale}) translateX(${-(frameWidth-cropWidth)/2}px)`;
  });
  resumeResizeObserver.observe(viewer);
  resumeFrame.addEventListener('load',()=>{
   viewer.removeAttribute('data-loading');
   resumeFrame.previousElementSibling.hidden=true;
  },{once:true});
 }
 document.querySelectorAll('.dial-item,.lcd-nav [data-view]').forEach(b=>{
  if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
 });
 const angles={home:0,about:0,work:90,photos:180,resume:270,contact:0};
 document.getElementById('dial-indicator').style.setProperty('--angle',angles[view]+'deg');
 const browsing=view==='photos'?'photograph':lists[view]?'item':'section';
 document.getElementById('previous').setAttribute('aria-label',`Previous ${browsing}`);
 document.getElementById('next').setAttribute('aria-label',`Next ${browsing}`);
 if(hash&&location.hash!==`#${view}`)history.pushState(null,'',`#${view}`);
 const titles={home:'Software, photography & content',about:'About',work:'Apps',photos:'Photography',resume:'Résumé',contact:'Contact'};
 document.title=`Roger McKenzie | ${titles[view]}`;
 if(focus)display.focus({preventScroll:true});
}
function render(view,options={}){
 view=normalise(view);
 // Photos opens on the grid; picking a photo starts the slideshow.
 if(view==='photos'&&current!=='photos'&&!options.keepPhotoMode){photoMode='index';photoTab='photos';}
 const unchanged=current===view;
 applyView(view,options);
 if(options.instant||unchanged||reducedMotion.matches||keyboardNavigation())return;
 display.firstElementChild.animate([{opacity:.6},{opacity:1}],{duration:160,easing:'ease-out'});
}
function step(direction){
 if(!cameraMenu.hidden){selectMenu(menuIndex+direction,{focus:true});return;}
 if(current==='photos'&&photoMode==='show'){changePhoto(direction);return;}
 if(current==='photos'&&photoMode==='play'){changeVideo(direction);return;}
 if(current==='photos'){selectThumbnail((photoTab==='videos'?videoIndex:photoIndex)+direction,{focus:true});return;}
 if(lists[current]){selectItem(current,listIndex[current]+direction,{focus:true});return;}
 render(views[(views.indexOf(current)+direction+views.length)%views.length],{focus:true});
}

// ---------------------------------------------------------------- menu
const menuButtons=[...cameraMenu.querySelectorAll('[data-view]')];
const menuPreviewImage=document.getElementById('menu-preview-image');
const menuPreviewText=document.getElementById('menu-preview-text');
let menuIndex=0;
function selectMenu(index,{focus=false}={}){
 menuIndex=(index+menuButtons.length)%menuButtons.length;
 menuButtons.forEach((b,i)=>b.setAttribute('aria-current',String(i===menuIndex)));
 const preview=menuPreviews[menuButtons[menuIndex].dataset.view];
 menuPreviewImage.hidden=!preview.img;
 if(preview.img)menuPreviewImage.src=preview.img;
 menuPreviewText.textContent=preview.text;
 if(focus)menuButtons[menuIndex].focus({preventScroll:true});
}
function setMenuOpen(open,{focus=false}={}){
 if(open){
  const at=menuButtons.findIndex(b=>b.dataset.view===current);
  selectMenu(at<0?0:at);
 }
 cameraMenu.hidden=!open;
 display.inert=open;
 menuToggle.setAttribute('aria-expanded',String(open));
 updateNav();
 if(open&&focus)menuButtons[menuIndex].focus({preventScroll:true});
 if(!open&&focus)menuToggle.focus({preventScroll:true});
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

// ---------------------------------------------------------------- lists (Work, About)
function selectItem(kind,index,{focus=false}={}){
 const items=lists[kind].items;
 const next=(index+items.length)%items.length;
 const list=display.querySelector(`[data-list="${kind}"]`);
 if(!list)return;
 const changed=next!==listIndex[kind];
 listIndex[kind]=next;
 list.querySelectorAll('[data-item]').forEach((b,i)=>b.setAttribute('aria-current',String(i===next)));
 if(focus)list.querySelector(`[data-item="${next}"]`)?.focus({preventScroll:true});
 if(!changed)return;
 const preview=list.querySelector('.lcd-preview');
 preview.innerHTML=previewHTML(items[next]);
 if(!reducedMotion.matches)preview.animate([{opacity:.4},{opacity:1}],{duration:140,easing:'ease-out'});
}
display.addEventListener('pointerover',e=>{
 const item=e.target.closest('[data-item]');
 if(item&&e.pointerType!=='touch')selectItem(item.closest('[data-list]').dataset.list,Number(item.dataset.item));
 const thumb=e.target.closest('[data-photo],[data-video]');
 if(thumb&&e.pointerType!=='touch')selectThumbnail(Number(thumb.dataset.photo??thumb.dataset.video));
});
display.addEventListener('focusin',e=>{
 const item=e.target.closest('[data-item]');
 if(item)selectItem(item.closest('[data-list]').dataset.list,Number(item.dataset.item));
 const thumb=e.target.closest('[data-photo],[data-video]');
 if(thumb)selectThumbnail(Number(thumb.dataset.photo??thumb.dataset.video));
});
display.addEventListener('keydown',e=>{
 if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
 const item=e.target.closest('[data-item]');
 if(!item)return;
 e.preventDefault();
 selectItem(item.closest('[data-list]').dataset.list,Number(item.dataset.item)+(e.key==='ArrowDown'?1:-1),{focus:true});
});

// ---------------------------------------------------------------- photos
function changePhoto(direction){
 photoIndex=(photoIndex+direction+photos.length)%photos.length;
 const viewerFocused=document.activeElement?.classList.contains('lcd-show-img');
 const focusedStep=document.activeElement?.dataset.photoStep;
 display.innerHTML=`<div class="view">${slideshowView()}</div>`;
 if(viewerFocused)display.querySelector('.lcd-show-img')?.focus({preventScroll:true});
 else if(focusedStep)display.querySelector(`[data-photo-step="${focusedStep}"]`)?.focus({preventScroll:true});
 if(!reducedMotion.matches&&!keyboardNavigation()){
  display.querySelector('.lcd-show-img img').animate([{opacity:.5},{opacity:1}],{duration:180,easing:'ease-out'});
 }
}
function selectThumbnail(index,{focus=false}={}){
 const grid=display.querySelector('.lcd-thumbs');
 if(!grid)return;
 const videoTab=photoTab==='videos',attr=videoTab?'video':'photo',count=videoTab?videos.length:photos.length;
 const next=(index+count)%count;
 if(videoTab)videoIndex=next;else photoIndex=next;
 grid.querySelectorAll(`[data-${attr}]`).forEach((b,i)=>b.setAttribute('aria-current',String(i===next)));
 display.querySelector('.lcd-index-cap').innerHTML=indexCaption();
 if(focus)grid.querySelector(`[data-${attr}="${next}"]`)?.focus({preventScroll:true});
}
function changeVideo(direction){
 if(videos.length<2)return;
 videoIndex=(videoIndex+direction+videos.length)%videos.length;
 render('photos',{keepPhotoMode:true});
}
function setPhotoTab(tab){
 photoTab=tab;photoMode='index';
 render('photos',{keepPhotoMode:true});
 display.querySelector(`[data-photo-tab="${tab}"]`)?.focus({preventScroll:true});
}
function setPhotoMode(mode,{focus=false}={}){
 photoMode=mode;
 render('photos',{keepPhotoMode:true,focus:false});
 if(focus){
  const target=mode==='index'?display.querySelector(photoTab==='videos'?`[data-video="${videoIndex}"]`:`[data-photo="${photoIndex}"]`):display.querySelector(mode==='play'?'.lcd-all':'.lcd-show-img');
  target?.focus({preventScroll:true});
 }
}
let lastPhotoScroll=0;
document.addEventListener('wheel',e=>{
 if(current!=='photos'||photoMode!=='show'||e.ctrlKey||!e.target.closest('.lcd-show-img'))return;
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
 if(!viewer||e.button!==0)return;
 photoGesture={x:e.clientX,y:e.clientY,pointerId:e.pointerId};
});
document.addEventListener('pointerup',e=>{
 if(!photoGesture||e.pointerId!==photoGesture.pointerId)return;
 const dx=e.clientX-photoGesture.x,dy=e.clientY-photoGesture.y;
 photoGesture=null;
 if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)changePhoto(dx<0?1:-1);
});
document.addEventListener('pointercancel',()=>{photoGesture=null;});

// ---------------------------------------------------------------- clicks and keys
document.addEventListener('pointerdown',()=>{document.documentElement.dataset.navigation='pointer';},{passive:true});
document.addEventListener('keydown',()=>{document.documentElement.dataset.navigation='keyboard';},true);
document.addEventListener('click',e=>{
 const target=e.target.closest('[data-play-video],[data-view],[data-open-menu],[data-photo],[data-video],[data-photo-tab],[data-photo-mode],[data-photo-step],[data-video-step],[data-item]');
 if(!target)return;
 if(target.hasAttribute('data-play-video')){
  // Load YouTube only on request. If the owner has embedding turned off, YouTube's own
  // message offers "Watch on YouTube".
  const v=videos[videoIndex];
  target.outerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1" title="${v.title}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
 }
 else if(target.hasAttribute('data-open-menu'))setMenuOpen(true,{focus:true});
 else if(target.dataset.view)render(target.dataset.view,{focus:true});
 else if(target.dataset.photo){photoIndex=Number(target.dataset.photo);setPhotoMode('show',{focus:true});}
 else if(target.dataset.video){videoIndex=Number(target.dataset.video);setPhotoMode('play',{focus:true});}
 else if(target.dataset.photoTab)setPhotoTab(target.dataset.photoTab);
 else if(target.dataset.videoStep)changeVideo(Number(target.dataset.videoStep));
 else if(target.dataset.photoMode)setPhotoMode(target.dataset.photoMode,{focus:true});
 else if(target.dataset.photoStep)changePhoto(Number(target.dataset.photoStep));
 else if(target.dataset.item)selectItem(target.closest('[data-list]').dataset.list,Number(target.dataset.item));
});
// Playback opens the video tab of Photos (YouTube itself is on the 3D camera's record button).
document.querySelector('.hardware-playback')?.addEventListener('click',()=>setPhotoTab('videos'));
document.getElementById('previous').addEventListener('click',()=>step(-1));
document.getElementById('next').addEventListener('click',()=>step(1));
document.addEventListener('keydown',e=>{
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
cameraDesktop.addEventListener('change',fitLCD);
fitLCD();

window.addEventListener('popstate',()=>render(location.hash.slice(1),{hash:false,instant:true}));
render(location.hash.slice(1)||'home',{hash:false,instant:true});
