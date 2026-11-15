import { copyFile, mkdir } from 'node:fs/promises';

const source = new URL('../node_modules/three/', import.meta.url);
const output = new URL('../site/vendor/three/', import.meta.url);
const files = [
  ['build/three.module.min.js', 'three.module.min.js'],
  ['examples/jsm/loaders/GLTFLoader.js', 'addons/loaders/GLTFLoader.js'],
  ['examples/jsm/utils/BufferGeometryUtils.js', 'addons/utils/BufferGeometryUtils.js'],
  ['LICENSE', 'LICENSE'],
];

for (const [from, to] of files) {
  const destination = new URL(to, output);
  await mkdir(new URL('.', destination), { recursive: true });
  await copyFile(new URL(from, source), destination);
}
