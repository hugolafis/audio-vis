import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Viewer {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private readonly scene: THREE.Scene;

  private readonly canvasSize: THREE.Vector2;
  private readonly renderSize: THREE.Vector2;

  private readonly meshVis: THREE.Points;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly canvas: HTMLCanvasElement,
    //private readonly audioContext: AudioContext,
  ) {
    this.canvasSize = new THREE.Vector2();
    this.renderSize = new THREE.Vector2();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight);
    this.camera.position.set(1, 1, 1);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0, 0);

    const sun = new THREE.DirectionalLight(undefined, Math.PI); // undo physically correct changes
    sun.position.copy(new THREE.Vector3(0.75, 1, 0.5).normalize());
    const ambient = new THREE.AmbientLight(undefined, 0.25);
    this.scene.add(sun);
    this.scene.add(ambient);

    this.meshVis = createVisMesh();

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhysicalMaterial());
    //this.scene.add(mesh);

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

      this.camera.aspect = this.renderSize.x / this.renderSize.y;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.scene, this.camera);
  };
}

function createVisMesh(): THREE.Points {
  const axisPointCount = 127;

  const vertexArray = new Float32Array(axisPointCount * axisPointCount * 3);
  const normalisation = 1 / axisPointCount;
  const vector = new THREE.Vector3();
  for (let y = 0; y < axisPointCount; y++) {
    for (let x = 0; x < axisPointCount; x++) {
      const xNormalised = x * normalisation - 0.5;
      const yNormalised = y * normalisation - 0.5;
      vector.set(xNormalised, 0, yNormalised);

      const index = y * axisPointCount + x;
      vector.toArray(vertexArray, index * 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  const positionAttrib = new THREE.Float32BufferAttribute(vertexArray, 3);
  geometry.setAttribute('position', positionAttrib);

  const material = new THREE.PointsMaterial({ color: 0x00aacc, size: 2.5, sizeAttenuation: false });

  return new THREE.Points(geometry, material);
}
