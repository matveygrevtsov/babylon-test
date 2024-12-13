import {
  ISceneLoaderAsyncResult,
  KeyboardInfo,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { TGetObjectValues } from "../../../types";
import {
  ANIMAIONS,
  INITIAL_MOVEMENT_VECTOR,
  INITIAL_PRESSED_KEYBOARD_KEYS_RECORD,
} from "./constants";
import { KeyboardEventTypes } from "babylonjs";
import {
  IMovementVector,
  TKeyboardKeys,
  TPressedKeyBoardKeysRecord,
} from "./types";

interface IProps {
  scene: Scene;
}

export class Character {
  private readonly scene: Scene;
  private readonly pressedKeyBoardKeysRecord: TPressedKeyBoardKeysRecord;
  private readonly movementVector: IMovementVector;
  private sceneLoaderAsyncResult?: ISceneLoaderAsyncResult;

  constructor({ scene }: IProps) {
    this.scene = scene;
    this.pressedKeyBoardKeysRecord = INITIAL_PRESSED_KEYBOARD_KEYS_RECORD;
    this.movementVector = INITIAL_MOVEMENT_VECTOR;

    this.loadToScene().then(() => {
      this.animate("Idle");
      this.addListeners();
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

  private addListeners() {
    // Данный обработчик срабатывает при нажатии на любую клавишу клавиатуры.
    this.scene.onKeyboardObservable.add((event) => {
      this.handleKeyboardEvent(event);
    });

    // Данный обработчик срабатывает на каждый кадр.
    this.scene.onBeforeRenderObservable.add(() => {
      this.handleSceneTick();
    });
  }

  private handleKeyboardEvent(keyboardInfo: KeyboardInfo) {
    const key = keyboardInfo.event.code as TKeyboardKeys;
    const isKeyDown = keyboardInfo.type === KeyboardEventTypes.KEYDOWN;
    if (typeof this.pressedKeyBoardKeysRecord[key] !== "boolean") return;
    const { sceneLoaderAsyncResult, pressedKeyBoardKeysRecord } = this;
    if (!sceneLoaderAsyncResult) return;
    pressedKeyBoardKeysRecord[key] = isKeyDown;
    const { KeyW, KeyS, KeyD, KeyA } = pressedKeyBoardKeysRecord;
    this.movementVector.forward = Number(KeyW) - Number(KeyS);
    this.movementVector.right = Number(KeyD) - Number(KeyA);

    if (!this.movementVector.forward && !this.movementVector.right) {
      this.animate("Idle");
    } else {
      this.animate("Run");
    }
  }

  private handleSceneTick() {
    const { sceneLoaderAsyncResult } = this;
    if (!sceneLoaderAsyncResult) return;
    const [root] = sceneLoaderAsyncResult.meshes;
    const { forward, right } = this.movementVector;
    const delta = ((this.scene.deltaTime ?? 0) / 1000) * 4;

    root.position.z += delta * forward;
    root.position.x += delta * right;

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
