import React from "react";
import { useScene } from "./useScene";
import { Canvas, Root } from "./styles";

export const Scene = () => {
  const ref = useScene();

  return (
    <Root>
      <Canvas ref={ref} />
    </Root>
  );
};
