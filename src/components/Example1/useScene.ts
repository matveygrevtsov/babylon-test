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
} from "@babylonjs/core";
import { Character } from "./Character/Character";

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
    // Creates and positions a free camera
    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 4,
      5,
      Vector3.Zero(),
      scene,
    );

    camera.lowerRadiusLimit = 5; // минимальный радиус
    camera.upperRadiusLimit = 15; // максимальный радиус

    // Attaches the camera to the canvas
    camera.attachControl(canvas, true);
    // Creates a light, aiming 0,1,0
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    // Dim the light a small amount 0 - 1
    light.intensity = 0.7;
    // Built-in 'sphere' shape.

    new Character({
      scene,
      camera,
    });

    const cube = MeshBuilder.CreateBox("cube", { size: 1 }, scene);
    cube.position.y = 0.5;
    cube.position.z = 5; // Позиция куба
    cube.checkCollisions = true;

    // Пол (земля).
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6 },
      scene,
    );
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = Color3.FromHexString("#97ae3b");
    ground.material = groundMaterial;

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
