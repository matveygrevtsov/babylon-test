import React, { FC } from "react";
import { useScene } from "./useScene";

export const Example1: FC = () => {
  const ref = useScene();
  return <canvas ref={ref} />;
};
