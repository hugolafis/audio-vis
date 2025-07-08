import { lerp } from 'three/src/math/MathUtils';
import { Viewer } from './classes/Viewer';
import './style.css';
import * as THREE from 'three';

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
const clock = new THREE.Clock();

const input = document.getElementById('audioInput');

export const fftSize = 64;

if (!canvas) {
  throw new Error('Canvas not found!');
}

if (!input) {
  throw new Error('Input not found!');
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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const viewer = new Viewer(renderer, canvas);

function init() {
  clock.start();

  update();
}

function update() {
  // Calculate delta
  const delta = clock.getDelta();

  analyser.getByteFrequencyData(viewer.audioBuffer);

  // Update the viewer
  viewer.update(delta);

  window.requestAnimationFrame(update);
}

// Audio file selection
const audioContext = new AudioContext();
let audioBufferSourceNode: AudioBufferSourceNode | undefined;
const analyser = audioContext.createAnalyser();
analyser.fftSize = fftSize;
analyser.smoothingTimeConstant = 0.85;

input.addEventListener('change', event => {
  const target = event.target;
  if (!target) return;

  const files = (target as HTMLInputElement).files;
  if (!files) return;

  const file = files[0];
  const fileReader = new FileReader();

  fileReader.onload = event => {
    const arrayBuffer = event.target?.result as ArrayBuffer;

    if (!arrayBuffer) return;

    audioContext.decodeAudioData(arrayBuffer, audioBuffer => {
      // todo move out
      // const analyser = audioContext.createAnalyser();
      // analyser.fftSize = frequencyBinCount;

      if (audioBufferSourceNode) {
        audioBufferSourceNode.stop();
        audioBufferSourceNode = undefined;
      }

      audioBufferSourceNode = audioContext.createBufferSource();
      audioBufferSourceNode.buffer = audioBuffer;
      audioBufferSourceNode.connect(analyser);
      analyser.connect(audioContext.destination);

      audioBufferSourceNode.start();
    });
  };

  fileReader.readAsArrayBuffer(file);
});

init();
