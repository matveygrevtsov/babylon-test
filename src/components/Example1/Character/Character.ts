import {
  ArcRotateCamera,
  ISceneLoaderAsyncResult,
  KeyboardInfo,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { TGetObjectValues } from "../../../types";
import { ANIMAIONS, INITIAL_PRESSED_KEYBOARD_KEYS_RECORD } from "./constants";
import { KeyboardEventTypes, Vector2 } from "babylonjs";
import { TKeyboardKeys, TPressedKeyBoardKeysRecord } from "./types";

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

// Ось Z смотрит против нас, ось X - вправо, а ось Y - вверх.

export class Character {
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly pressedKeyBoardKeysRecord: TPressedKeyBoardKeysRecord;
  private sceneLoaderAsyncResult?: ISceneLoaderAsyncResult;

  constructor({ scene, camera }: IProps) {
    this.scene = scene;
    this.camera = camera;
    this.pressedKeyBoardKeysRecord = INITIAL_PRESSED_KEYBOARD_KEYS_RECORD;

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
    this.scene.onKeyboardObservable.add((event) =>
      this.handleKeyboardEvent(event)
    );
    // Данный обработчик срабатывает на каждый кадр.
    this.scene.onBeforeRenderObservable.add(() => this.handleSceneTick());
  }

  private handleKeyboardEvent(keyboardInfo: KeyboardInfo) {
    const key = keyboardInfo.event.code as TKeyboardKeys;
    const isKeyDown = keyboardInfo.type === KeyboardEventTypes.KEYDOWN;
    if (typeof this.pressedKeyBoardKeysRecord[key] !== "boolean") return;
    const { sceneLoaderAsyncResult, pressedKeyBoardKeysRecord } = this;
    if (!sceneLoaderAsyncResult) return;
    pressedKeyBoardKeysRecord[key] = isKeyDown;
    if (
      pressedKeyBoardKeysRecord.KeyW ||
      pressedKeyBoardKeysRecord.KeyS ||
      pressedKeyBoardKeysRecord.KeyA ||
      pressedKeyBoardKeysRecord.KeyD
    ) {
      this.animate("Run");
    } else {
      this.animate("Idle");
    }
  }

  private handleSceneTick() {
    const { sceneLoaderAsyncResult, camera, pressedKeyBoardKeysRecord } = this;
    if (!sceneLoaderAsyncResult) return;
    const [root] = sceneLoaderAsyncResult.meshes;

    const normalizedMovementVector = (() => {
      const targetVector2 = new Vector2(root.position.z, root.position.x);
      const cameraVector2 = new Vector2(camera.position.z, camera.position.x);
      const movementVector = targetVector2.subtract(cameraVector2).normalize();
      console.log(movementVector);
      return new Vector3(movementVector.y, 0, movementVector.x);
    })();

    const delta = ((this.scene.deltaTime ?? 0) / 1000) * 4;

    const movementVector = normalizedMovementVector.scale(delta);

    if (pressedKeyBoardKeysRecord.KeyW) {
      root.position.addInPlace(movementVector);
      root.lookAt(root.position.subtract(normalizedMovementVector));
      camera.position.addInPlace(movementVector);
      camera.setTarget(root.position);
    }
  }
}
