import { useEffect, useRef } from "react";
import * as BABYLON from "babylonjs";

export const useScene = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    const scene = (() => {
      // Creates a basic Babylon Scene object
      const scene = new BABYLON.Scene(engine);
      // Creates and positions a free camera
      const camera = new BABYLON.FreeCamera(
        "camera1",
        new BABYLON.Vector3(0, 5, -10),
        scene,
      );
      // Targets the camera to scene origin
      camera.setTarget(BABYLON.Vector3.Zero());
      // Attaches the camera to the canvas
      camera.attachControl(canvas, true);
      // Creates a light, aiming 0,1,0
      const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene,
      );
      // Dim the light a small amount 0 - 1
      light.intensity = 0.7;
      // Built-in 'sphere' shape.
      BABYLON.SceneLoader.ImportMeshAsync(
        "semi_house",
        "https://assets.babylonjs.com/meshes/",
        "both_houses_scene.babylon",
        scene,
      ).then((result) => {
        const [root] = result.meshes;
        root.rotate(new BABYLON.Vector3(0, 1, 0), 45);
      });
      // Пол (земля).
      BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 6, height: 6 },
        scene,
      );
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
