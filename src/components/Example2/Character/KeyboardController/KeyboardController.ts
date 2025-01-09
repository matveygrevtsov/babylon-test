import { KeyboardEventTypes, KeyboardInfo, Scene } from "@babylonjs/core";
import { KEYBOARD_KEYS } from "../../../../constants";
import { TKeyboardKeys } from "../../../../types";

interface IProps {
  scene: Scene;
}

export class KeyboardController {
  private readonly pressedKeyBoardKeys: Set<TKeyboardKeys>;

  constructor({ scene }: IProps) {
    this.pressedKeyBoardKeys = new Set<TKeyboardKeys>();
    scene.onKeyboardObservable.add(this.handleKeyboard);
  }

  public getPressedKeyboardKeys() {
    return this.pressedKeyBoardKeys;
  }

  handleKeyboard = (keyboardInfo: KeyboardInfo) => {
    const key = keyboardInfo.event.code as TKeyboardKeys;
    if (!KEYBOARD_KEYS[key]) return;

    const { pressedKeyBoardKeys } = this;
    if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
      pressedKeyBoardKeys.add(key);
    } else {
      pressedKeyBoardKeys.delete(key);
    }
  };
}
