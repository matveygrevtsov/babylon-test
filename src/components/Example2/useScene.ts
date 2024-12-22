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
import { Body, Box, Cylinder, Quaternion, Vec3 } from "cannon-es";

const mapCannonQuaternionToBabylonRotationVector = (
  quaternion: Quaternion
): Vector3 => {
  const { x, y, z, w } = quaternion;

  const rotationX = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
  const rotationY = Math.asin(2 * (w * y - z * x));
  const rotationZ = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));

  return new Vector3(rotationX, rotationY, rotationZ);
};

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
      scene
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

    // Создаем капсулу
    const capsuleHeight = 2;
    const capsuleRadius = 0.5;
    const capsule = MeshBuilder.CreateCapsule(
      "capsule",
      { radius: capsuleRadius, height: capsuleHeight },
      scene
    );

    // Создаем физическое тело для капсулы
    const capsuleBody = new Body({
      mass: 1,
      position: new Vec3(0, 5, 0),
      fixedRotation: true,
    });
    capsuleBody.addShape(
      new Cylinder(capsuleRadius, capsuleRadius, capsuleHeight, 8)
    );
    physicsPlugin.world.addBody(capsuleBody);

    // Создаем куб
    const box = MeshBuilder.CreateBox("box", { size: CUBE_SIZE }, scene);

    // Добавляем физику к кубу
    const boxBody = new Body({
      mass: 1,
      position: new Vec3(0.75 * CUBE_SIZE, CUBE_SIZE / 2, 0.75 * CUBE_SIZE),
    });
    const boxShape = new Box(
      new Vec3(CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2)
    );
    boxBody.addShape(boxShape);
    physicsPlugin.world.addBody(boxBody);

    // Пол (земля).
    const ground = MeshBuilder.CreateBox(
      "box",
      { width: GROUND_WIDTH, height: GROUND_HEIGHT, depth: GROUND_DEPTH },
      scene
    );
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = Color3.FromHexString("#97ae3b");
    ground.material = groundMaterial;

    // Добавляем физику к полу
    const groundBody = new Body({
      mass: 0,
      position: new Vec3(0, -(GROUND_HEIGHT / 2), 0),
    });
    const groundShape = new Box(
      new Vec3(GROUND_WIDTH / 2, GROUND_HEIGHT / 2, GROUND_DEPTH / 2)
    );
    groundBody.addShape(groundShape);
    physicsPlugin.world.addBody(groundBody);

    // Обновляем позицию кубов в каждом кадре
    scene.onBeforeRenderObservable.add(() => {
      capsule.position.set(
        capsuleBody.position.x,
        capsuleBody.position.y,
        capsuleBody.position.z
      );

      box.position.set(
        boxBody.position.x,
        boxBody.position.y,
        boxBody.position.z
      );

      ground.position.set(
        groundBody.position.x,
        groundBody.position.y,
        groundBody.position.z
      );

      capsule.rotation = mapCannonQuaternionToBabylonRotationVector(
        capsuleBody.quaternion
      );

      box.rotation = mapCannonQuaternionToBabylonRotationVector(
        boxBody.quaternion
      );

      ground.rotation = mapCannonQuaternionToBabylonRotationVector(
        groundBody.quaternion
      );
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
