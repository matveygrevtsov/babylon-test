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
      const scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.FreeCamera(
        "camera1",
        new BABYLON.Vector3(0, 5, -10),
        scene
      );

      camera.setTarget(BABYLON.Vector3.Zero());

      camera.attachControl(canvas, false);

      new BABYLON.HemisphericLight(
        "light1",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );

      const sphere = BABYLON.Mesh.CreateSphere(
        "sphere1",
        16,
        2,
        scene,
        false,
        BABYLON.Mesh.FRONTSIDE
      );

      sphere.position.y = 1;

      BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene, false);
      // Return the created scene
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
