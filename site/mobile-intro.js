// A real rendered turn, without downloading Three.js or the GLB on phones.
const root=document.documentElement;
const camera=document.querySelector('.camera-v2 .camera');
const mobile=matchMedia('(max-width:1000px)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const boot='camera-mobile-boot';

if(!camera||!mobile.matches||reduced.matches||navigator.connection?.saveData||!root.classList.contains(boot)){
 root.classList.remove(boot);
}else{
 const events=new AbortController();
 const overlay=document.createElement('div');
 overlay.className='mobile-camera-intro';
 overlay.setAttribute('aria-hidden','true');
 const video=document.createElement('video');
 video.muted=video.defaultMuted=true;
 video.playsInline=true;
 video.preload='auto';
 video.disablePictureInPicture=true;
 video.tabIndex=-1;
 video.setAttribute('muted','');
 video.setAttribute('playsinline','');
 overlay.append(video);
 camera.append(overlay);
 const width=innerWidth;
 let finished=false;
 let loadingTimer;

 function finish(animate=false){
  if(finished)return;
  finished=true;
  clearTimeout(loadingTimer);
  events.abort();
  root.classList.remove(boot);
  const fade=animate&&!reduced.matches;
  if(fade)camera.classList.add('mobile-camera-settling');
  camera.classList.remove('mobile-camera-entering');
  const release=()=>{
   video.pause();
   video.removeAttribute('src');
   video.load();
   overlay.remove();
   camera.classList.remove('mobile-camera-settling');
  };
  if(fade){
   overlay.classList.add('is-finishing');
   setTimeout(release,190);
  }else release();
 }

 const options={signal:events.signal};
 video.addEventListener('playing',()=>{
  if(!root.classList.contains(boot)){finish();return;}
  clearTimeout(loadingTimer);
  camera.classList.add('mobile-camera-entering');
  overlay.classList.add('is-visible');
  root.classList.remove(boot);
 },{...options,once:true});
 video.addEventListener('ended',()=>finish(true),options);
 video.addEventListener('error',()=>finish(),options);
 for(const event of ['pointerdown','touchstart','keydown','wheel']){
  document.addEventListener(event,()=>finish(),{...options,capture:true,passive:true});
 }
 mobile.addEventListener('change',()=>finish(),options);
 reduced.addEventListener('change',()=>{if(reduced.matches)finish();},options);
 window.addEventListener('resize',()=>{if(Math.abs(innerWidth-width)>2)finish();},options);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();},options);
 loadingTimer=setTimeout(()=>finish(),1200);
 video.src=new URL('./assets/camera/mobile-intro.mp4?v=mobile-intro-20261115-1',import.meta.url).href;
 video.play().catch(()=>finish());
}
