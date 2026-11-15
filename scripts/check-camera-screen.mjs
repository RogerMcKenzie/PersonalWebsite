// Exercise the projection, depth hit-testing and fallback lifecycle against the shipped GLB.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../site/vendor/three/three.module.min.js';
import { attachCameraInterface } from '../site/camera-screen.js';

const bytes = fs.readFileSync(new URL('../site/assets/camera/zv-e10.glb', import.meta.url));
const jsonLength = bytes.readUInt32LE(12);
const asset = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength));
const binaryStart = 20 + jsonLength + 8;
const printedRoot = asset.nodes.find(n => n.name === 'ZV-E10');
assert.equal(printedRoot.extras.portfolio_labels, true, 'export identifies portfolio printing');
assert.ok(bytes.length <= 5e6, 'GLB stays under the 5 MB budget');
assert.ok(asset.meshes.reduce((sum,m) => sum + m.primitives.reduce((n,p) =>
  n + asset.accessors[p.indices].count / 3, 0), 0) <= 100000, 'triangle budget');
const labelMaterial = asset.materials.find(m => m.name === 'ZVR_Labels');
assert.equal(labelMaterial.alphaMode, 'BLEND');
assert.ok(!labelMaterial.emissiveFactor?.some(v => v > 0), 'print receives scene lighting');
assert.ok(labelMaterial.pbrMetallicRoughness.roughnessFactor >= 0.5, 'matte print');
for (const [name, parent, marking] of [
  ['Label_Menu','ZV-E10','MENU'], ['Label_Fn','Fn_Button','PREVIOUS'],
  ['Label_Playback_Icon','Playback_Button','PLAYBACK'], ['Label_Delete_Icon','Delete_Button','NEXT'],
  ['Label_Home','Wheel_Center','HOME'], ['Label_Wheel_Arrows','ZV-E10','ABOUT | WORK | PHOTOS | CAREER'],
]) {
  const index = asset.nodes.findIndex(n => n.name === name);
  assert.ok(index >= 0, `${name} is exported`);
  assert.equal(asset.nodes[index].extras.marking, marking);
  assert.equal(asset.nodes.find(n => n.children?.includes(index))?.name, parent, `${name} follows its intended surface`);
}
function attribute(index) {
  const a = asset.accessors[index], v = asset.bufferViews[a.bufferView];
  const ArrayType = { 5126: Float32Array, 5123: Uint16Array, 5125: Uint32Array }[a.componentType];
  const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
  const offset = binaryStart + (v.byteOffset || 0) + (a.byteOffset || 0);
  const copy = bytes.subarray(offset, offset + a.count * size * ArrayType.BYTES_PER_ELEMENT);
  return new THREE.BufferAttribute(new ArrayType(copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.length)), size);
}
const nodes = asset.nodes.map(n => {
  let object;
  if (n.mesh !== undefined) {
    const primitive = asset.meshes[n.mesh].primitives[0];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', attribute(primitive.attributes.POSITION));
    geometry.setIndex(attribute(primitive.indices));
    object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  } else object = new THREE.Group();
  object.name = n.name;
  if (n.translation) object.position.fromArray(n.translation);
  if (n.rotation) object.quaternion.fromArray(n.rotation);
  if (n.scale) object.scale.fromArray(n.scale);
  return object;
});
asset.nodes.forEach((n, i) => (n.children || []).forEach(c => nodes[i].add(nodes[c])));
const model = new THREE.Group();
nodes.filter(n => !n.parent).forEach(n => model.add(n));
const pivot = new THREE.Group();
pivot.position.set(0, 0.032, 0); model.position.sub(pivot.position); pivot.add(model);
const frame = { width: 0.136, height: 0.136 * 9 / 16 };
const view = new THREE.OrthographicCamera(-frame.width * 0.75, frame.width * 0.75,
  frame.height * 0.75, -frame.height * 0.75, 0.01, 2);
view.position.set(0, 0.0335, -0.6); view.lookAt(0, 0.0335, 0); view.updateMatrixWorld(true);
pivot.updateMatrixWorld(true);
// Rear layout from Roger's camera photo. Menu ink is stationary above its blank cap.
const at = name => model.getObjectByName(name).getWorldPosition(new THREE.Vector3());
assert.ok(at('Label_Menu').y > at('Menu_Button').y, 'MENU sits above its button');
assert.ok(at('Fn_Button').y > at('Control_Wheel').y, 'Fn sits above the wheel');
assert.ok(at('Playback_Button').y < at('Control_Wheel').y, 'playback sits below the wheel');
assert.ok(at('Playback_Button').x > at('Delete_Button').x, 'playback is nearer the LCD');
const stationaryInk = model.getObjectByName('Label_Wheel_Arrows');
const stationaryRest = stationaryInk.getWorldPosition(new THREE.Vector3());
for (const [button, label] of [['Fn_Button','Label_Fn'],
  ['Playback_Button','Label_Playback_Icon'], ['Delete_Button','Label_Delete_Icon'], ['Wheel_Center','Label_Home']]) {
  const cap = model.getObjectByName(button), ink = model.getObjectByName(label);
  const rest = cap.position.clone(), before = ink.getWorldPosition(new THREE.Vector3());
  const capBefore = cap.getWorldPosition(new THREE.Vector3());
  cap.position.add(new THREE.Vector3(0,-0.07,0).applyQuaternion(cap.quaternion));
  pivot.updateMatrixWorld(true);
  const travel = ink.getWorldPosition(new THREE.Vector3()).sub(before);
  const capTravel = cap.getWorldPosition(new THREE.Vector3()).sub(capBefore);
  assert.ok(travel.length() > 0.0005 && travel.distanceTo(capTravel) < 1e-8, `${label} depresses with its cap`);
  assert.ok(stationaryInk.getWorldPosition(new THREE.Vector3()).distanceTo(stationaryRest) < 1e-8);
  cap.position.copy(rest); pivot.updateMatrixWorld(true);
}
const cover = new THREE.Mesh(new THREE.PlaneGeometry(0.004, 0.004), new THREE.MeshBasicMaterial());
cover.rotation.y = Math.PI;
cover.position.copy(model.getObjectByName('Screen_Display').getWorldPosition(new THREE.Vector3()));
cover.position.x += 0.015; cover.position.z -= 0.001;
model.add(cover); pivot.updateMatrixWorld(true);

function element() {
  return { original: 'color: inherit;', inert: false, style: { setProperty(k, v) { this[k] = v; },
    removeProperty(k) { delete this[k]; } }, getAttribute() { return this.original; },
    setAttribute(k, v) { this.restored = v; }, removeAttribute() { this.restored = null; },
    contains(target) { return target === this; } };
}
const elements = new Map(['.screen-bezel', '.controls', '#menu-toggle', '.hardware-playback',
  '#previous', '#next', '.dial'].map(s => [s, element()]));
const classes = new Set();
const camera = { clientWidth: 1440, clientHeight: 810, querySelector: s => elements.get(s),
  classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } } };
const canvas = { getBoundingClientRect: () => ({ left: -camera.clientWidth / 4,
  top: -camera.clientHeight / 4, width: camera.clientWidth * 1.5, height: camera.clientHeight * 1.5 }) };
const surface = attachCameraInterface(THREE, { model, view, camera, canvas, frame, overscan: 1.5 });
const screen = elements.get('.screen-bezel');
const display = model.getObjectByName('Screen_Display');
const matrix = e => e.style.transform.slice(7, -1).split(',').map(Number);
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 0.03, `${message}: ${a} != ${b}`);
surface.setEnabled(true); surface.update();
near(parseFloat(screen.style.width) / camera.clientWidth * 100, 44.117647, 'LCD width');
near(parseFloat(screen.style.height) / camera.clientHeight * 100, 58.823529, 'LCD height');
near(matrix(screen)[4] / camera.clientWidth * 100, 20.882353, 'LCD left');
near(matrix(screen)[5] / camera.clientHeight * 100, 26.666667, 'LCD top');
assert.equal(surface.blocksScreenEvent({ type: 'click', detail: 1, target: screen,
  clientX: matrix(screen)[4] + parseFloat(screen.style.width) / 2,
  clientY: matrix(screen)[5] + parseFloat(screen.style.height) / 2 }), false, 'LCD receives pointer clicks');
assert.equal(surface.blocksScreenEvent({ type: 'click', detail: 0, target: screen,
  clientX: 0, clientY: 0 }), false, 'keyboard activation has no pointer location');
const covered = cover.getWorldPosition(new THREE.Vector3()).project(view);
assert.equal(surface.blocksScreenEvent({ type: 'pointerdown', target: screen,
  clientX: (covered.x * 1.5 + 1) * camera.clientWidth / 2,
  clientY: (1 - covered.y * 1.5) * camera.clientHeight / 2 }), true, 'geometry blocks click-through into LCD');
cover.position.set(100, 100, 100); cover.updateMatrixWorld(true);

// Check all four corners at multiple rotations and CSS pixel sizes, independent of a fixed
// rear-view percentage layout. The affine matrix must match GPU camera projection exactly.
for (const width of [1001, 1200, 1440, 1920]) {
  camera.clientWidth = width; camera.clientHeight = width * 9 / 16; surface.resize();
  for (const [yaw, pitch] of [[0, 0], [-0.9, 0.2], [0.8, -0.3]]) {
    pivot.rotation.set(pitch, yaw, 0, 'YXZ'); pivot.updateMatrixWorld(true); surface.update();
    const [a, b, c, d, tx, ty] = matrix(screen);
    const w = parseFloat(screen.style.width), h = parseFloat(screen.style.height);
    for (const [localX, localY, cssX, cssY] of [[3, 2.25, 0, 0], [-3, 2.25, w, 0],
      [3, -2.25, 0, h], [-3, -2.25, w, h]]) {
      const ndc = new THREE.Vector3(localX, localY, 0).applyMatrix4(display.matrixWorld).project(view);
      near(a * cssX + c * cssY + tx, (ndc.x * 1.5 + 1) * width / 2, 'projected corner x');
      near(b * cssX + d * cssY + ty, (1 - ndc.y * 1.5) * camera.clientHeight / 2, 'projected corner y');
    }
    assert.equal(screen.inert, false);
  }
}
// Top-plate and hinge-side parts are separate nodes so the site can press, slide and swing them.
for (const name of ['Shutter_Button', 'Movie_Button', 'C1_Button', 'Power_Switch', 'Port_Door', 'Port_Door_Mic',
  'Zoom_Lever', 'Lens_Zoom_Lever', 'Lens_Extension', 'Screen_Hinge']) {
  assert.ok(model.getObjectByName(name), `${name} is its own node`);
}
// A projected top-plate target only shows when the top faces the visitor, and sits on its part.
const shutterTarget = element();
const shutterNode = model.getObjectByName('Shutter_Button');
surface.addControl(shutterTarget, shutterNode, { size: 0.84 });
pivot.rotation.set(0, 0, 0, 'XYZ'); pivot.updateMatrixWorld(true); surface.update();
assert.equal(shutterTarget.inert, true, 'shutter target is inert from the rear');
pivot.rotation.set(-1.05, 0, 0, 'XYZ'); pivot.updateMatrixWorld(true); surface.update();
assert.equal(shutterTarget.inert, false, 'shutter target works with the top tilted toward the visitor');
{
  const [a, b, c, d, tx, ty] = matrix(shutterTarget);
  const w = parseFloat(shutterTarget.style.width);
  const centre = shutterNode.getWorldPosition(new THREE.Vector3()).project(view);
  near((a + c) * w / 2 + tx, (centre.x * 1.5 + 1) * camera.clientWidth / 2, 'shutter target centre x');
}
// Swung out to face the front, the LCD content stays upright (read from the opposite corner).
const hinge = model.getObjectByName('Screen_Hinge'), hingeRest = hinge.quaternion.clone();
hinge.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -176 * Math.PI / 180));
pivot.rotation.set(0, Math.PI, 0, 'XYZ'); pivot.updateMatrixWorld(true); surface.update();
assert.equal(screen.inert, false, 'flipped-out LCD faces the visitor');
assert.ok(matrix(screen)[3] > 0 && matrix(screen)[0] > 0, 'flipped-out LCD content is upright, not mirrored');
hinge.quaternion.copy(hingeRest);
pivot.rotation.set(0, 0, 0); pivot.updateMatrixWorld(true); surface.update();

pivot.rotation.y = Math.PI; pivot.updateMatrixWorld(true); surface.update();
for (const e of elements.values()) if (e !== elements.get('.controls')) assert.equal(e.inert, true, 'rear-facing targets are inert');
assert.equal(screen.style.visibility, 'hidden');
surface.setEnabled(false);
assert.equal(classes.has('camera-embedded'), false);
for (const e of elements.values()) if (e !== elements.get('.controls')) {
  assert.equal(e.inert, false); assert.equal(e.restored, e.original);
}
pivot.rotation.set(0, 0, 0); pivot.updateMatrixWorld(true);
surface.setEnabled(true); surface.update();
assert.equal(screen.inert, false, 'desktop can be restored after mobile/context fallback');
assert.equal(display.material.opacity, 0); assert.equal(display.material.blending, THREE.NoBlending);
surface.dispose();
assert.equal(display.material.opacity, 1, 'disposing restores the original LCD material');
console.log('PASS: printed legends, top/side parts, projected top targets, flipped-out LCD, cap parenting/presses, fixed wheel words, asset budgets, LCD projection at 12 size/rotation combinations, depth hit testing, keyboard and fallback restoration.');
