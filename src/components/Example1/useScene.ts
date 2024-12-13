import { useEffect, useRef } from "react";
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  FreeCamera,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import { Character } from "./Character/Character";

export const useScene = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    const scene = (() => {
      // Creates a basic Babylon Scene object
      const scene = new Scene(engine);
      // Creates and positions a free camera
      const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
      // Targets the camera to scene origin
      camera.setTarget(Vector3.Zero());
      // Attaches the camera to the canvas
      camera.attachControl(canvas, true);
      // Creates a light, aiming 0,1,0
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      // Dim the light a small amount 0 - 1
      light.intensity = 0.7;
      // Built-in 'sphere' shape.

      const character = new Character({
        scene,
      });

      // Пол (земля).
      const ground = MeshBuilder.CreateGround(
        "ground",
        { width: 60, height: 60 },
        scene
      );
      const groundMaterial = new StandardMaterial("groundMaterial", scene);
      groundMaterial.diffuseColor = Color3.FromHexString("#97ae3b");
      ground.material = groundMaterial;

      return scene;
    })();

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
