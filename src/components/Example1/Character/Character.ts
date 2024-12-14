import {
  AbstractMesh,
  AnimationGroup,
  ArcRotateCamera,
  KeyboardInfo,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { TGetObjectValues } from "../../../types";
import { ANIMAIONS, KEYBOARD_KEYS } from "./constants";
import { KeyboardEventTypes, Vector2 } from "babylonjs";
import { TKeyboardKeys } from "./types";

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

// Ось Z смотрит против нас, ось X - вправо, а ось Y - вверх.

export class Character {
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly pressedKeyBoardKeys: Set<TKeyboardKeys>;
  private mesh?: AbstractMesh;
  private animations?: AnimationGroup[];
  private cameraDirectionVector?: Vector2;
  private movementDirectionVector?: Vector2;

  constructor({ scene, camera }: IProps) {
    this.scene = scene;
    this.camera = camera;
    this.pressedKeyBoardKeys = new Set();

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
    ).then(({ meshes, animationGroups }) => {
      this.mesh = meshes[0];
      this.animations = animationGroups;
    });
  }

  private animate(animationName: TGetObjectValues<typeof ANIMAIONS>) {
    this.animations?.forEach((animation) => {
      if (animation.name === animationName) {
        animation.start(true);
      } else {
        animation.stop();
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
    if (!KEYBOARD_KEYS[key]) return;

    const { pressedKeyBoardKeys } = this;
    if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
      pressedKeyBoardKeys.add(key);
    } else {
      pressedKeyBoardKeys.delete(key);
    }

    if (
      pressedKeyBoardKeys.has("KeyW") ||
      pressedKeyBoardKeys.has("KeyS") ||
      pressedKeyBoardKeys.has("KeyD") ||
      pressedKeyBoardKeys.has("KeyA")
    ) {
      this.animate("Run");
    } else {
      this.animate("Idle");
    }
  }

  private handleSceneTick() {
    this.refreshCameraDirectionVector();
    this.refreshMovementDirectionVector();

    const { mesh, movementDirectionVector, scene, camera } = this;
    if (!mesh || !movementDirectionVector || !camera) return;

    const delta = ((scene.deltaTime ?? 0) / 1000) * 4;

    const movementDirectionVector3 = new Vector3(
      movementDirectionVector.x,
      0,
      movementDirectionVector.y
    );

    const positionIncrease = movementDirectionVector3.scale(delta);

    mesh.position.addInPlace(positionIncrease);
    camera.position.addInPlace(positionIncrease);
    camera.setTarget(mesh.position);

    mesh.lookAt(mesh.position.subtract(movementDirectionVector3));
  }

  private refreshCameraDirectionVector() {
    const { camera, mesh } = this;
    if (!mesh) return;
    const cameraVector2 = new Vector2(camera.position.x, camera.position.z);
    const targetVector2 = new Vector2(mesh.position.x, mesh.position.z);

    const cameraDirectionVector = targetVector2.subtract(cameraVector2);

    if (this.cameraDirectionVector) {
      this.cameraDirectionVector.copyFrom(cameraDirectionVector);
    } else {
      this.cameraDirectionVector = cameraDirectionVector;
    }
  }

  private refreshMovementDirectionVector() {
    this.refreshCameraDirectionVector();
    const { cameraDirectionVector, pressedKeyBoardKeys } = this;
    if (!cameraDirectionVector) return;

    if (this.movementDirectionVector) {
      this.movementDirectionVector.copyFrom(new Vector2(0, 0));
    } else {
      this.movementDirectionVector = new Vector2(0, 0);
    }

    // Движение на север.
    if (pressedKeyBoardKeys.has("KeyW")) {
      this.movementDirectionVector.addInPlace(cameraDirectionVector);
    }

    // Движение на юг.
    if (pressedKeyBoardKeys.has("KeyS")) {
      this.movementDirectionVector.addInPlace(cameraDirectionVector.scale(-1));
    }

    // Движение на восток.
    if (pressedKeyBoardKeys.has("KeyD")) {
      this.movementDirectionVector.addInPlace(
        new Vector2(cameraDirectionVector.y, -cameraDirectionVector.x)
      );
    }

    // Движение на запад.
    if (pressedKeyBoardKeys.has("KeyA")) {
      this.movementDirectionVector.addInPlace(
        new Vector2(-cameraDirectionVector.y, cameraDirectionVector.x)
      );
    }

    this.movementDirectionVector.normalize();
  }
}
