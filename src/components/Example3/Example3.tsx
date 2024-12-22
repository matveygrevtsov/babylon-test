import React, { FC } from "react";
import { useScene } from "./useScene";

export const Example3: FC = () => {
  const ref = useScene();
  return <canvas ref={ref} />;
};
