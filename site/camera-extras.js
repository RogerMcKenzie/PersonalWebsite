// Top-plate and hinge-side controls for the live 3D camera (desktop only).
//
// Each control is a real HTML button or link projected onto its part of the model by
// camera-screen.js (addControl), so it stays keyboard and screen-reader accessible and only
// accepts clicks while its face is turned toward the visitor.
//
// Model coordinates: glTF nodes under the "ZV-E10" root are in centimetres. Blender (x, y, z)
// becomes glTF (x, z, -y): +Y is up, +Z is the front (lens), +X is the hinge side.

const EMAIL = 'roger@rogermckz.dev';
const YOUTUBE = 'https://www.youtube.com/@RogerMcKenzie1';
const HW = 11.52 / 2;                       // half body width (cm)
const DOOR_OPEN = -1.75;                    // port doors swing out about 100 degrees
const SWING = -176 * Math.PI / 180;         // vari-angle screen, swung out to face the front
const SWITCH_TRAVEL = 0.48;                 // power slider, ON -> OFF (cm, toward the hinge side)
const LENS_OUT = 1.6;                       // lens extension when powered on (cm)
const ZOOM_MIN = 0.55, ZOOM_MAX = 2.4;

const PORTS = [
  { key: 'mic', label: 'Email', title: 'Email Roger', href: `mailto:${EMAIL}`, door: 'mic', y: 5.07, z: 0.07 },
  { key: 'usb', label: 'GitHub', title: 'Roger on GitHub (opens in a new tab)', href: 'https://github.com/RogerMcKenzie', door: 'main', y: 3.63, z: 0.03, external: true },
  { key: 'hdmi', label: 'LinkedIn', title: 'Roger on LinkedIn (opens in a new tab)', href: 'https://www.linkedin.com/in/rogermckenzie/', door: 'main', y: 2.53, z: 0.03, external: true },
  { key: 'phones', label: 'YouTube', title: 'Roger on YouTube (opens in a new tab)', href: YOUTUBE, door: 'main', y: 1.55, z: 0.03, external: true },
];

export function attachCameraExtras(THREE, { model, pivot, view, camera, surfaces, request, rest, goTo, reduced }) {
  const root = model.getObjectByName('ZV-E10');
  const get = name => model.getObjectByName(name);
  const need = ['Shutter_Button', 'Movie_Button', 'C1_Button', 'Power_Switch', 'Port_Door', 'Port_Door_Mic',
    'Zoom_Lever', 'Lens_Zoom_Lever', 'Lens', 'Lens_Extension', 'Screen_Hinge'];
  if (!root || need.some(n => !get(n))) return null;      // an older model: no extra controls

  // ---------------------------------------------------------------- anchors on the surfaces
  // Anchor frame (same as the rear buttons): +Y out of the face, +Z up as seen, +X viewer-left.
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function anchor(parent, position, x, y, z) {
    const o = new THREE.Object3D();
    o.position.copy(position);
    o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    parent.add(o);
    return o;
  }
  const onTop = (x, y, z) => anchor(root, V(x, y, z), V(1, 0, 0), V(0, 1, 0), V(0, 0, 1));
  const onSide = (y, z) => anchor(root, V(HW + 0.02, y, z), V(0, 0, 1), V(1, 0, 0), V(0, 1, 0));

  // ---------------------------------------------------------------- moving parts
  const hingeNode = get('Screen_Hinge');
  const hingeRest = hingeNode.quaternion.clone();
  const lever = get('Zoom_Lever'), leverRest = lever.quaternion.clone();
  const lensLever = get('Lens_Zoom_Lever'), lensLeverRest = lensLever.quaternion.clone();
  const lensExt = get('Lens_Extension');
  const powerSwitch = get('Power_Switch'), switchRest = powerSwitch.position.clone();
  const ring = get('Movie_Ring');
  if (ring?.material) { ring.material = ring.material.clone(); ring.material.emissive?.set(0xc8102e); }
  const yAxis = V(0, 1, 0), q = new THREE.Quaternion();

  // Doors swing about their front edge: wrap each in a pivot on that edge.
  function doorPivot(name, frontZ) {
    const door = get(name);
    const p = new THREE.Group();
    p.position.set(HW + 0.02, 0, frontZ);
    root.add(p);
    root.updateMatrixWorld(true);
    p.attach(door);
    return p;
  }
  const doors = { mic: { pivot: doorPivot('Port_Door_Mic', 0.6), t: 0, target: 0 },
    main: { pivot: doorPivot('Port_Door', 0.6), t: 0, target: 0 } };

  const state = {
    swing: 0, swingTarget: 0,
    off: 0, offTarget: 0,
    lever: 0, leverTarget: 0,          // -1 W, +1 T (top lever)
    lensLever: 0, lensLeverTarget: 0,
    zoom: 1, zoomTarget: 1, zoomHeld: 0,
    panX: 0, panY: 0, panXTarget: 0, panYTarget: 0,
    tally: 0,
  };
  const base = { x: view.position.x, y: view.position.y };

  // ---------------------------------------------------------------- HTML targets
  const box = document.createElement('div');
  box.className = 'camera-extras';
  const live = document.createElement('p');
  live.className = 'camera-extras-status';
  live.setAttribute('role', 'status');
  const toast = document.createElement('span');
  toast.className = 'camera-toast';
  toast.setAttribute('aria-hidden', 'true');
  camera.append(box, toast, live);
  function make(tag, cls, label, extra = {}) {
    const el = document.createElement(tag);
    el.className = `camera-extra ${cls}`;
    if (tag === 'button') el.type = 'button';
    el.setAttribute('aria-label', label);
    el.title = extra.title || label;
    if (extra.href) {
      el.href = extra.href;
      if (extra.external) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    }
    if (extra.text) { const s = document.createElement('span'); s.className = 'camera-extra-text'; s.textContent = extra.text; el.append(s); }
    box.append(el);
    return el;
  }
  const isOn = () => state.offTarget === 0;
  const closed = () => state.swingTarget === 0 && state.swing < 0.05;
  const say = text => { live.textContent = ''; setTimeout(() => { live.textContent = text; }, 30); };

  // Top plate
  const shutter = make('button', 'cx-shutter', 'Take a photo and open Photos', { title: 'Shutter' });
  const movie = make('a', 'cx-movie', 'Roger McKenzie on YouTube (opens in a new tab)', { href: YOUTUBE, external: true, title: 'Record: YouTube' });
  const c1 = make('button', 'cx-c1', 'Copy Roger’s email address', { title: 'C1: copy email' });
  const power = make('button', 'cx-power', 'Turn the camera off', { title: 'Power' });
  power.setAttribute('aria-pressed', 'false');
  const zoomOut = make('button', 'cx-zoom', 'Zoom out', { title: 'W: zoom out' });
  const zoomIn = make('button', 'cx-zoom', 'Zoom in', { title: 'T: zoom in' });
  // Lens
  const lensOut = make('button', 'cx-zoom', 'Zoom out', { title: 'Lens zoom: W' });
  const lensIn = make('button', 'cx-zoom', 'Zoom in', { title: 'Lens zoom: T' });
  // Hinge side
  const flipRear = make('button', 'cx-flip', 'Flip out the screen', { title: 'Flip out the screen' });
  const flipSide = make('button', 'cx-flip', 'Flip out the screen', { title: 'Flip out the screen' });
  const doorMic = make('button', 'cx-door', 'Open the microphone port door', { title: 'Port door' });
  const doorMain = make('button', 'cx-door', 'Open the port door', { title: 'Port door' });
  const portLinks = PORTS.map(p => ({ ...p, el: make('a', 'cx-port', p.title, { href: p.href, external: p.external, text: p.label, title: p.title }) }));

  const add = (el, node, size, when) => surfaces.addControl(el, node, { size, when });
  add(shutter, get('Shutter_Button'), 0.84, isOn);
  add(movie, get('Movie_Button'), 1.0, isOn);
  add(c1, get('C1_Button'), 0.8, isOn);
  add(power, get('Power_Switch'), 0.9);
  add(zoomOut, onTop(-2.87, 6.28, 1.63), 0.6);
  add(zoomIn, onTop(-4.37, 6.28, 1.63), 0.6);
  // Lens lever: on the hinge side of the barrel (lens frame: +Y is the optical axis).
  const a = 335 * Math.PI / 180, radial = V(Math.cos(a), 0, -Math.sin(a));
  // The lens frame's -Z is the world's up; this is that direction made perpendicular to radial.
  const lensUp = V(-Math.sin(a), 0, -Math.cos(a));
  const lensFrame = p => anchor(get('Lens'), V(3.42 * radial.x, p, 3.42 * radial.z), V(0, 1, 0), radial, lensUp);
  add(lensOut, lensFrame(0.72), [0.5, 0.9]);
  add(lensIn, lensFrame(1.28), [0.5, 0.9]);
  // Screen hinge: a target on the knuckle's rear face that swings with it, so the same target
  // folds the screen back from the front, plus one on its side face while the screen is closed.
  add(flipRear, anchor(hingeNode, V(0, 0, -0.35), V(1, 0, 0), V(0, 0, -1), V(0, 1, 0)), 0.68);
  add(flipSide, onSide(2.9, -1.84), [0.68, 1.6], closed);
  // Doors: the whole door is the target (outline from the model build, y -0.6..0.55).
  add(doorMic, onSide(5.075, 0.075), [1.05, 1.05]);
  add(doorMain, onSide(2.65, 0.025), [1.15, 3.3]);
  for (const p of portLinks) add(p.el, onSide(p.y, p.z), [0.9, 0.6], () => doors[p.door].t > 0.85);

  // ---------------------------------------------------------------- actions
  function flash() {
    camera.classList.remove('is-capturing');
    void camera.offsetWidth;
    camera.classList.add('is-capturing');
    setTimeout(() => camera.classList.remove('is-capturing'), 320);
  }
  shutter.addEventListener('click', () => {
    if (!isOn()) return;
    flash();
    setTimeout(() => document.querySelector('.lcd-nav [data-view="photos"]')?.click(), reduced.matches ? 0 : 140);
  });
  movie.addEventListener('click', () => { state.tally = 1; request(); });

  async function copyEmail() {
    try { await navigator.clipboard.writeText(EMAIL); }
    catch { location.href = `mailto:${EMAIL}`; return; }
    const r = c1.getBoundingClientRect(), c = camera.getBoundingClientRect();
    toast.textContent = 'Email copied';
    toast.style.left = `${r.left + r.width / 2 - c.left}px`;
    toast.style.top = `${r.top - c.top}px`;
    toast.classList.remove('is-shown'); void toast.offsetWidth; toast.classList.add('is-shown');
    say(`Email address copied: ${EMAIL}`);
  }
  c1.addEventListener('click', () => { if (isOn()) copyEmail(); });

  function setPower(on) {
    state.offTarget = on ? 0 : 1;
    camera.classList.toggle('camera-off', !on);
    const lcd = camera.querySelector('.screen'), controls = camera.querySelector('.controls');
    if (lcd) lcd.inert = !on;
    if (controls) controls.inert = !on;
    power.setAttribute('aria-pressed', String(!on));
    power.setAttribute('aria-label', on ? 'Turn the camera off' : 'Turn the camera on');
    say(on ? 'Camera on' : 'Camera off');
    request();
  }
  power.addEventListener('click', () => setPower(!isOn()));

  // Zoom: a click is one step; holding keeps zooming until release (the lever springs back).
  function holdZoom(button, dir, which) {
    let timer = 0;
    const stop = () => {
      clearTimeout(timer);
      state.zoomHeld = 0; state[which + 'Target'] = 0; request();
    };
    button.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      state[which + 'Target'] = dir;
      zoomStep(dir);
      timer = setTimeout(() => { state.zoomHeld = dir; request(); }, 280);
      request();
    });
    for (const t of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) button.addEventListener(t, stop);
    button.addEventListener('click', e => {
      if (e.detail !== 0) return;                 // keyboard: a single step with a lever flick
      zoomStep(dir);
      state[which + 'Target'] = dir; request();
      setTimeout(stop, 160);
    });
  }
  function zoomStep(dir) {
    state.zoomTarget = clamp(state.zoomTarget * (dir > 0 ? 1.2 : 1 / 1.2), ZOOM_MIN, ZOOM_MAX);
    request();
  }
  holdZoom(zoomOut, -1, 'lever'); holdZoom(zoomIn, 1, 'lever');
  holdZoom(lensOut, -1, 'lensLever'); holdZoom(lensIn, 1, 'lensLever');

  // Vari-angle screen: swing it out to face the front, turn the body to the front and frame both.
  function setScreen(open) {
    state.swingTarget = open ? 1 : 0;
    rest.yaw = open ? Math.PI : 0;
    rest.pitch = 0;
    if (open) {
      const fit = fitFor(open);
      state.zoomTarget = fit.zoom; state.panXTarget = fit.x; state.panYTarget = fit.y;
    } else { state.zoomTarget = 1; state.panXTarget = state.panYTarget = 0; }
    for (const b of [flipRear, flipSide]) b.setAttribute('aria-label', open ? 'Fold the screen back' : 'Flip out the screen');
    say(open ? 'Screen flipped out to face you' : 'Screen folded back');
    goTo();
  }
  for (const b of [flipRear, flipSide]) b.addEventListener('click', () => setScreen(state.swingTarget === 0));

  // Fit the whole body and the open screen in the camera box for a pose.
  const fitBox = new THREE.Box3(), size = new THREE.Vector3(), centre = new THREE.Vector3();
  function fitFor(open) {
    const savedHinge = hingeNode.quaternion.clone(), savedRot = pivot.rotation.clone();
    hingeNode.quaternion.copy(hingeRest).multiply(q.setFromAxisAngle(yAxis, open ? SWING : 0));
    pivot.rotation.set(0, open ? Math.PI : 0, 0, 'XYZ');
    pivot.updateMatrixWorld(true);
    fitBox.setFromObject(pivot);
    hingeNode.quaternion.copy(savedHinge); pivot.rotation.copy(savedRot); pivot.updateMatrixWorld(true);
    fitBox.getSize(size); fitBox.getCenter(centre);
    const w = view.right - view.left, h = view.top - view.bottom;     // overscanned view
    const zoom = Math.min(1, 0.9 * (w / 1.5) / size.x, 0.9 * (h / 1.5) / size.y);
    fitFor.last = zoom;
    return { zoom, x: centre.x - base.x, y: centre.y - base.y };
  }

  function toggleDoor(key, el) {
    const d = doors[key];
    d.target = d.target ? 0 : 1;
    el.setAttribute('aria-label', `${d.target ? 'Close' : 'Open'} the ${key === 'mic' ? 'microphone ' : ''}port door`);
    say(d.target ? (key === 'mic' ? 'Microphone port: email' : 'Ports: GitHub, LinkedIn and YouTube') : 'Port door closed');
    request();
  }
  doorMic.addEventListener('click', () => toggleDoor('mic', doorMic));
  doorMain.addEventListener('click', () => toggleDoor('main', doorMain));

  // ---------------------------------------------------------------- animation
  function tick(dt, instant) {
    let busy = false;
    const ease = (v, target, rate) => {
      if (v === target) return v;
      const next = instant ? target : damp(v, target, rate, dt);
      const done = Math.abs(next - target) < 1e-4;
      busy ||= !done;
      return done ? target : next;
    };
    if (state.zoomHeld) {
      state.zoomTarget = clamp(state.zoomTarget * Math.exp(state.zoomHeld * 1.1 * dt), ZOOM_MIN, ZOOM_MAX);
      busy = true;
    }
    state.swing = ease(state.swing, state.swingTarget, 4.5);
    hingeNode.quaternion.copy(hingeRest).multiply(q.setFromAxisAngle(yAxis, SWING * easeInOut(state.swing)));
    for (const d of Object.values(doors)) {
      d.t = ease(d.t, d.target, 7);
      d.pivot.rotation.y = DOOR_OPEN * d.t;
    }
    state.off = ease(state.off, state.offTarget, 6);
    powerSwitch.position.copy(switchRest).x += SWITCH_TRAVEL * Math.min(1, state.off * 2.2);
    lensExt.position.y = LENS_OUT * (1 - easeInOut(state.off));
    state.lever = ease(state.lever, state.leverTarget, 18);
    lever.quaternion.copy(leverRest).multiply(q.setFromAxisAngle(yAxis, -0.28 * state.lever));
    state.lensLever = ease(state.lensLever, state.lensLeverTarget, 18);
    lensLever.quaternion.copy(lensLeverRest).multiply(q.setFromAxisAngle(yAxis, 0.05 * state.lensLever));
    if (ring?.material) {
      state.tally = ease(state.tally, 0, 3);
      ring.material.emissiveIntensity = state.tally * 2.5;
    }
    state.zoom = ease(state.zoom, state.zoomTarget, 8);
    state.panX = ease(state.panX, state.panXTarget, 6);
    state.panY = ease(state.panY, state.panYTarget, 6);
    if (view.zoom !== state.zoom) { view.zoom = state.zoom; view.updateProjectionMatrix(); }
    view.position.set(base.x + state.panX, base.y + state.panY, view.position.z);
    // Show a brief ring on targets that come into view just after the visitor turns the camera.
    const now = performance.now();
    for (const el of box.children) {
      const shown = el.style.visibility === 'visible';
      if (shown && !shownBefore.get(el) && now < hintUntil && !reduced.matches) {
        el.classList.remove('is-hint'); void el.offsetWidth; el.classList.add('is-hint');
      }
      shownBefore.set(el, shown);
    }
    if (now < hintUntil) busy = true;
    const fitted = state.swingTarget ? Math.abs(state.zoomTarget - fitFor.last) < 1e-3 : state.zoomTarget === 1;
    camera.classList.toggle('camera-zoomed', !fitted);
    return busy;
  }

  // Brief rings on targets that appear after a turn, so the visitor can see what is clickable.
  let hintUntil = 0;
  const shownBefore = new Map();
  function hint() { hintUntil = performance.now() + 2500; request(); }

  // Anything moved away from the plain rear view (drives the "Back to the screen" button).
  function away() {
    return state.swingTarget !== 0 || state.zoomTarget !== 1 || state.panXTarget !== 0 || state.panYTarget !== 0
      || Object.values(doors).some(d => d.target) || !isOn();
  }

  // Animated way home: fold the screen, close the doors, zoom out and switch back on.
  function home() {
    state.swingTarget = 0; state.zoomTarget = 1; state.zoomHeld = 0;
    state.panXTarget = state.panYTarget = 0;
    for (const d of Object.values(doors)) d.target = 0;
    doorMic.setAttribute('aria-label', 'Open the microphone port door');
    doorMain.setAttribute('aria-label', 'Open the port door');
    for (const b of [flipRear, flipSide]) b.setAttribute('aria-label', 'Flip out the screen');
    if (!isOn()) setPower(true);
    request();
  }

  // Undo zooming: back to the framing for the current screen position.
  function resetZoom() {
    if (state.swingTarget) { const fit = fitFor(true); state.zoomTarget = fit.zoom; state.panXTarget = fit.x; state.panYTarget = fit.y; }
    else { state.zoomTarget = 1; state.panXTarget = state.panYTarget = 0; }
    request();
  }

  // Back to the plain rear reading view (keyboard navigation, Escape, losing the 3D view).
  function reset() {
    state.swing = state.swingTarget = 0;
    state.zoom = state.zoomTarget = 1; state.zoomHeld = 0;
    state.panX = state.panY = state.panXTarget = state.panYTarget = 0;
    state.lever = state.leverTarget = state.lensLever = state.lensLeverTarget = 0;
    for (const d of Object.values(doors)) d.t = d.target = 0;
    doorMic.setAttribute('aria-label', 'Open the microphone port door');
    doorMain.setAttribute('aria-label', 'Open the port door');
    for (const b of [flipRear, flipSide]) b.setAttribute('aria-label', 'Flip out the screen');
    if (!isOn()) setPower(true);
    tick(0, true);
  }

  return { tick, reset, resetZoom, home, away, hint, element: box };
}

function damp(v, target, lambda, dt) { return target + (v - target) * Math.exp(-lambda * dt); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
