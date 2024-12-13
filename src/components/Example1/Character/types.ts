import { TGetObjectValues } from "../../../types";
import { KEYBOARD_KEYS } from "./constants";

export type TKeyboardKeys = TGetObjectValues<typeof KEYBOARD_KEYS>;

export type TPressedKeyBoardKeysRecord = Record<TKeyboardKeys, boolean>;
