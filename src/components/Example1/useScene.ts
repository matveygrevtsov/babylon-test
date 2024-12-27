import { useEffect, useRef } from "react";
import { CanvasController } from "./CanvasController";

export const useScene = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const canvasController = new CanvasController({ canvas });
    canvasController.start();
    return () => {
      canvasController.unmount();
    };
  }, []);

  return ref;
};
