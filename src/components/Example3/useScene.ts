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
} from "@babylonjs/core";

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

    // Создаем куб
    const box = MeshBuilder.CreateBox(
      "box",
      {
        size: CUBE_SIZE,
      },
      scene
    );
    const boxPhysicsImpostor = new PhysicsImpostor(
      box,
      PhysicsImpostor.BoxImpostor,
      { mass: 1 },
      scene
    );
    box.physicsImpostor = boxPhysicsImpostor;
    box.position.y = 5;

    // Пол (земля).
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: GROUND_SIZE, height: GROUND_SIZE },
      scene
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
      scene
    );
    ground.physicsImpostor = groundPhysicsImpostor;

    const physicsViewer = new PhysicsViewer();
    physicsViewer.showImpostor(boxPhysicsImpostor);
    physicsViewer.showImpostor(groundPhysicsImpostor);

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
