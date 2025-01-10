// https://doc.babylonjs.com/features/featuresDeepDive/physics/havokPlugin
// https://www.npmjs.com/package/@babylonjs/havok
// https://doc.babylonjs.com/features/featuresDeepDive/physics/usingPhysicsEngine/
import {
  ArcRotateCamera,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  Vector3,
  PhysicsViewer,
  PhysicsBody,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { Character } from "../Character/Character";

interface IProps {
  canvas: HTMLCanvasElement;
}

export class CanvasController {
  private readonly canvas: HTMLCanvasElement;
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;

  constructor({ canvas }: IProps) {
    this.canvas = canvas;
    this.engine = this.createEngine();
    this.scene = new Scene(this.engine);
    this.camera = this.createCamera();
  }

  public async start() {
    this.initLight();
    await this.initPhysics();
    this.fillScene();
    this.showPhysics();
    this.initEventListeners();
    this.engine.runRenderLoop(this.render);
  }

  public unmount() {
    const { engine, scene, resize, render } = this;
    window.removeEventListener("resize", resize);
    engine.stopRenderLoop(render);
    scene.dispose();
    engine.dispose();
  }

  private initEventListeners() {
    window.addEventListener("resize", this.resize);
  }

  private createEngine() {
    const { canvas } = this;
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    return engine;
  }

  private createCamera() {
    const { scene, canvas } = this;
    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 4,
      15,
      Vector3.Zero(),
      scene,
    );
    camera.attachControl(canvas, true);
    return camera;
  }

  private initLight() {
    const { scene } = this;
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
  }

  private async initPhysics() {
    const { scene } = this;
    const havokInstance = await HavokPhysics();
    const hk = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.8, 0), hk);
  }

  private showPhysics() {
    const { scene } = this;
    const physicsViewer = new PhysicsViewer();
    for (const mesh of scene.rootNodes) {
      if ("physicsBody" in mesh && mesh.physicsBody) {
        const physicsBody = mesh.physicsBody as PhysicsBody;
        physicsViewer.showBody(physicsBody);
      }
    }
  }

  private fillScene() {
    this.initGround();
    this.initBox();
    this.initCharacter();
  }

  private initGround() {
    const { scene } = this;
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene,
    );
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
  }

  private initBox() {
    const { scene } = this;
    const size = 2;
    const box = MeshBuilder.CreateBox("box", { size }, scene);
    box.position.x = 0;
    box.position.y = size / 2;
    box.position.z = 0;
    new PhysicsAggregate(
      box,
      PhysicsShapeType.BOX,
      { mass: 20, restitution: 0.75 },
      scene,
    );
  }

  private initCharacter() {
    const { scene, camera } = this;
    new Character({ scene, camera });
  }

  render = () => {
    this.scene.render();
  };

  resize = () => {
    this.engine.resize();
  };
}
