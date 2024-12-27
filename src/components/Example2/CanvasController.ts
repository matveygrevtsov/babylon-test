// https://doc.babylonjs.com/features/featuresDeepDive/physics/havokPlugin
// https://www.npmjs.com/package/@babylonjs/havok
// https://doc.babylonjs.com/features/featuresDeepDive/physics/usingPhysicsEngine/
import {
  ArcRotateCamera,
  Engine,
  GroundMesh,
  HavokPlugin,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  Vector3,
  PhysicsViewer,
  PhysicsBody,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";

interface IProps {
  canvas: HTMLCanvasElement;
}

export class CanvasController {
  private readonly canvas: HTMLCanvasElement;
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly render: () => void;
  // Объекты на сцене:
  private ground?: GroundMesh;
  private box?: Mesh;
  private capsule?: Mesh;

  constructor({ canvas }: IProps) {
    this.canvas = canvas;

    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });

    this.scene = new Scene(this.engine);

    this.render = () => {
      this.scene.render();
    };
  }

  public start() {
    this.initCamera();
    this.initLight();
    this.initGeometry();
    this.initPhysics().then(() => {
      this.initEventListeners();
      this.engine.runRenderLoop(this.render);
      this.showPhysics();
    });
  }

  public unmount() {
    this.engine.stopRenderLoop(this.render);
    this.scene.dispose();
    this.engine.dispose();
  }

  private initEventListeners() {
    this.scene.onBeforeRenderObservable.add(() => {
      this.capsule?.physicsBody?.setAngularVelocity(Vector3.Zero());
    });
  }

  private initCamera() {
    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 4,
      15,
      Vector3.Zero(),
      this.scene,
    );

    camera.attachControl(this.canvas, true);
  }

  private initLight() {
    const light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene,
    );
    light.intensity = 0.7;
  }

  private initGeometry() {
    this.initGroundGeometry();
    this.initBoxGeometry();
    this.initCapsuleGeometry();
  }

  private initGroundGeometry() {
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      this.scene,
    );
    this.ground = ground;
  }

  private initBoxGeometry() {
    const size = 2;
    const box = MeshBuilder.CreateBox("box", { size }, this.scene);
    box.position.x = size / 2;
    box.position.y = size / 2;
    box.position.z = size / 2;
    this.box = box;
  }

  private initCapsuleGeometry() {
    const capsule = MeshBuilder.CreateCapsule(
      "capsule",
      {
        height: 3, // Высота капсулы
        radius: 0.5, // Радиус капсулы
        tessellation: 16, // Количество сегментов для сглаживания
      },
      this.scene,
    );
    capsule.position.y = 5;
    this.capsule = capsule;
  }

  private async initPhysics() {
    const havokInstance = await HavokPhysics();
    const hk = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(new Vector3(0, -9.8, 0), hk);
    this.initGroundPhysics();
    this.initBoxPhysics();
    this.initCapsulePhysics();
  }

  private initGroundPhysics() {
    const { ground, scene } = this;
    if (!ground) return;

    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
  }

  private initBoxPhysics() {
    const { box, scene } = this;
    if (!box) return;

    new PhysicsAggregate(
      box,
      PhysicsShapeType.BOX,
      { mass: 1, restitution: 0.75 },
      scene,
    );
  }

  private initCapsulePhysics() {
    const { capsule, scene } = this;
    if (!capsule) return;

    new PhysicsAggregate(
      capsule,
      PhysicsShapeType.CAPSULE,
      { mass: 1, restitution: 0.75 },
      scene,
    );
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
}
