import { KeyboardEventTypes, KeyboardInfo, Scene } from "@babylonjs/core";
import { KEYBOARD_KEYS } from "../../../../constants";
import { TKeyboardKeys } from "../../../../types";

type THandlers = Partial<Record<TKeyboardKeys, () => void>>;

interface IProps {
  scene: Scene;
  handlers?: THandlers;
}

export class KeyboardController {
  private readonly pressedKeyBoardKeys: Set<TKeyboardKeys>;
  private handlers?: THandlers;

  constructor({ scene, handlers }: IProps) {
    this.pressedKeyBoardKeys = new Set<TKeyboardKeys>();
    this.handlers = handlers;
    scene.onKeyboardObservable.add(this.handleKeyboard);
  }

  public getPressedKeyboardKeys() {
    return this.pressedKeyBoardKeys;
  }

  handleKeyboard = (keyboardInfo: KeyboardInfo) => {
    const key = keyboardInfo.event.code as TKeyboardKeys;
    if (!KEYBOARD_KEYS[key]) return;

    const { pressedKeyBoardKeys, handlers } = this;
    if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
      pressedKeyBoardKeys.add(key);
      handlers?.[key]?.();
    } else {
      pressedKeyBoardKeys.delete(key);
    }
  };
}
