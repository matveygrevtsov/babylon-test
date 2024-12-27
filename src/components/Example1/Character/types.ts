import { TGetObjectValues } from "../../../types";
import { ANIMAIONS, KEYBOARD_KEYS } from "./constants";

export type TKeyboardKeys = TGetObjectValues<typeof KEYBOARD_KEYS>;

export type TAnimation = TGetObjectValues<typeof ANIMAIONS>;
