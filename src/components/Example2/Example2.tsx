import React, { FC } from "react";
import { useScene } from "./useScene";

export const Example2: FC = () => {
  const ref = useScene();
  return <canvas ref={ref} />;
};
