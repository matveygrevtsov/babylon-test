import { useEffect, useRef } from "react";
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  ArcRotateCamera,
  CannonJSPlugin,
  PhysicsViewer,
  PhysicsImpostor,
  Mesh,
} from "@babylonjs/core";

const CUBE_SIZE = 1;

const GROUND_WIDTH = 6; // X
const GROUND_HEIGHT = 0.1; // Y
const GROUND_DEPTH = 6; // Z

export const useScene = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    // Creates a basic Babylon Scene object
    const scene = new Scene(engine);

    // Создаем физический мир с помощью Cannon.js
    const gravity = new Vector3(0, -9.81, 0);
    const physicsPlugin = new CannonJSPlugin();
    scene.enablePhysics(gravity, physicsPlugin);

    // Creates and positions a free camera
    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 4,
      15,
      Vector3.Zero(),
      scene,
    );

    camera.lowerRadiusLimit = 15; // минимальный радиус
    camera.upperRadiusLimit = 15; // максимальный радиус

    // Attaches the camera to the canvas
    camera.attachControl(canvas, true);
    // Creates a light, aiming 0,1,0
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    // Dim the light a small amount 0 - 1
    light.intensity = 0.7;
    // Built-in 'sphere' shape.

    // Создаем куб
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

    // Создаем составной объект
    const compoundMesh = new Mesh("compoundMesh", scene);

    // Верхняя сфера
    const sphereTop = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1 },
      scene,
    );
    sphereTop.position.y = 5;
    sphereTop.parent = compoundMesh;
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
    cylinder.parent = compoundMesh;
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
    sphereBottom.parent = compoundMesh;
    const sphereBottomPhysicsImpostor = new PhysicsImpostor(
      sphereBottom,
      PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      scene,
    );
    sphereBottom.physicsImpostor = sphereBottomPhysicsImpostor;

    const compoundMeshPhysicsImpostor = new PhysicsImpostor(
      compoundMesh,
      PhysicsImpostor.NoImpostor,
      { mass: 1 },
      scene,
    );
    compoundMesh.physicsImpostor = compoundMeshPhysicsImpostor;

    // Создаём пол.
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

    const physicsViewer = new PhysicsViewer();
    physicsViewer.showImpostor(boxPhysicsImpostor);
    physicsViewer.showImpostor(groundPhysicsImpostor);
    physicsViewer.showImpostor(sphereBottomPhysicsImpostor);

    scene.onBeforeRenderObservable.add(() => {
      compoundMeshPhysicsImpostor.setAngularVelocity(new Vector3(0, 0, 0));
    });

    const render = () => {
      scene.render();
    };

    engine.runRenderLoop(render);

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      // Останавливаем рендеринг
      engine.stopRenderLoop(render);

      // Освобождаем ресурсы
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return ref;
};
