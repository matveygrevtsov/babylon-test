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
import { Character } from "./Character/Character";

interface IProps {
  canvas: HTMLCanvasElement;
}

export class CanvasController {
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly render: () => void;
  private readonly resize: () => void;

  constructor({ canvas }: IProps) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });

    this.scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 4,
      15,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(canvas, true);
    this.camera = camera;

    this.render = () => {
      this.scene.render();
    };

    this.resize = () => {
      this.engine.resize();
    };
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
    window.removeEventListener("resize", this.resize);

    this.engine.stopRenderLoop(this.render);
    this.scene.dispose();
    this.engine.dispose();
  }

  private initEventListeners() {
    window.addEventListener("resize", this.resize);
  }

  private initLight() {
    const light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene
    );
    light.intensity = 0.7;
  }

  private async initPhysics() {
    const havokInstance = await HavokPhysics();
    const hk = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(new Vector3(0, -9.8, 0), hk);
  }

  private showPhysics() {
    const physicsViewer = new PhysicsViewer();
    for (const mesh of this.scene.rootNodes) {
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
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      this.scene
    );
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
  }

  private initBox() {
    const size = 1;
    const box = MeshBuilder.CreateBox("box", { size }, this.scene);
    box.position.y = size / 2;
    box.position.z = 3;
    new PhysicsAggregate(
      box,
      PhysicsShapeType.BOX,
      { mass: 1, restitution: 0.75 },
      this.scene
    );
  }

  private initCharacter() {
    new Character({
      scene: this.scene,
      camera: this.camera,
    });
  }
}
