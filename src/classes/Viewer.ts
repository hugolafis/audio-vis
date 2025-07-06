import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import pointsVS from '../shaders/points.vs';
import pointsFS from '../shaders/points.fs';

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
  const axisPointCount = 64;

  const icoSphereGeometry = new THREE.IcosahedronGeometry(1, axisPointCount);

  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: pointsVS,
    fragmentShader: pointsFS,
  });

  return new THREE.Points(icoSphereGeometry, material);
}
