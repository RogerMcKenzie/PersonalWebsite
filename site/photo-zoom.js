export function createPhotoZoom({ stage, button, pinch = false, onGesture }) {
 const events = new AbortController();
 const pointers = new Map();
 const clickPhoto = button === stage;
 let image = null;
 let scale = 1, x = 0, y = 0;
 let ownsGesture = false;
 let pinchStart;
 let press;

 function paint() {
  const zoomed = scale > 1;
  stage.toggleAttribute('data-zoomed', zoomed);
  if (clickPhoto) {
   button.setAttribute('aria-disabled', String(!image));
   if (image) button.setAttribute('aria-label', `${zoomed ? 'Fit photo' : 'Zoom in on'} ${image.alt}`);
  } else {
   button.disabled = !image;
   button.textContent = zoomed ? 'Fit photo' : 'Zoom in';
  }
  if (!image) return;
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const fit = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const maxX = Math.max(0, (image.naturalWidth * fit * scale - width) / 2);
  const maxY = Math.max(0, (image.naturalHeight * fit * scale - height) / 2);
  x = Math.max(-maxX, Math.min(maxX, x));
  y = Math.max(-maxY, Math.min(maxY, y));
  image.style.translate = zoomed ? `${x}px ${y}px` : '';
  image.style.scale = zoomed ? String(scale) : '';
 }

 function reset() {
  scale = 1;
  x = y = 0;
  pointers.clear();
  ownsGesture = false;
  pinchStart = undefined;
  paint();
 }

 function setImage(next) {
  reset();
  image = next?.naturalWidth ? next : null;
  paint();
 }

 function setScale(next, anchor = { x: 0, y: 0 }, point = anchor) {
  const value = Math.max(1, Math.min(3, next));
  const ratio = value / scale;
  x = point.x - (anchor.x - x) * ratio;
  y = point.y - (anchor.y - y) * ratio;
  scale = value;
  if (scale === 1) x = y = 0;
  paint();
 }

 function point(event) {
  const rect = stage.getBoundingClientRect();
  return {
   x: (event.clientX - rect.left) * stage.clientWidth / rect.width - stage.clientWidth / 2,
   y: (event.clientY - rect.top) * stage.clientHeight / rect.height - stage.clientHeight / 2,
  };
 }

 function pinchGeometry() {
  const [a,b] = pointers.values();
  return { distance: Math.max(1, Math.hypot(b.x-a.x, b.y-a.y)), center:{ x:(a.x+b.x)/2, y:(a.y+b.y)/2 } };
 }

 function takeGesture(event) {
  if (!ownsGesture) onGesture?.();
  ownsGesture = true;
  for (const id of pointers.keys()) stage.setPointerCapture(id);
  event.stopImmediatePropagation();
 }

 button.addEventListener('click', event => {
  const pointerClick = clickPhoto && event.detail > 0;
  const dragged = pointerClick && press?.dragged;
  press = undefined;
  if (dragged) return;
  if (!image) return;
  if (scale > 1) reset();
  else {
   onGesture?.();
   setScale(2, pointerClick ? point(event) : undefined);
  }
 }, { signal:events.signal });

 stage.addEventListener('pointerdown', event => {
  if (!image || event.button !== 0 || (!clickPhoto && event.target.closest('button'))) return;
  if (clickPhoto) press = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
  if (scale === 1 && (!pinch || event.pointerType !== 'touch')) return;
  if (pointers.size >= 2) return;
  pointers.set(event.pointerId, point(event));
  if (pointers.size === 2) pinchStart = pinchGeometry();
  if (scale > 1 || pointers.size === 2 || ownsGesture) takeGesture(event);
 }, { signal:events.signal });

 stage.addEventListener('pointermove', event => {
  if (press?.id === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 5) {
   press.dragged = true;
  }
  const prior = pointers.get(event.pointerId);
  if (!prior) return;
  const updated = point(event);
  pointers.set(event.pointerId, updated);
  if (!ownsGesture) return;
  if (pinchStart && pointers.size === 2) {
   const current = pinchGeometry();
   setScale(scale * current.distance / pinchStart.distance, pinchStart.center, current.center);
   pinchStart = current;
  } else if (scale > 1) {
   x += updated.x - prior.x;
   y += updated.y - prior.y;
   paint();
  }
  event.stopImmediatePropagation();
 }, { signal:events.signal });

 function endPointer(event) {
  if (event.type === 'lostpointercapture' && event.target !== stage) return;
  if (!pointers.delete(event.pointerId)) return;
  pinchStart = undefined;
  if (ownsGesture) event.stopImmediatePropagation();
  if (pointers.size === 0) ownsGesture = false;
 }
 for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  stage.addEventListener(type, endPointer, { signal:events.signal });
 }

 stage.addEventListener('keydown', event => {
  if (scale <= 1 || event.altKey || event.ctrlKey || event.metaKey) return;
  const direction = { ArrowLeft:[1,0], ArrowRight:[-1,0], ArrowUp:[0,1], ArrowDown:[0,-1] }[event.key];
  if (!direction) return;
  event.preventDefault();
  x += direction[0] * 48;
  y += direction[1] * 48;
  paint();
 }, { signal:events.signal });

 const resize = new ResizeObserver(paint);
 resize.observe(stage);
 paint();
 return {
  get zoomed(){ return scale > 1; },
  setImage,
  reset,
  dispose(){ events.abort(); resize.disconnect(); },
 };
}
