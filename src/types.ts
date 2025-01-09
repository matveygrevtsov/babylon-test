import { ReactNode } from "react";
import { KEYBOARD_KEYS } from "./constants";

export type TGetObjectValues<T extends object> = T[keyof T];

export interface IRoute {
  title: string;
  pathname: string;
  element: ReactNode;
}

export type TKeyboardKeys = TGetObjectValues<typeof KEYBOARD_KEYS>;
