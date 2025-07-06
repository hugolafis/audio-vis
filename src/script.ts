import { lerp } from 'three/src/math/MathUtils';
import { Viewer } from './classes/Viewer';
import './style.css';
import * as THREE from 'three';

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
const clock = new THREE.Clock();

if (!canvas) {
  throw new Error('Canvas not found!');
}

/**
 * Renderer
 */
THREE.ColorManagement.enabled = true;
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true, // MSAA
});
renderer.setPixelRatio(1); // for DPI scaling set to window.devicePixelRatio
renderer.setSize(1, 1, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1.0;

const audioContext = new AudioContext();

// todo replace with fetch
let elapsed = 0;
const frequency = 300; // Hz
const audioBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
  const channelData = audioBuffer.getChannelData(channel);
  for (let i = 0; i < audioContext.sampleRate; i++) {
    const t = Math.sin((2 * Math.PI * frequency * i) / audioContext.sampleRate);
    channelData[i] = lerp(-1, 1, t);
  }
}

const source = audioContext.createBufferSource();
source.buffer = audioBuffer;

source.connect(audioContext.destination);

const button = document.createElement('button');
button.innerHTML = 'TEST';
button.style.position = 'absolute';
button.onclick = () => {
  source.start();
};

document.body.prepend(button);

const viewer = new Viewer(renderer, canvas);

function init() {
  clock.start();

  update();
}

function update() {
  // Calculate delta
  const delta = clock.getDelta();

  // Update the viewer
  viewer.update(delta);

  window.requestAnimationFrame(update);
}

init();
