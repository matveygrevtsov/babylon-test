import {
  ISceneLoaderAsyncResult,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { TGetObjectValues } from "../../../types";
import { ANIMAIONS, INITIAL_PRESSED_KEYBOARD_KEYS_RECORD } from "./constants";
import { KeyboardEventTypes } from "babylonjs";
import { TKeyboardKeys, TPressedKeyBoardKeysRecord } from "./types";

interface IProps {
  scene: Scene;
}

export class Character {
  private readonly scene: Scene;
  private readonly pressedKeyBoardKeysRecord: TPressedKeyBoardKeysRecord;
  private sceneLoaderAsyncResult?: ISceneLoaderAsyncResult;

  constructor({ scene }: IProps) {
    this.scene = scene;
    this.pressedKeyBoardKeysRecord = INITIAL_PRESSED_KEYBOARD_KEYS_RECORD;

    this.loadToScene().then(() => {
      this.animate("Idle");
      this.addKeyboardListener();
    });
  }

  private loadToScene() {
    return SceneLoader.ImportMeshAsync(
      null,
      "assets/",
      "Adventurer.gltf",
      this.scene
    ).then((sceneLoaderAsyncResult) => {
      this.sceneLoaderAsyncResult = sceneLoaderAsyncResult;
      const [root] = sceneLoaderAsyncResult.meshes;
      root.rotation = new Vector3(0, Math.PI / 2, 0);
    });
  }

  private animate(animationName: TGetObjectValues<typeof ANIMAIONS>) {
    this.sceneLoaderAsyncResult?.animationGroups.forEach((animationGroup) => {
      if (animationGroup.name === animationName) {
        animationGroup.start(true);
      } else {
        animationGroup.stop();
      }
    });
  }

  private addKeyboardListener() {
    // Данный обработчик срабатывает при нажатии на любую клавишу клавиатуры.
    this.scene.onKeyboardObservable.add((keyboardInfo) => {
      const key = keyboardInfo.event.code as TKeyboardKeys;
      if (typeof this.pressedKeyBoardKeysRecord[key] !== "boolean") return;
      this.handleKeyPress(
        key,
        keyboardInfo.type === KeyboardEventTypes.KEYDOWN
      );
    });

    // Данный обработчик срабатывает на каждый кадр.
    this.scene.onBeforeRenderObservable.add(() => {
      console.log(this.scene.deltaTime / 1000);
    });
  }

  private handleKeyPress(key: TKeyboardKeys, isPressed: boolean) {
    const { sceneLoaderAsyncResult, pressedKeyBoardKeysRecord } = this;
    if (!sceneLoaderAsyncResult) return;
    const [root] = sceneLoaderAsyncResult.meshes;
    pressedKeyBoardKeysRecord[key] = isPressed;
    const { KeyW, KeyS, KeyD, KeyA } = pressedKeyBoardKeysRecord;
    const forward = Number(KeyW) - Number(KeyS);
    const right = Number(KeyD) - Number(KeyA);

    if (!forward && !right) {
      this.animate("Idle");
      return;
    }

    this.animate("Run");

    if (forward === 1 && right === 0) {
      root.rotation = new Vector3(0, Math.PI, 0);
    }

    if (forward === 1 && right === -1) {
      root.rotation = new Vector3(0, 0.75 * Math.PI, 0);
    }

    if (forward === 0 && right === -1) {
      root.rotation = new Vector3(0, 0.5 * Math.PI, 0);
    }

    if (forward === -1 && right === -1) {
      root.rotation = new Vector3(0, 0.25 * Math.PI, 0);
    }

    if (forward === -1 && right === 0) {
      root.rotation = new Vector3(0, 0, 0);
    }

    if (forward === -1 && right === 1) {
      root.rotation = new Vector3(0, 1.75 * Math.PI, 0);
    }

    if (forward === 0 && right === 1) {
      root.rotation = new Vector3(0, 1.5 * Math.PI, 0);
    }

    if (forward === 1 && right === 1) {
      root.rotation = new Vector3(0, 1.25 * Math.PI, 0);
    }
  }
}
