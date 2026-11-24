// Exercise the modal lifecycle and delayed image requests without a browser dependency.
import assert from 'node:assert/strict';
import {createMobilePhotoViewer} from '../site/mobile-photo-viewer.js';

class Element {
 constructor(){this.listeners=new Map();this.style={};this.attributes=new Map();this.children=[];this.clientWidth=300;this.isConnected=true;}
 addEventListener(type,listener){const list=this.listeners.get(type)||[];list.push(listener);this.listeners.set(type,list);}
 fire(type,event={}){for(const listener of this.listeners.get(type)||[])listener(event);}
 setAttribute(name,value){this.attributes.set(name,value);}
 removeAttribute(name){this.attributes.delete(name);}
 toggleAttribute(name,active){if(active)this.setAttribute(name,'');else this.removeAttribute(name);}
 append(child){this.children.push(child);child.parent=this;}
 prepend(child){this.children.unshift(child);child.parent=this;}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
 focus(){document.activeElement=this;}
 getBoundingClientRect(){return {left:16,top:80,width:120,height:100,right:136,bottom:180};}
 closest(){return null;}
 setPointerCapture(id){this.capture=id;}
 hasPointerCapture(id){return this.capture===id;}
 releasePointerCapture(){this.capture=null;}
 animate(frames,options){
  let resolve,reject;
  const finished=new Promise((yes,no)=>{resolve=yes;reject=no;});
  const animation={frames,options,finished,finish:resolve,cancel:()=>reject(new Error('Interrupted'))};
  animations.push(animation);return animation;
 }
}
const globals=['document','window','Image','innerHeight','ResizeObserver'];
const originals=new Map(globals.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
const animations=[],images=[],nodes=new Map();
const node=selector=>{if(!nodes.has(selector))nodes.set(selector,new Element());return nodes.get(selector);};
const dialog=new Element();
dialog.querySelector=node;
dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
const root=new Element(),classes=new Set();
root.classList={add:name=>classes.add(name),remove:name=>classes.delete(name)};
const document={body:new Element(),documentElement:root,createElement:()=>dialog,querySelector:node,getElementById:node};
class TestImage extends Element {
 constructor(){super();this.naturalWidth=800;this.naturalHeight=1200;images.push(this);}
 cloneNode(){return new TestImage();}
}
const stage=node('.mobile-photo-stage');
stage.getBoundingClientRect=()=>({left:16,top:64,width:288,height:420,right:304,bottom:484});
node('display-content').getBoundingClientRect=()=>({top:40,bottom:500});
const reducedMotion=new Element();reducedMotion.matches=false;
const values={document,window:new Element(),Image:TestImage,innerHeight:568,ResizeObserver:class {observe(){} disconnect(){}}};
for(const [name,value] of Object.entries(values))Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
const photos=[0,1].map(i=>({src:`photo-${i}.jpg`,title:`Photo ${i}`,alt:`Description ${i}`,year:'2026'}));
let steps=[],closes=0;
const viewer=createMobilePhotoViewer({photos,reducedMotion,onStep:direction=>steps.push(direction),onClose:()=>closes++});
const pending=()=>images.filter(image=>image.onload).at(-1);
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
try{
 viewer.open(0,{origin:node('[data-photo="0"]')});
 assert.equal(dialog.open,true);assert.ok(classes.has('mobile-photo-open'));
 assert.equal(node('h1').textContent,'Photo 0','a loading dialog already has an accessible name');
 assert.equal(node('[aria-label="Previous photograph"]').disabled,true);
 pending().onerror();
 assert.equal(node('.mobile-photo-retry').hidden,false,'failed loads expose retry');
 node('.mobile-photo-retry').fire('click');
 pending().onload();
 assert.equal(animations.at(-1).options.duration,230,'opening expands from the thumbnail');
 stage.fire('pointerdown',{button:0,isPrimary:true,pointerId:1,clientX:100,clientY:200,target:stage});
 stage.fire('pointermove',{pointerId:1,clientX:180,clientY:202});
 const active=stage.children[0];
 assert.equal(active.style.visibility,'','starting a drag cancels the opening animation');
 assert.ok(parseFloat(active.style.transform.slice(11))<80,'the first photo rubber-bands past the end');
 stage.fire('pointerup',{pointerId:1,clientX:180,clientY:202});
 assert.deepEqual(steps,[],'an outward swipe does not wrap to the last photo');
 stage.fire('pointerdown',{button:0,isPrimary:true,pointerId:2,clientX:200,clientY:200,target:stage});
 stage.fire('pointermove',{pointerId:2,clientX:100,clientY:202});
 stage.fire('pointerup',{pointerId:2,clientX:100,clientY:202});
 assert.deepEqual(steps,[1],'an inward swipe requests the next photo');
 viewer.update(1,1);const stale=pending();
 viewer.close({animate:false});stale.onload();
 assert.equal(dialog.open,false);assert.equal(classes.has('mobile-photo-open'),false);
 assert.equal(stage.children.length,0,'a late request cannot remount a photo after closing');
 assert.equal(document.activeElement,node('[data-photo="1"]'),'focus returns to the current thumbnail');

 reducedMotion.matches=true;const before=animations.length;
 viewer.open(1,{origin:node('[data-photo="1"]')});pending().onload();
 assert.equal(animations.length,before,'reduced motion skips the shared transition');
 assert.equal(node('[aria-label="Next photograph"]').disabled,true);
 const zoom=node('.mobile-photo-zoom');
 zoom.fire('click');
 assert.equal(stage.children[0].style.scale,'2','zoom opens the loaded photograph at 2×');
 dialog.fire('cancel',{preventDefault(){}});
 assert.equal(stage.children[0].style.scale,'','Escape fits before closing');
 assert.equal(closes,0);
 dialog.fire('cancel',{preventDefault(){}});
 node('.mobile-photo-close').fire('click');
 assert.equal(closes,1,'native Escape uses the application history close path');
 viewer.close();assert.equal(dialog.open,false);

 reducedMotion.matches=false;
 viewer.open(0);pending().onload();
 viewer.close();const closing=animations.at(-1);
 viewer.open(1);pending().onload();closing.finish();await flush();
 assert.equal(dialog.open,true,'reopening during a closing animation keeps the new viewer open');
 viewer.close({animate:false});
 for(const animation of animations)animation.finish();
 await flush();
 console.log('PASS: loading/retry, stale requests, shared transitions, interruption, swipe boundaries, focus restoration, reduced motion and rapid reopen.');
}finally{
 for(const [name,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
}
