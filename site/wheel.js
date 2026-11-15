// ---------------------------------------------------------------- hardware wheel
// The physical wheel steps through the four printed sections. Inside the menu it moves the
// selection instead. Dragging preserves a simple click until a real turn starts.
const sectionWheel=document.querySelector('.dial');
const wheelSections=['about','work','photos','resume'];
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
const WHEEL_ANGLE={about:0,work:-Math.PI/2,photos:Math.PI,resume:Math.PI/2};
let dialAngle=0;
function nearAngle(angle,reference){return angle+Math.round((reference-angle)/(2*Math.PI))*2*Math.PI;}
function sendWheel(angle,active){document.dispatchEvent(new CustomEvent('camera-wheel',{detail:{angle,active}}));}
let wheelDrag=null,wheelSuppressClick=false;
function wheelPoint(e){
 if(cameraBody.classList.contains('camera-embedded')){
  const rect=cameraBody.getBoundingClientRect();
  const local=new DOMPoint(e.clientX-rect.left,e.clientY-rect.top)
   .matrixTransform(new DOMMatrix(getComputedStyle(sectionWheel).transform).inverse());
  return {x:local.x-sectionWheel.offsetWidth/2,y:local.y-sectionWheel.offsetHeight/2};
 }
 const rect=sectionWheel.getBoundingClientRect();
 return {x:e.clientX-rect.left-rect.width/2,y:e.clientY-rect.top-rect.height/2};
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
 render(['work','photos','resume','about'][quarter],{focus:true});
});
// The centre button confirms the menu selection while the menu is open.
document.querySelector('.dial-center').addEventListener('click',e=>{
 if(cameraMenu.hidden)return;
 e.preventDefault();e.stopImmediatePropagation();
 render(menuButtons[menuIndex].dataset.view,{focus:true});
},true);
