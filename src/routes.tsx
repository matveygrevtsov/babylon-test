import React from "react";
import { IRoute } from "./types";
import { Example1 } from "./components/Example1/Example1";
import { Example2 } from "./components/Example2/Example2";

export const ROUTES: IRoute[] = [
  {
    title: "Управление персонажем от третьего лица",
    pathname: "*",
    element: <Example1 />,
  },
  {
    title: "Простейшая физика",
    pathname: "/example2",
    element: <Example2 />,
  },
];
