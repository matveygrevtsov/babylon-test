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
} from "@babylonjs/core";
import { Body, Box, Quaternion, Vec3 } from "cannon-es";

const mapCannonQuaternionToBabylonRotationVector = (
  quaternion: Quaternion,
): Vector3 => {
  const { x, y, z, w } = quaternion;

  const rotationX = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
  const rotationY = Math.asin(2 * (w * y - z * x));
  const rotationZ = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));

  return new Vector3(rotationX, rotationY, rotationZ);
};

const CUBE_SIZE = 1;
const GROUND_SIZE = 6;

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

    // Создаем куб№1
    const box1 = MeshBuilder.CreateBox("box", { size: CUBE_SIZE }, scene);

    // Добавляем физику к кубу№1
    const boxBody1 = new Body({
      mass: 1,
      position: new Vec3(0, 6, 0),
    });
    const boxShape1 = new Box(
      new Vec3(CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2),
    );
    boxBody1.addShape(boxShape1);
    physicsPlugin.world.addBody(boxBody1);

    // Создаем куб№2
    const box2 = MeshBuilder.CreateBox("box", { size: CUBE_SIZE }, scene);

    // Добавляем физику к кубу№2
    const boxBody2 = new Body({
      mass: 0,
      position: new Vec3(
        (0.75 * CUBE_SIZE) / 2,
        CUBE_SIZE / 2,
        0.75 * CUBE_SIZE,
      ),
    });
    const boxShape2 = new Box(
      new Vec3(CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2),
    );
    boxBody2.addShape(boxShape2);
    physicsPlugin.world.addBody(boxBody2);

    // Пол (земля).
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: GROUND_SIZE, height: GROUND_SIZE },
      scene,
    );
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = Color3.FromHexString("#97ae3b");
    ground.material = groundMaterial;

    // Добавляем физику к полу
    const groundBody = new Body({
      mass: 0,
      position: new Vec3(0, 0, 0),
    });
    const groundShape = new Box(new Vec3(GROUND_SIZE / 2, 0, GROUND_SIZE / 2));
    groundBody.addShape(groundShape);
    physicsPlugin.world.addBody(groundBody);

    // Обновляем позицию кубов в каждом кадре
    scene.onBeforeRenderObservable.add(() => {
      box1.position.set(
        boxBody1.position.x,
        boxBody1.position.y,
        boxBody1.position.z,
      );

      box2.position.set(
        boxBody2.position.x,
        boxBody2.position.y,
        boxBody2.position.z,
      );

      ground.position.set(
        groundBody.position.x,
        groundBody.position.y,
        groundBody.position.z,
      );

      box1.rotation = mapCannonQuaternionToBabylonRotationVector(
        boxBody1.quaternion,
      );

      box2.rotation = mapCannonQuaternionToBabylonRotationVector(
        boxBody2.quaternion,
      );

      ground.rotation = mapCannonQuaternionToBabylonRotationVector(
        groundBody.quaternion,
      );

      // box2.position.set(
      //   boxBody2.position.x,
      //   boxBody2.position.y,
      //   boxBody2.position.z
      // );
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return ref;
};
