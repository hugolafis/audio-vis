import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import pointsVS from '../shaders/points.vs';
import pointsFS from '../shaders/points.fs';
import { frequencyBinCount } from '../script';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import barVS from '../shaders/bar.vs';
import barFS from '../shaders/bar.fs';

export class Viewer {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private readonly scene: THREE.Scene;

  private readonly canvasSize: THREE.Vector2;
  private readonly renderSize: THREE.Vector2;

  private readonly meshVis: THREE.Mesh;
  readonly audioBuffer = new Uint8Array(frequencyBinCount);

  private readonly renderTarget: THREE.WebGLRenderTarget;
  private readonly bloomPass: UnrealBloomPass;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly canvas: HTMLCanvasElement,
    //private readonly audioContext: AudioContext,
  ) {
    this.canvasSize = new THREE.Vector2();
    this.renderSize = new THREE.Vector2();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight);
    this.camera.position.set(0, 0, 1);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0, 0);

    const sun = new THREE.DirectionalLight(undefined, Math.PI); // undo physically correct changes
    sun.position.copy(new THREE.Vector3(0.75, 1, 0.5).normalize());
    const ambient = new THREE.AmbientLight(undefined, 0.25);
    this.scene.add(sun);
    this.scene.add(ambient);

    this.meshVis = createVisMesh(this.audioBuffer);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhysicalMaterial());
    //this.scene.add(mesh);

    this.renderTarget = new THREE.WebGLRenderTarget(1, 1, { format: THREE.RGBAFormat });
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1, 0.15, 0.35);
    this.bloomPass.renderToScreen = true;

    this.scene.add(this.meshVis);
  }

  readonly update = (dt: number) => {
    this.controls.update();

    // Do we need to resize the renderer?
    this.canvasSize.set(
      Math.floor(this.canvas.parentElement!.clientWidth),
      Math.floor(this.canvas.parentElement!.clientHeight),
    );
    if (!this.renderSize.equals(this.canvasSize)) {
      this.renderSize.copy(this.canvasSize);
      this.renderer.setSize(this.renderSize.x, this.renderSize.y, false);
      this.renderTarget.setSize(this.renderSize.x, this.renderSize.y);
      this.bloomPass.setSize(this.renderSize.x, this.renderSize.y);

      this.camera.aspect = this.renderSize.x / this.renderSize.y;
      this.camera.updateProjectionMatrix();
    }

    //this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    //this.bloomPass.render(this.renderer, undefined as any, this.renderTarget, 0, false);
  };
}

function generateFibonacciDiscPoints(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399...

  for (let i = 0; i < count; i++) {
    const r = 0.5 * Math.sqrt((i + 0.5) / count); // sqrt for area-proportional radius
    const theta = i * goldenAngle;

    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);

    points.push(new THREE.Vector3(x, y, 0));
  }

  return points;
}

function createVisMesh(buffer: Uint8Array): THREE.Mesh {
  const barVertexCount = 4; // 4 vertices per ba
  const barTriangleCount = 2; // 2 triangles per bar

  const totalVertices = buffer.length * barVertexCount;
  const positions = new Float32Array(totalVertices * 3); // 3 floats per vertex
  const bufferIds = new Uint8Array(totalVertices); // one entry per vertex
  const indices = new Uint32Array(buffer.length * barTriangleCount * 3);

  const scaling = 1.0 / buffer.length;

  const position = new THREE.Vector3();
  for (let i = 0; i < buffer.length; i++) {
    const stride = i * barVertexCount;
    bufferIds.fill(i, stride, stride + barVertexCount); // inclusive

    const t = i / (buffer.length - 1);

    // Vertices
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const vertexIndex = stride + y * 2 + x;
        position.set(x, y, 0); // 0 : 1
        position.x *= scaling;
        position.x += i * scaling;

        position.multiplyScalar(2).subScalar(1); // -1 : 1
        position.z = 0;
        position.toArray(positions, vertexIndex * 3);
      }
    }
  }

  let indexOffset = 0;
  for (let i = 0; i < buffer.length; i++) {
    const stride = i * 4; // 4 vertices per bar

    indices[indexOffset++] = stride + 0;
    indices[indexOffset++] = stride + 2;
    indices[indexOffset++] = stride + 1;

    indices[indexOffset++] = stride + 2;
    indices[indexOffset++] = stride + 3;
    indices[indexOffset++] = stride + 1;
  }

  const positionAttrib = new THREE.BufferAttribute(positions, 3);
  const bufferIndexAttrib = new THREE.BufferAttribute(bufferIds, 1); // normalise
  bufferIndexAttrib.gpuType = THREE.IntType;

  const indexAttrib = new THREE.BufferAttribute(indices, 1);

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indexAttrib);
  geometry.setAttribute('position', positionAttrib);
  geometry.setAttribute('bufferIndex', bufferIndexAttrib);

  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: barVS,
    fragmentShader: barFS,
    uniforms: {
      bufferData: { value: buffer },
    },
    defines: {
      NUM_BARS: buffer.length,
    },
    wireframe: true,
  });

  return new THREE.Mesh(geometry, material);
}

// todo redo this as a rect that gets transformed in the shader
// function createVisMesh(buffer: Uint8Array): THREE.Points {
//   const axisPointCount = 64;

//   const points = generateFibonacciDiscPoints(4096);
//   //const icoSphereGeometry = new THREE.IcosahedronGeometry(1, axisPointCount);
//   const geometry = new THREE.BufferGeometry().setFromPoints(points);
//   const material = new THREE.ShaderMaterial({
//     glslVersion: THREE.GLSL3,
//     vertexShader: pointsVS,
//     fragmentShader: pointsFS,
//     uniforms: {
//       bufferData: { value: buffer },
//     },
//   });

//   return new THREE.Points(geometry, material);
// }
