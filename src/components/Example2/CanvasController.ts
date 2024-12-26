import {
  ArcRotateCamera,
  Vector3,
  Engine,
  Scene,
  HemisphericLight,
  MeshBuilder,
  PhysicsImpostor,
  StandardMaterial,
  Color3,
  CannonJSPlugin,
  Mesh,
} from "@babylonjs/core";
import {
  CAMERA_DEFAULT_RADIUS,
  CAMERA_MAX_RADIUS,
  CAMERA_MIN_RADIUS,
  CUBE_SIZE,
  GROUND_DEPTH,
  GROUND_HEIGHT,
  GROUND_WIDTH,
} from "./constants";
import { Inspector } from "@babylonjs/inspector";

interface IProps {
  canvas: HTMLCanvasElement;
}

export class CanvasController {
  private readonly canvas: HTMLCanvasElement;
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly render: () => void;
  private readonly resize: () => void;
  private capsule?: Mesh;

  constructor({ canvas }: IProps) {
    this.canvas = canvas;

    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this.scene = new Scene(this.engine);

    this.render = () => {
      this.scene.render();
    };

    this.resize = () => {
      this.engine.resize();
    };

    this.fillScene();
    this.initEventListeners();
    this.start();
  }

  public unmount() {
    window.removeEventListener("resize", this.resize);

    // Останавливаем рендеринг
    this.engine.stopRenderLoop(this.render);

    // Освобождаем ресурсы
    this.scene.dispose();
    this.engine.dispose();
  }

  private initEventListeners() {
    window.addEventListener("resize", this.resize);

    this.scene.onBeforeRenderObservable.add(() => {
      this.capsule?.physicsImpostor?.setAngularVelocity(new Vector3(0, 0, 0));
    });
  }

  private start() {
    this.engine.runRenderLoop(this.render);
  }

  private fillScene() {
    this.initCamera();
    this.initLight();
    this.initPhysics();
    this.initGround();
    this.initBox();
    this.initCapsule();
    this.showDevTools();
  }

  private initCamera() {
    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 4,
      CAMERA_DEFAULT_RADIUS,
      Vector3.Zero(),
      this.scene,
    );

    camera.lowerRadiusLimit = CAMERA_MIN_RADIUS;
    camera.upperRadiusLimit = CAMERA_MAX_RADIUS;

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

  private initPhysics() {
    const gravity = new Vector3(0, -9.81, 0);
    const physicsPlugin = new CannonJSPlugin();
    this.scene.enablePhysics(gravity, physicsPlugin);
  }

  private initGround() {
    const { scene } = this;

    const ground = MeshBuilder.CreateBox(
      "box",
      { width: GROUND_WIDTH, height: GROUND_HEIGHT, depth: GROUND_DEPTH },
      scene,
    );
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = Color3.FromHexString("#97ae3b");
    ground.material = groundMaterial;
    const groundPhysicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
      },
      scene,
    );
    ground.physicsImpostor = groundPhysicsImpostor;
    ground.position.y = -GROUND_HEIGHT / 2;
  }

  private initBox() {
    const { scene } = this;

    const box = MeshBuilder.CreateBox(
      "box",
      {
        size: CUBE_SIZE,
      },
      scene,
    );
    const boxPhysicsImpostor = new PhysicsImpostor(
      box,
      PhysicsImpostor.BoxImpostor,
      { mass: 1 },
      scene,
    );
    box.physicsImpostor = boxPhysicsImpostor;
    box.position.x = CUBE_SIZE / 2;
    box.position.y = CUBE_SIZE / 2;
    box.position.z = CUBE_SIZE / 2;
  }

  private initCapsule() {
    const { scene } = this;

    // Создаем составной объект
    const capsule = new Mesh("compoundMesh", scene);

    // Верхняя сфера
    const sphereTop = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1 },
      scene,
    );
    sphereTop.position.y = 5;
    sphereTop.parent = capsule;
    const sphereTopPhysicsImpostor = new PhysicsImpostor(
      sphereTop,
      PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      scene,
    );
    sphereTop.physicsImpostor = sphereTopPhysicsImpostor;

    // Цилиндр
    const cylinder = MeshBuilder.CreateCylinder(
      "cylinder",
      {
        diameter: 1, // Диаметр основания
        height: 2, // Высота цилиндра
        tessellation: 16, // Количество сегментов (для сглаживания)
      },
      scene,
    );
    cylinder.position.y = 4;
    cylinder.parent = capsule;
    const cylinderPhysicsImpostor = new PhysicsImpostor(
      cylinder,
      PhysicsImpostor.CylinderImpostor,
      { mass: 1 },
      scene,
    );
    cylinder.physicsImpostor = cylinderPhysicsImpostor;

    // Нижняя сфера
    const sphereBottom = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1 },
      scene,
    );
    sphereBottom.position.y = 3;
    sphereBottom.parent = capsule;
    const sphereBottomPhysicsImpostor = new PhysicsImpostor(
      sphereBottom,
      PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      scene,
    );
    sphereBottom.physicsImpostor = sphereBottomPhysicsImpostor;

    const compoundMeshPhysicsImpostor = new PhysicsImpostor(
      capsule,
      PhysicsImpostor.NoImpostor,
      { mass: 1 },
      scene,
    );
    capsule.physicsImpostor = compoundMeshPhysicsImpostor;

    this.capsule = capsule;
  }

  private showDevTools() {
    Inspector.Show(this.scene, {});
  }
}
