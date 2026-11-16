// Regression checks for paths that must never leave the mobile site hidden.
import assert from 'node:assert/strict';

class Element extends EventTarget {
 constructor(){
  super();
  const classes=new Set();
  this.classList={add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n)),contains:n=>classes.has(n)};
  this.children=[];
 }
 setAttribute(){}
 append(child){this.children.push(child);child.parent=this;}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
 removeAttribute(name){delete this[name];}
 pause(){this.paused=true;}
 load(){this.released=true;}
 play(){return this.rejectPlay?Promise.reject(new Error('Autoplay denied')):Promise.resolve();}
}
const globals=['document','window','matchMedia','innerWidth','navigator'];
const original=new Map(globals.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
let run=0;
async function setup({desktop=false,reducedMotion=false,saveData=false,rejectPlay=false}={}){
 const root=new Element(),camera=new Element(),document=new Element(),window=new EventTarget();
 root.classList.add('camera-mobile-boot');
 const mobile=new Element(),reduced=new Element();
 mobile.matches=!desktop;reduced.matches=reducedMotion;
 const videos=[];
 document.documentElement=root;
 document.querySelector=()=>camera;
 document.createElement=tag=>{
  const element=new Element();
  if(tag==='video'){element.rejectPlay=rejectPlay;videos.push(element);}
  return element;
 };
 const values={document,window,matchMedia:query=>query.includes('max-width')?mobile:reduced,innerWidth:402,navigator:{connection:{saveData}}};
 for(const [name,value] of Object.entries(values))Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
 await import(`../site/mobile-intro.js?check=${run++}`);
 return {root,camera,document,mobile,reduced,videos};
}
function assertReadable(state){
 assert.equal(state.root.classList.contains('camera-mobile-boot'),false,'loading state clears');
 assert.equal(state.camera.classList.contains('mobile-camera-entering'),false,'live content is revealed');
 assert.equal(state.camera.children.length,0,'media overlay is removed');
}
try{
 for(const flags of [{desktop:true},{reducedMotion:true},{saveData:true}]){
  const state=await setup(flags);
  assert.equal(state.videos.length,0,'desktop, reduced motion and data saver do not load the clip');
  assertReadable(state);
 }
 for(const event of ['pointerdown','touchstart','keydown','wheel']){
  const state=await setup();
  state.videos[0].dispatchEvent(new Event('playing'));
  state.document.dispatchEvent(new Event(event));
  assertReadable(state);
  assert.equal(state.videos[0].paused,true,'interaction releases playback');
 }
 const failed=await setup();
 failed.videos[0].dispatchEvent(new Event('error'));
 assertReadable(failed);

 const denied=await setup({rejectPlay:true});
 await new Promise(resolve=>setTimeout(resolve,0));
 assertReadable(denied);

 const expired=await setup();
 expired.root.classList.remove('camera-mobile-boot');
 expired.videos[0].dispatchEvent(new Event('playing'));
 assertReadable(expired);

 const changed=await setup();
 changed.videos[0].dispatchEvent(new Event('playing'));
 changed.reduced.matches=true;
 changed.reduced.dispatchEvent(new Event('change'));
 assertReadable(changed);

 const ended=await setup();
 ended.videos[0].dispatchEvent(new Event('playing'));
 ended.videos[0].dispatchEvent(new Event('ended'));
 await new Promise(resolve=>setTimeout(resolve,220));
 assertReadable(ended);
 assert.equal(ended.videos[0].released,true,'finished video resources are released');
 console.log('PASS: reduced motion, data saver, desktop exclusion, input cancellation, load/autoplay failures, deadline, preference change and completed playback.');
}finally{
 for(const [name,descriptor] of original){
  if(descriptor)Object.defineProperty(globalThis,name,descriptor);
  else delete globalThis[name];
 }
}
