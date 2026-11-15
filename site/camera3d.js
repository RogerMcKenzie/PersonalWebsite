// Live 3D camera body for desktop widths.
//
// Live HTML follows the LCD and control surfaces through camera-screen.js. A WebGL aperture
// gives the screen depth occlusion; camera.css percentages remain the static/mobile fallback.
// Model source and framing: ../3d/zv-e10-real/zv_e10_real_build.py and zv_e10_real_web.py (FRAME).
//
// Phones/tablets (≤1000px), browsers without WebGL and failed loads keep the static poster.
// Three.js is only downloaded when the 3D view is actually used.

const DESKTOP = window.matchMedia('(min-width: 1001px)');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const MODEL_URL = 'assets/camera/zv-e10.glb?v=extras-20261115-1';

// Orthographic rear framing in metres (Blender FRAME: cx 0, cz 3.35cm, width 13.6cm, 16:9).
const FRAME = { cx: 0, cy: 0.0335, width: 0.136, height: 0.136 * 9 / 16 };
// The canvas is drawn larger than the camera box by this factor (camera.css: inset -25%, 150%)
// with the view widened to match, so the framing is unchanged but the extended lens is not
// cut off at the box edge while the body is being turned.
const OVERSCAN = 1.5;

// Authentic camera legends are hidden when loading an older/source variant of the model.
const HIDDEN_LABELS = ['Label_Menu', 'Label_Fn', 'Label_C2', 'Label_Delete_Icon', 'Label_Playback_Icon', 'Label_Wheel_Arrows'];

// HTML control -> model node that should press in.
const PRESSABLE = [
  ['#menu-toggle', 'Menu_Button', 0.07],
  ['.hardware-playback', 'Playback_Button', 0.07],
  // Playback uses the physical lower-left cap. Fn and delete provide previous/next browsing.
  ['#previous', 'Fn_Button', 0.07],
  ['#next', 'Delete_Button', 0.07],
  ['.dial-center', 'Wheel_Center', 0.08],
  ['.dial-item', 'Control_Wheel', 0.05],
  // Top plate (camera-extras.js)
  ['.cx-shutter', 'Shutter_Button', 0.12],
  ['.cx-movie', 'Movie_Button', 0.05],
  ['.cx-c1', 'C1_Button', 0.05],
];

// Orange wheel segment points at the active section (radians about the wheel axis).
const WHEEL_ANGLE = { home: 0, about: 0, work: -Math.PI / 2, photos: Math.PI, resume: Math.PI / 2, experience: Math.PI / 2 };

const camera = document.querySelector('.camera-v2 .camera');
let started = false;
let restoreInterface = () => {};

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

const endBoot = () => document.documentElement.classList.remove('camera-3d-boot');

function maybeStart() {
  if (started || !camera || !DESKTOP.matches) return;
  if (!webglAvailable()) { endBoot(); return; }
  started = true;
  // index.html adds html.camera-3d-boot before first paint (desktop, motion allowed) so the
  // overlay starts hidden for the intro turn; it removes the class itself after 2.5s.
  const intro = !REDUCED.matches;
  start({ intro }).catch(err => {
    console.warn('3D camera unavailable, using the still image.', err);
    endBoot();
    camera.classList.remove('camera-3d-intro', 'camera-3d-ready');
    restoreInterface();
  });
}

async function start({ intro }) {
  const [THREE, { GLTFLoader }, { attachCameraInterface }, { attachCameraExtras }] = await Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('./camera-screen.js?v=extras-20261115-2'),
    import('./camera-extras.js?v=email-20261115-1'),
  ]);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.toneMapping = THREE.NeutralToneMapping;   // keeps blacks black; AgX lifted them to grey
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  // Three sets an inline display:block; let our mobile media query hide an existing canvas.
  canvas.style.removeProperty('display');
  canvas.className = 'camera-3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  // Product-studio lighting: a dark room with a few bright softboxes, baked into the environment
  // map. A black camera reads as real when its surfaces stay dark and only pick up shaped
  // highlights, which an evenly lit room cannot give. Viewer is at -Z; viewer's left is +X.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(THREE), 0.03).texture;
  scene.environmentIntensity = 1.0;
  // A near light, not a distant one: its falloff shades the flat rear face from upper left to
  // lower right the way a softbox close to a product does, instead of lighting it evenly.
  const key = new THREE.PointLight(0xfff8f0, 0.03, 0, 2);
  key.position.set(0.09, 0.13, -0.15);          // metres; upper left of the viewer, just off the body
  scene.add(key);
  const top = new THREE.DirectionalLight(0xffffff, 0.45);
  top.position.set(-0.1, 0.8, -0.15);           // almost overhead: rims the top plate, dial and button edges
  scene.add(top);

  const view = new THREE.OrthographicCamera(-FRAME.width / 2 * OVERSCAN, FRAME.width / 2 * OVERSCAN, FRAME.height / 2 * OVERSCAN, -FRAME.height / 2 * OVERSCAN, 0.01, 2);
  view.position.set(FRAME.cx, FRAME.cy, -0.6);   // rear of the camera faces glTF -Z
  view.lookAt(FRAME.cx, FRAME.cy, 0);

  const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
  const model = gltf.scene;
  const printed = model.getObjectByName('ZV-E10')?.userData.portfolio_labels === true;
  camera.classList.toggle('camera-printed-model', printed);
  (printed ? ['Label_C2'] : HIDDEN_LABELS).forEach(n => {
    const o = model.getObjectByName(n); if (o) o.visible = false;
  });

  // Turn about the body's centre, not the origin under the lens.
  const pivot = new THREE.Group();
  const centre = new THREE.Vector3(0, 0.032, 0);
  pivot.position.copy(centre);
  model.position.sub(centre);
  pivot.add(model);
  scene.add(pivot);
  const surfaces = attachCameraInterface(THREE, { model, view, camera, canvas,
    frame: FRAME, overscan: OVERSCAN });
  restoreInterface = () => { surfaces.dispose(); canvas.remove(); renderer.dispose(); };

  // ---------------------------------------------------------------- animated state
  const pressables = PRESSABLE.map(([selector, name, depth]) => {
    const node = model.getObjectByName(name);
    if (!node) return null;
    const rest = node.position.clone();
    // Buttons are modelled with "out" along local +Y (glTF); press = move along local -Y.
    const dir = new THREE.Vector3(0, -1, 0).applyQuaternion(node.quaternion).multiplyScalar(depth);
    return { selector, node, rest, dir, t: 0, target: 0 };
  }).filter(Boolean);

  const highlight = model.getObjectByName('Wheel_Highlight');
  const highlightRest = highlight ? highlight.quaternion.clone() : null;
  const yAxis = new THREE.Vector3(0, 1, 0);
  let wheelAngle = WHEEL_ANGLE[document.body.dataset.cameraView] ?? 0;
  let wheelTarget = wheelAngle;
  const spin = new THREE.Quaternion();
  const setWheel = a => { highlight.quaternion.copy(highlightRest).multiply(spin.setFromAxisAngle(yAxis, a)); };
  if (highlight) {
    // The site accent is a true red (lcd.css --lcd-red); the exported segment was orange.
    highlight.material = highlight.material.clone();
    highlight.material.color.set(0xc8102e);
    if (highlight.material.emissive?.getHex()) highlight.material.emissive.set(0x7a0a14);
    setWheel(wheelAngle);
  }

  // Orientation of the whole camera: yaw/pitch, eased toward a target.
  const turn = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 };
  let introAnim = null;

  // ---------------------------------------------------------------- render loop (on demand)
  let frame = 0;
  let last = 0;
  const request = () => { if (!frame) frame = requestAnimationFrame(tick); };

  function tick(now) {
    frame = 0;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    let busy = false;
    const instant = REDUCED.matches;

    for (const p of pressables) {
      if (p.t !== p.target) {
        p.t = instant ? p.target : approach(p.t, p.target, dt / 0.07);
        p.node.position.copy(p.rest).addScaledVector(p.dir, p.t);
        busy ||= p.t !== p.target;
      }
    }

    if (highlight && wheelAngle !== wheelTarget) {
      wheelAngle = instant ? wheelTarget : damp(wheelAngle, wheelTarget, 14, dt);
      if (Math.abs(wheelAngle - wheelTarget) < 1e-3) wheelAngle = wheelTarget;
      setWheel(wheelAngle);
      busy ||= wheelAngle !== wheelTarget;
    }

    if (introAnim) {
      const k = Math.min(1, (now - introAnim.start) / introAnim.duration);
      const e = easeInOutCubic(k);
      turn.yaw = turn.targetYaw = introAnim.yaw * (1 - e);
      turn.pitch = turn.targetPitch = introAnim.pitch * (1 - e);
      if (k >= 1) { introAnim = null; turn.yaw = turn.pitch = turn.targetYaw = turn.targetPitch = 0; camera.classList.remove('camera-3d-intro'); }
      busy = true;
    } else if (turn.yaw !== turn.targetYaw || turn.pitch !== turn.targetPitch) {
      turn.yaw = instant || dragging ? turn.targetYaw : damp(turn.yaw, turn.targetYaw, 7, dt);
      turn.pitch = instant || dragging ? turn.targetPitch : damp(turn.pitch, turn.targetPitch, 7, dt);
      if (Math.abs(turn.yaw - turn.targetYaw) < 1e-4) turn.yaw = turn.targetYaw;
      if (Math.abs(turn.pitch - turn.targetPitch) < 1e-4) turn.pitch = turn.targetPitch;
      busy ||= turn.yaw !== turn.targetYaw || turn.pitch !== turn.targetPitch;
    }
    // XYZ: yaw about the body, then tilt about the viewer's horizontal, so the tilt arrow always
    // tips the top plate toward the visitor whichever way the body has been turned.
    pivot.rotation.set(turn.pitch, turn.yaw, 0, 'XYZ');
    if (extras && extras.tick(dt, instant)) busy = true;
    camera.classList.toggle('camera-exploring', !introAnim &&
      (Math.abs(rest.yaw) > 1e-6 || rest.pitch !== 0 || !!extras?.away()));
    camera.classList.toggle('camera-3d-turned', !introAnim && (Math.abs(turn.yaw) > 0.02 || Math.abs(turn.pitch) > 0.02));

    scene.updateMatrixWorld(true);
    surfaces.update();
    renderer.render(scene, view);
    if (busy) request(); else last = 0;
  }

  // ---------------------------------------------------------------- sizing
  function resize() {
    const r = camera.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const w = r.width * OVERSCAN, h = r.height * OVERSCAN;
    // Cap the drawing buffer at about 6 megapixels: roughly what the canvas used at full width
    // before it overscanned, so the larger canvas costs no more to fill than the old one.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(6e6 / (w * h))));
    renderer.setSize(w, h, false);
    surfaces.setEnabled(DESKTOP.matches && !renderer.getContext().isContextLost());
    surfaces.resize();
    request();
  }
  new ResizeObserver(resize).observe(camera);

  // ---------------------------------------------------------------- button presses
  const findPressable = el => el && pressables.find(p => el.closest(p.selector));
  let held = null;
  const press = p => { if (p) { p.target = 1; request(); } };
  const release = p => { if (p) { p.target = 0; request(); } };
  document.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    held = findPressable(e.target);
    press(held);
  });
  const letGo = () => { release(held); held = null; };
  document.addEventListener('pointerup', letGo);
  document.addEventListener('pointercancel', letGo);
  window.addEventListener('blur', letGo);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const p = findPressable(e.target);
    if (!p) return;
    press(p);
    setTimeout(() => release(p), 130);
  });

  // ---------------------------------------------------------------- wheel follows section
  // While the wheel is dragged it follows the pointer exactly, with soft detents at each
  // section; on release it settles onto the section that is showing.
  let wheelHeld = false;
  const detent = a => a - Math.sin(4 * a) / 8;
  document.addEventListener('camera-wheel', e => {
    if (!highlight) return;
    const { angle, active } = e.detail;
    wheelHeld = active;
    if (active) {
      wheelAngle = wheelTarget = detent(angle);
      setWheel(wheelAngle);
      request();
    } else settleWheel();
  });
  function settleWheel() {
    const target = WHEEL_ANGLE[document.body.dataset.cameraView] ?? 0;
    let delta = ((target - wheelAngle) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    wheelTarget = wheelAngle + delta;
    request();
  }
  new MutationObserver(() => {
    if (wheelHeld) return;
    const target = WHEEL_ANGLE[document.body.dataset.cameraView] ?? 0;
    // Take the short way round.
    let delta = ((target - wheelAngle) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    wheelTarget = wheelAngle + delta;
    request();
  }).observe(document.body, { attributes: true, attributeFilter: ['data-camera-view'] });

  // ---------------------------------------------------------------- explore arrows
  // Two translucent arrows beside the body: the left one turns it a quarter turn at a time,
  // the top one tilts it to show the top plate. The chosen pose holds until changed.
  const rest = { yaw: 0, pitch: 0 };
  const TILT = -1.05;
  const arrowIcon = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const explore = document.createElement('div');
  explore.className = 'camera-explore';
  explore.innerHTML =
    `<button type="button" class="camera-turn camera-turn-left" aria-label="Turn the camera">${arrowIcon('M19 12H5M11 6l-6 6 6 6')}</button>` +
    `<button type="button" class="camera-turn camera-turn-top" aria-label="Tilt to see the top" aria-pressed="false">${arrowIcon('M12 19V5M6 11l6-6 6 6')}</button>` +
    `<button type="button" class="camera-turn camera-turn-home" aria-label="Back to the screen" title="Back to the screen">${arrowIcon('M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11')}</button>`;
  const [turnButton, tiltButton, homeButton] = explore.children;
  const goTo = () => {
    turn.targetYaw = rest.yaw;
    turn.targetPitch = rest.pitch;
    if (REDUCED.matches) { turn.yaw = rest.yaw; turn.pitch = rest.pitch; }
    tiltButton.setAttribute('aria-pressed', String(rest.pitch !== 0));
    tiltButton.setAttribute('aria-label', rest.pitch ? 'Tilt back' : 'Tilt to see the top');
    request();
  };
  // Top-plate and hinge-side controls (null with an older model that lacks the parts).
  const extras = attachCameraExtras(THREE, { model, pivot, view, camera, surfaces, request, rest, goTo, reduced: REDUCED });

  // Back to the rear screen view, the short way round, undoing zoom, doors and the flipped screen.
  homeButton.addEventListener('click', () => {
    if (introAnim) return;
    turn.yaw = (((turn.yaw % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    rest.yaw = rest.pitch = 0;
    extras?.home();
    goTo();
    // The button hides once home; keep keyboard focus on a control that stays.
    if (document.activeElement === homeButton) turnButton.focus({ preventScroll: true });
  });
  turnButton.addEventListener('click', () => {
    if (introAnim) return;
    rest.yaw += Math.PI / 2;
    // A full turn is the rear view again: keep the numbers small without moving the camera.
    if (rest.yaw >= 2 * Math.PI - 1e-6) { rest.yaw -= 2 * Math.PI; turn.yaw -= 2 * Math.PI; turn.targetYaw -= 2 * Math.PI; }
    extras?.hint(); goTo();
  });
  tiltButton.addEventListener('click', () => { if (introAnim) return; rest.pitch = rest.pitch ? 0 : TILT; extras?.hint(); goTo(); });

  // ---------------------------------------------------------------- drag to turn the camera
  // Dragging the body (not the screen or buttons) turns the camera; on release it settles back
  // into the pose chosen with the arrows (the rear view unless one was used).
  let dragging = null;
  camera.addEventListener('pointerdown', e => {
    if (e.button !== 0 || introAnim || !DESKTOP.matches ||
        e.target.closest('.screen-bezel, .controls, .camera-reading-view, .camera-explore, .camera-extras')) return;
    e.preventDefault();
    dragging = { x: e.clientX, y: e.clientY, yaw: turn.targetYaw, pitch: turn.targetPitch, id: e.pointerId };
    camera.setPointerCapture(e.pointerId);
    canvas.classList.add('is-dragging');
    camera.classList.add('is-dragging');
  });
  camera.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const w = camera.clientWidth || 1;
    turn.targetYaw = dragging.yaw + (e.clientX - dragging.x) / w * Math.PI * 1.6;
    turn.targetPitch = clamp(dragging.pitch + (e.clientY - dragging.y) / w * Math.PI, rest.pitch - 0.35, rest.pitch + 0.35);
    request();
  });
  const endDrag = e => {
    if (!dragging || (e && e.pointerId !== dragging.id)) return;
    dragging = null;
    canvas.classList.remove('is-dragging');
    camera.classList.remove('is-dragging');
    // Spring back to the resting pose, the short way round.
    turn.yaw = rest.yaw + (((turn.yaw - rest.yaw) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    goTo();
  };
  camera.addEventListener('pointerup', endDrag);
  camera.addEventListener('pointercancel', endDrag);
  camera.addEventListener('lostpointercapture', endDrag);

  // Keyboard navigation always gets a stable reading pose before the browser chooses focus.
  function readingPose() {
    introAnim = null; dragging = null;
    turn.yaw = turn.pitch = turn.targetYaw = turn.targetPitch = rest.yaw = rest.pitch = 0;
    tiltButton.setAttribute('aria-pressed', 'false');
    tiltButton.setAttribute('aria-label', 'Tilt to see the top');
    pivot.rotation.set(0, 0, 0);
    extras?.reset();
    camera.classList.remove('camera-3d-intro', 'camera-3d-turned');
    canvas.classList.remove('is-dragging');
    camera.classList.remove('is-dragging');
    scene.updateMatrixWorld(true); surfaces.update(); request();
  }
  // A pose chosen with the arrows is kept while tabbing, so its controls can be reached.
  const exploring = () => rest.yaw !== 0 || rest.pitch !== 0;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { readingPose(); return; }
    if (e.target.closest?.('.camera-explore, .camera-extras') || exploring()) return;
    if (['Tab', 'Enter', ' '].includes(e.key)) readingPose();
  }, true);
  camera.addEventListener('focusin', e => {
    if (e.target.closest('.camera-explore, .camera-extras') || exploring()) return;
    if (document.documentElement.dataset.navigation === 'keyboard') readingPose();
  });
  DESKTOP.addEventListener('change', () => { readingPose(); resize(); });
  REDUCED.addEventListener('change', () => { readingPose(); request(); });
  for (const type of ['pointerdown', 'click', 'wheel']) {
    camera.addEventListener(type, e => {
      if (surfaces.blocksScreenEvent(e)) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, { capture: true, passive: false });
  }

  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    endBoot();
    camera.classList.remove('camera-3d-ready', 'camera-3d-intro', 'camera-3d-turned');
    surfaces.setEnabled(false);
  });
  canvas.addEventListener('webglcontextrestored', () => {
    camera.classList.add('camera-3d-ready'); readingPose(); resize();
  });

  // ---------------------------------------------------------------- show it
  camera.querySelector('.camera-shell').after(canvas);
  camera.append(explore);
  resize();
  renderer.compile(scene, view);
  const stillBooting = document.documentElement.classList.contains('camera-3d-boot');
  camera.classList.add('camera-3d-ready');
  if (intro && stillBooting) {
    camera.classList.add('camera-3d-intro');
    introAnim = { start: performance.now(), duration: 1700, yaw: Math.PI * 0.78, pitch: 0.28 };
  }
  endBoot();
  request();
}

function studioEnvironment(THREE) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20),
    new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(0.16), side: THREE.BackSide }));
  env.add(room);
  const panel = (w, h, x, y, z, intensity, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(5, 3.5, 0, 5, -1, 9);                   // large overhead softbox, slightly toward the viewer
  panel(3, 3, 4.5, 2.5, -4.5, 7, 0xfff1e0);     // warm key, viewer's upper left
  panel(1, 5, -6, 1, -1.5, 9, 0xeaf1ff);        // cool strip on the viewer's right: edge highlight
  panel(4, 2.5, 0, 2.5, 6, 3.2);                  // behind the rear view: lights the lens side when turned
  panel(8, 8, 0, -5, 0, 0.9, 0xe9e2d6);         // floor bounce in the page colour
  return env;
}

function approach(v, target, step) { return v < target ? Math.min(target, v + step) : Math.max(target, v - step); }
function damp(v, target, lambda, dt) { return target + (v - target) * Math.exp(-lambda * dt); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

maybeStart();
DESKTOP.addEventListener('change', maybeStart);
