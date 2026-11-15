// Live HTML registered to the model's rear surfaces. The orthographic camera makes each
// screen plane an affine transform in CSS pixels, including at browser zoom/device scaling.
// WebGL draws over the LCD through an alpha aperture, so the body supplies real occlusion.
export function attachCameraInterface(THREE, { model, view, camera, canvas, frame, overscan }) {
  const screen = camera.querySelector('.screen-bezel');
  const controls = camera.querySelector('.controls');
  const display = model.getObjectByName('Screen_Display');
  if (!screen || !controls || !display?.isMesh) throw new Error('Camera LCD contract is missing.');

  model.updateMatrixWorld(true);
  view.updateMatrixWorld(true);
  const position = display.geometry.attributes.position;
  const corners = [];
  for (let i = 0; i < position.count; i++) {
    const local = new THREE.Vector3().fromBufferAttribute(position, i);
    const projected = local.clone().applyMatrix4(display.matrixWorld).project(view);
    if (!corners.some(c => c.local.distanceToSquared(local) < 1e-10)) corners.push({ local, projected });
  }
  // Find the three corners in the initial rear view; the model's UVs run the other way.
  if (corners.length !== 4) throw new Error('The LCD must be a rectangular quad.');
  corners.sort((a, b) => b.projected.y - a.projected.y);
  const top = corners.slice(0, 2).sort((a, b) => a.projected.x - b.projected.x);
  const bottom = corners.slice(2).sort((a, b) => a.projected.x - b.projected.x);
  const screenCorners = [top[0].local, top[1].local, bottom[0].local];
  const worldWidth = screenCorners[0].clone().applyMatrix4(display.matrixWorld)
    .distanceTo(screenCorners[1].clone().applyMatrix4(display.matrixWorld));
  const worldHeight = screenCorners[0].clone().applyMatrix4(display.matrixWorld)
    .distanceTo(screenCorners[2].clone().applyMatrix4(display.matrixWorld));

  const records = [];
  const remember = element => ({ element, style: element.getAttribute('style'), inert: element.inert });
  records.push({ ...remember(screen), node: display, corners: screenCorners,
    normal: new THREE.Vector3(0, 0, -1),
    dimensions: width => [width * worldWidth / frame.width, width * worldHeight / frame.width] });

  for (const [selector, name, fraction] of [
    ['#menu-toggle', 'Menu_Button', 0.0441],
    ['.hardware-playback', 'Playback_Button', 0.0412],
    ['#previous', 'Fn_Button', 0.0471],
    ['#next', 'Delete_Button', 0.0412],
    ['.dial', 'Control_Wheel', 0.1985],
  ]) {
    const element = camera.querySelector(selector), node = model.getObjectByName(name);
    if (!element || !node?.isMesh) throw new Error(`Missing camera control: ${name}`);
    node.geometry.computeBoundingBox();
    records.push({ ...remember(element), node, fraction,
      normal: new THREE.Vector3(0, 1, 0),
      face: node.geometry.boundingBox.max.y + 0.005,
      scale: new THREE.Vector3().setFromMatrixScale(node.matrixWorld).x });
  }

  // An opaque draw with blending disabled writes zero alpha into the screen aperture. Its
  // depth still participates, so closer bezel/body geometry covers the DOM behind the canvas.
  const originalMaterial = display.material;
  const aperture = new THREE.MeshBasicMaterial({ color: 0, opacity: 0, blending: THREE.NoBlending,
    depthWrite: true, side: THREE.FrontSide, toneMapped: false });
  display.material = aperture;

  const normal = new THREE.Vector3();
  const eye = new THREE.Vector3();
  const point = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const rayMeshes = [];
  model.traverse(o => { if (o.isMesh && o.visible && !o.name.startsWith('Label_')) rayMeshes.push(o); });
  let enabled = false;
  let width = 0, height = 0;
  let facing = true;

  function resize() {
    width = camera.clientWidth; height = camera.clientHeight;
    if (!enabled || !width || !height) return;
    for (const record of records) {
      const f = Array.isArray(record.fraction) ? record.fraction : [record.fraction, record.fraction];
      const [w, h] = record.dimensions ? record.dimensions(width) : f.map(x => Math.max(x * width, 44));
      record.width = w; record.height = h;
      record.element.style.width = `${w}px`; record.element.style.height = `${h}px`;
      if (!record.dimensions) {
        const hw = w / width * frame.width / record.scale / 2;
        const hh = h / width * frame.width / record.scale / 2;
        // Control-local +Y points out of the face, +Z is up, +X is viewer-left.
        record.corners = [new THREE.Vector3(hw, record.face, hh),
          new THREE.Vector3(-hw, record.face, hh), new THREE.Vector3(hw, record.face, -hh)];
      }
    }
  }

  function setEnabled(value) {
    if (enabled === value) return;
    enabled = value;
    camera.classList.toggle('camera-embedded', value);
    if (value) resize();
    else {
      for (const record of records) {
        if (record.style === null) record.element.removeAttribute('style');
        else record.element.setAttribute('style', record.style);
        record.element.inert = record.inert;
      }
      screen.style.removeProperty('--lcd-glare');
    }
  }

  function project(local, node) {
    point.copy(local).applyMatrix4(node.matrixWorld).project(view);
    return { x: (point.x * overscan + 1) * width / 2,
      y: (1 - point.y * overscan) * height / 2 };
  }

  function update() {
    if (!enabled || !width || !height) return;
    // The display's outward normal is -Z; matrixWorld includes the body's turn and hinge.
    normal.set(0, 0, -1).transformDirection(display.matrixWorld);
    view.getWorldDirection(eye).negate();
    const incidence = normal.dot(eye);
    facing = incidence > 0.08;
    for (const record of records) {
      let [a, b, c] = record.corners.map(p => project(p, record.node));
      if (record === records[0] && c.y < a.y) {
        // The screen has been swung or flipped upside down: read it from the opposite corner
        // (a half turn in its own plane), the way the camera flips its picture.
        const d = { x: b.x + c.x - a.x, y: b.y + c.y - a.y };
        [a, b, c] = [d, c, b];
      }
      const visible = normal.copy(record.normal).transformDirection(record.node.matrixWorld).dot(eye) > 0.08
        && (!record.when || record.when());
      record.element.style.transform = `matrix(${(b.x - a.x) / record.width},${(b.y - a.y) / record.width},${(c.x - a.x) / record.height},${(c.y - a.y) / record.height},${a.x},${a.y})`;
      record.element.style.visibility = visible ? 'visible' : 'hidden';
      record.element.inert = !visible;
    }
    screen.style.setProperty('--lcd-glare', (0.025 + (1 - Math.max(0, incidence)) * 0.07).toFixed(3));
  }

  // CSS hit-testing cannot see GPU depth. Reject interaction through an occluding piece of
  // the model, using the same view/overscan as the visible aperture. Labels are non-occluders.
  function blocksScreenEvent(event) {
    if (!enabled || !screen.contains(event.target)) return false;
    // Keyboard activation has no pointer coordinates and must keep its native action.
    if (event.type === 'click' && event.detail === 0) return false;
    if (!facing) return true;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1,
      1 - (event.clientY - rect.top) / rect.height * 2);
    raycaster.setFromCamera(pointer, view);
    const hit = raycaster.intersectObjects(rayMeshes, false)[0];
    return hit?.object !== display;
  }

  // Extra targets on other faces (top plate, hinge side). node may be a mesh (its local +Y is
  // the outward face, as for the rear buttons) or an anchor Object3D placed on the surface.
  // size is the target's diameter in the node's local units; when() can hide it (closed door).
  function addControl(element, node, { size, when, face } = {}) {
    node.updateMatrixWorld(true);
    let top = face;
    if (top === undefined && node.isMesh) { node.geometry.computeBoundingBox(); top = node.geometry.boundingBox.max.y + 0.005; }
    const scale = new THREE.Vector3().setFromMatrixScale(node.matrixWorld).x;
    const record = { ...remember(element), node, when, face: top || 0, scale,
      fraction: Array.isArray(size) ? size.map(s => s * scale / frame.width) : size * scale / frame.width, normal: new THREE.Vector3(0, 1, 0) };
    records.push(record);
    if (enabled) { resize(); update(); }
    return record;
  }

  return { resize, setEnabled, update, blocksScreenEvent, addControl,
    dispose() { setEnabled(false); display.material = originalMaterial; aperture.dispose(); } };
}
