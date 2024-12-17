import {
  AbstractMesh,
  AnimationGroup,
  ArcRotateCamera,
  KeyboardInfo,
  Mesh,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { TGetObjectValues } from "../../../types";
import { ANIMAIONS, KEYBOARD_KEYS } from "./constants";
import { KeyboardEventTypes } from "babylonjs";
import { TKeyboardKeys } from "./types";

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

// Ось Z смотрит против нас, ось X - вправо, а ось Y - вверх.

export class Character {
  private readonly scene: Scene;
  private readonly pressedKeyBoardKeys: Set<TKeyboardKeys>;
  private readonly camera: ArcRotateCamera;
  private readonly cameraTarget: Mesh;

  private mesh?: AbstractMesh;
  private animations?: AnimationGroup[];
  private movementDirectionVector?: Vector3;

  constructor({ scene, camera }: IProps) {
    this.scene = scene;
    this.pressedKeyBoardKeys = new Set();

    this.camera = camera;
    this.cameraTarget = new Mesh("cameraTarget", scene);
    this.camera.setTarget(this.cameraTarget);

    SceneLoader.ImportMeshAsync(
      null,
      "assets/",
      "Adventurer.gltf",
      this.scene,
    ).then(({ meshes, animationGroups }) => {
      this.mesh = meshes[0];
      this.mesh.checkCollisions = true;
      this.animations = animationGroups;
      this.addListeners();
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
  }

  private handleSceneTick() {
    this.refreshMovementDirectionVector();
    this.refreshAnimation();
    this.refreshRotation();
    this.refreshPosition();
  }

  private refreshMovementDirectionVector() {
    const { camera, pressedKeyBoardKeys } = this;

    if (this.movementDirectionVector) {
      this.movementDirectionVector.copyFrom(Vector3.Zero());
    } else {
      this.movementDirectionVector = Vector3.Zero();
    }

    const cameraDirection = camera.getForwardRay().direction;
    cameraDirection.y = 0;

    // Движение на север.
    if (pressedKeyBoardKeys.has("KeyW") && !pressedKeyBoardKeys.has("KeyS")) {
      this.movementDirectionVector.addInPlace(cameraDirection);
    }

    // Движение на юг.
    if (pressedKeyBoardKeys.has("KeyS") && !pressedKeyBoardKeys.has("KeyW")) {
      this.movementDirectionVector.addInPlace(cameraDirection.scale(-1));
    }

    // Движение на восток.
    if (pressedKeyBoardKeys.has("KeyD") && !pressedKeyBoardKeys.has("KeyA")) {
      this.movementDirectionVector.addInPlace(
        new Vector3(cameraDirection.z, 0, -cameraDirection.x),
      );
    }

    // Движение на запад.
    if (pressedKeyBoardKeys.has("KeyA") && !pressedKeyBoardKeys.has("KeyD")) {
      this.movementDirectionVector.addInPlace(
        new Vector3(-cameraDirection.z, 0, cameraDirection.x),
      );
    }

    this.movementDirectionVector.normalize();
  }

  private refreshAnimation() {
    this.animate(this.movementDirectionVector?.length() ? "Run" : "Idle");
  }

  private refreshRotation() {
    const { movementDirectionVector, mesh } = this;
    if (!movementDirectionVector?.length() || !mesh) return;
    mesh.lookAt(mesh.position.subtract(movementDirectionVector));
  }

  private refreshCameraTargetPosition() {
    const { mesh, cameraTarget } = this;
    if (!mesh) return;
    const { x, z } = mesh.position;
    cameraTarget.position.set(x, 2, z);
  }

  private refreshPosition() {
    const { mesh, movementDirectionVector, scene, camera } = this;
    if (!mesh || !movementDirectionVector || !camera) return;
    const delta = ((scene.deltaTime ?? 0) / 1000) * 4;
    mesh.moveWithCollisions(movementDirectionVector.scale(delta));
    this.refreshCameraTargetPosition();
  }
}
