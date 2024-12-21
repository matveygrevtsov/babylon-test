import { ReactNode } from "react";

export type TGetObjectValues<T extends object> = T[keyof T];

export interface IRoute {
  title: string;
  pathname: string;
  element: ReactNode;
}
