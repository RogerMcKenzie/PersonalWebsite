import { frameCount, mobileMotion, restPose, sampleMotion, swapPaths } from './sd-card-motion.js?v=flight-1';

const imagePaths = { auto: 'assets/camera/sd-motion-auto.webp?v=flight-1', manual: 'assets/camera/sd-motion-manual.webp?v=flight-1' };
// Normalized LCD bounds in the rear frame of the portrait render.
const rearLCD = { left: .290441, top: .241176, right: .658088, bottom: .633333 };
const phoneLayout = matchMedia('(max-width:1000px)');
const frameLayouts = new Map();
for (const [group, paths] of Object.entries(mobileMotion.groups)) {
 const rows = Math.ceil(paths.reduce((sum, path) => sum + frameCount(path), 0) / mobileMotion.columns);
 let start = 0;
 for (const path of paths) {
  const count = frameCount(path);
  frameLayouts.set(path, { group, rows, start, count });
  start += count;
 }
}

export function createCardSwap({ camera, lcd, cards, activeCard, reducedMotion, onInsert, onReturn }) {
 const lcdChoices = document.createElement('div');
 lcdChoices.className = 'sd-lcd-choices';
 lcdChoices.id = 'sd-lcd-choices';
 lcdChoices.setAttribute('role', 'group');
 lcdChoices.setAttribute('aria-label', 'Available SD cards');
 lcdChoices.hidden = true;
 lcd.append(lcdChoices);

 const launch = document.createElement('button');
 launch.type = 'button';
 launch.className = 'sd-see-underside';
 launch.textContent = 'See underside';
 launch.hidden = true;

 const still = document.createElement('div');
 still.className = 'sd-poses';
 still.setAttribute('aria-hidden', 'true');

 const hatchControls = document.createElement('section');
 hatchControls.className = 'sd-hatch-controls';
 hatchControls.setAttribute('aria-label', 'SD card hatch');
 hatchControls.hidden = true;

 const status = document.createElement('p');
 status.className = 'sd-sr';
 status.setAttribute('role', 'status');
 camera.append(still, launch, hatchControls, status);

 const makeButton = (text, data, value = '') => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.dataset[data] = value;
  return button;
 };

 const lcdRows = cards.map(card => makeButton(card.name, 'sdInsert', card.id));
 const hatchRows = cards.map(card => makeButton(card.name, 'sdInsert', card.id));
 const showHatch = makeButton('See underside', 'sdUnderside');
 const openHatch = makeButton('Open hatch', 'sdOpenHatch');
 const back = makeButton('Back to screen', 'sdBack');
 lcdChoices.append(...lcdRows, showHatch);
 hatchControls.append(openHatch, ...hatchRows, back);

 let state = 'idle';
 let isPhotoIndex = false;
 let position = { ...restPose };
 let transaction;
 let medium;
 const atlases = new Map();
 const readyAtlases = new Set();
 let committed = false;
 let automatic = false;
 let phoneRegistration;

 function warm() {
  if (navigator.connection?.saveData || camera.sdCompartment?.available()) return;
  for (const [group, path] of Object.entries(imagePaths)) {
   if (atlases.has(group)) continue;
   const image = new Image();
   image.src = path;
   atlases.set(group, image);
   image.decode().then(() => { readyAtlases.add(group); }, () => {});
  }
 }

 function sync(photoIndex = isPhotoIndex) {
  isPhotoIndex = photoIndex;
  const selecting = state === 'lcd';
  const atHatch = state === 'underside' || state === 'hatch';
  const moving = state === 'moving';
  camera.dataset.sdState = state;
  camera.dataset.sdRenderer = medium || '';
  if ((atHatch || moving) && medium === 'live') camera.classList.add('sd-viewing');
  else camera.classList.remove('sd-viewing');
  lcdChoices.hidden = !selecting;
  launch.hidden = !isPhotoIndex || state !== 'idle';
  hatchControls.hidden = !atHatch;
  openHatch.hidden = state !== 'underside';
  back.hidden = !atHatch;
  camera.querySelector('[data-swap-sd]')?.setAttribute('aria-expanded', String(selecting));
  for (const rows of [lcdRows, hatchRows]) {
   for (const button of rows) {
    const current = button.dataset.sdInsert === activeCard().id;
    if (rows === hatchRows) button.hidden = state !== 'hatch';
    button.toggleAttribute('aria-current', current);
    if (current) button.setAttribute('aria-current', 'true');
   }
  }
 }

 function measurePhoneRegistration() {
  const host = camera.getBoundingClientRect();
  const screen = lcd.getBoundingClientRect();
  const width = still.offsetWidth;
  const height = still.offsetHeight;
  if (!width || !height || !screen.width || !screen.height) return;
  const scaleX = screen.width / (width * (rearLCD.right - rearLCD.left));
  const scaleY = screen.height / (height * (rearLCD.bottom - rearLCD.top));
  const spriteX = ((rearLCD.left + rearLCD.right) / 2 - .5) * width;
  const spriteY = ((rearLCD.top + rearLCD.bottom) / 2 - .5) * height;
  return {
   scaleX,
   scaleY,
   shiftX: screen.left + screen.width / 2 - host.left - still.offsetLeft - spriteX * scaleX,
   shiftY: screen.top + screen.height / 2 - host.top - still.offsetTop - height / 2 - spriteY * scaleY,
  };
 }

 function registerPhonePose(turn) {
  if (!phoneRegistration) return;
  const { scaleX, scaleY, shiftX, shiftY } = phoneRegistration;
  const remaining = 1 - Math.sin(Math.PI / 2 * Math.min(1, turn / .82));
  still.style.setProperty('--sd-sx', String(1 + (scaleX - 1) * remaining));
  still.style.setProperty('--sd-sy', String(1 + (scaleY - 1) * remaining));
  still.style.setProperty('--sd-tx', `${shiftX * remaining}px`);
  still.style.setProperty('--sd-ty', `${shiftY * remaining}px`);
 }

 function paint(next, path, elapsed) {
  position = next;
  if (medium === 'live') {
   camera.sdCompartment?.apply(position);
   return;
  }
  if (medium === 'atlas' && path) {
   const { group, rows, start, count } = frameLayouts.get(path);
   const columns = mobileMotion.columns;
   const index = start + Math.round(elapsed / swapPaths[path].duration * (count - 1));
   const column = index % columns;
   const row = Math.floor(index / columns);
   if (still.dataset.motion !== group) {
    still.dataset.motion = group;
    still.style.backgroundImage = `url("${imagePaths[group]}")`;
    still.style.backgroundSize = `${columns * 100}% ${rows * 100}%`;
   }
   still.style.backgroundPosition = `${column * 100 / (columns - 1)}% ${row * 100 / (rows - 1)}%`;
  }
  const { turn, hatch } = position;
  still.classList.toggle('is-visible', turn > 0 || hatch > 0);
  const crossfade = phoneRegistration ? .17 : .12;
  const opacity = reducedMotion.matches ? Number(turn > 0) : Math.min(1, turn / crossfade);
  still.classList.toggle('is-covering', opacity === 1 || hatch > 0);
  still.style.opacity = String(opacity);
  registerPhonePose(turn);
  camera.style.setProperty('--sd-rest-opacity', String(1 - opacity));
 }

 function begin(group) {
  transaction = new AbortController();
  medium = camera.sdCompartment?.available() ? 'live' : readyAtlases.has(group) ? 'atlas' : 'still';
  phoneRegistration = medium === 'atlas' && phoneLayout.matches ? measurePhoneRegistration() : undefined;
  if (medium === 'live') {
   camera.sdCompartment.begin();
   camera.sdCompartment.setCard(activeCard());
  } else if (medium === 'still') {
   delete still.dataset.motion;
   still.style.removeProperty('background-image');
   still.style.removeProperty('background-size');
   still.style.removeProperty('background-position');
  }
  return transaction.signal;
 }

 function play(path, signal, { reverse = false, onFrame } = {}) {
  const { duration } = swapPaths[path];
  function step(elapsed) {
   const sampleTime = reverse ? duration - elapsed : elapsed;
   paint(sampleMotion(path, sampleTime), path, sampleTime);
   onFrame?.(elapsed);
  }
  if (signal.aborted) return Promise.resolve(false);
  if (reducedMotion.matches || medium === 'still') {
   step(duration);
   return Promise.resolve(!signal.aborted);
  }
  return new Promise(resolve => {
   let frame;
   const start = performance.now();
   const done = success => {
    cancelAnimationFrame(frame);
    signal.removeEventListener('abort', abort);
    resolve(success);
   };
   const abort = () => done(false);
   const tick = now => {
    const elapsed = Math.min(duration, now - start);
    step(elapsed);
    if (signal.aborted || elapsed === duration) done(!signal.aborted);
    else frame = requestAnimationFrame(tick);
   };
   signal.addEventListener('abort', abort, { once: true });
   step(0);
   if (!signal.aborted) frame = requestAnimationFrame(tick);
  });
 }

 function reset({ focus = false } = {}) {
  if (automatic && state === 'moving' && !committed) status.textContent = 'Swap cancelled';
  transaction?.abort();
  transaction = undefined;
  if (medium === 'live') {
   camera.sdCompartment?.setCard(activeCard());
   camera.sdCompartment?.finish();
  }
  else if (medium) paint({ ...restPose });
  position = { ...restPose };
  phoneRegistration = undefined;
  medium = undefined;
  state = 'idle';
  automatic = false;
  committed = false;
  sync();
  if (focus) requestAnimationFrame(() => {
   if (state === 'idle') onReturn();
  });
 }

 function open() {
  if (state === 'lcd') { reset({ focus: true }); return; }
  if (state !== 'idle') return;
  warm();
  state = 'lcd';
  sync();
  lcdRows.find(button => !button.hasAttribute('aria-current'))?.focus();
 }

 async function underside() {
  if (state !== 'idle' && state !== 'lcd') return;
  warm();
  const signal = begin('manual');
  state = 'moving';
  sync();
  if (!await play('turn', signal)) return;
  state = 'underside';
  sync();
  openHatch.focus({ preventScroll: true });
 }

 async function openManualHatch() {
  if (state !== 'underside') return;
  state = 'moving';
  sync();
  if (!await play('hatch', transaction.signal)) return;
  state = 'hatch';
  sync();
  hatchRows.find(button => !button.hasAttribute('aria-current'))?.focus({ preventScroll: true });
 }

 async function insert(id) {
  if (state !== 'lcd' && state !== 'hatch') return;
  const card = cards.find(candidate => candidate.id === id);
  if (!card) return;
  if (card.id === activeCard().id) {
   if (state === 'lcd') reset({ focus: true });
   return;
  }
  automatic = state === 'lcd';
  committed = false;
  const signal = automatic ? begin('auto') : transaction.signal;
  state = 'moving';
  sync();
  status.textContent = `Swapping to ${card.name}`;
  const path = automatic ? 'auto' : 'swap';
  const { flip, seat } = swapPaths[path];
  let flipped = false;
  if (!await play(path, signal, { onFrame(elapsed) {
   if (!flipped && elapsed >= flip) {
    flipped = true;
    if (medium === 'live') camera.sdCompartment.setCard(card);
   }
   if (!committed && elapsed >= seat) {
    committed = true;
    onInsert(card.id);
    status.textContent = `${card.name} inserted`;
   }
  } })) return;

  if (automatic) reset({ focus: true });
  else {
   state = 'underside';
   sync();
   back.focus({ preventScroll: true });
  }
 }

 async function returnToScreen() {
  if (state !== 'hatch' && state !== 'underside') return;
  state = 'moving';
  sync();
  const signal = transaction.signal;
  const returned = position.hatch ? await play('close', signal) : await play('turn', signal, { reverse: true });
  if (returned) reset({ focus: true });
 }

 launch.addEventListener('click', underside);
 showHatch.addEventListener('click', underside);
 openHatch.addEventListener('click', openManualHatch);
 back.addEventListener('click', returnToScreen);
 for (const button of [...lcdRows, ...hatchRows]) {
  button.addEventListener('click', () => insert(button.dataset.sdInsert));
 }
 camera.addEventListener('sd-renderer-lost', () => { if (medium === 'live') reset({ focus: true }); });
 document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || state === 'idle') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  reset({ focus: true });
 }, true);
 document.addEventListener('pointerdown', event => {
  if (state === 'lcd' && !event.target.closest('#sd-lcd-choices,[data-swap-sd]')) reset();
 });
 lcdChoices.addEventListener('focusout', event => {
  if (state === 'lcd' && event.relatedTarget &&
      !event.relatedTarget.closest('#sd-lcd-choices,[data-swap-sd]')) reset();
 });
 return { open, sync, warm, reset, get isOpen() { return state !== 'idle'; } };
}
