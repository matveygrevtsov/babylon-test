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
  private sphere?: Mesh;

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
      this.engine.runRenderLoop(this.render);
      this.showPhysics();
    });
  }

  public unmount() {
    this.engine.stopRenderLoop(this.render);
    this.scene.dispose();
    this.engine.dispose();
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
    this.initSphereGeometry();
  }

  private initGroundGeometry() {
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      this.scene,
    );
    this.ground = ground;
  }

  private initSphereGeometry() {
    const sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      this.scene,
    );
    sphere.position.y = 4;
    this.sphere = sphere;
  }

  private async initPhysics() {
    const havokInstance = await HavokPhysics();
    const hk = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(new Vector3(0, -9.8, 0), hk);
    this.initGroundPhysics();
    this.initSpherePhysics();
  }

  private initGroundPhysics() {
    const { ground, scene } = this;
    if (!ground) return;

    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
  }

  private initSpherePhysics() {
    const { sphere, scene } = this;
    if (!sphere) return;

    new PhysicsAggregate(
      sphere,
      PhysicsShapeType.SPHERE,
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
