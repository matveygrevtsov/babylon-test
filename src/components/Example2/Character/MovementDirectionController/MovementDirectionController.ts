import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";
import { KeyboardController } from "../KeyboardController/KeyboardController";

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

export class MovementDirectionController {
  private readonly camera: ArcRotateCamera;
  private readonly keyboardController: KeyboardController;

  constructor({ scene, camera }: IProps) {
    this.camera = camera;
    this.keyboardController = new KeyboardController({ scene });
  }

  public getMovementDirectionVector() {
    const { camera, keyboardController } = this;
    const pressedKeyBoardKeys = keyboardController.getPressedKeyboardKeys();

    const movementDirectionVector = Vector3.Zero();

    const cameraDirection = camera.getForwardRay().direction;
    cameraDirection.y = 0;

    // Движение на север.
    if (pressedKeyBoardKeys.has("KeyW") && !pressedKeyBoardKeys.has("KeyS")) {
      movementDirectionVector.addInPlace(cameraDirection);
    }

    // Движение на юг.
    if (pressedKeyBoardKeys.has("KeyS") && !pressedKeyBoardKeys.has("KeyW")) {
      movementDirectionVector.addInPlace(cameraDirection.scale(-1));
    }

    // Движение на восток.
    if (pressedKeyBoardKeys.has("KeyD") && !pressedKeyBoardKeys.has("KeyA")) {
      movementDirectionVector.addInPlace(
        new Vector3(cameraDirection.z, 0, -cameraDirection.x)
      );
    }

    // Движение на запад.
    if (pressedKeyBoardKeys.has("KeyA") && !pressedKeyBoardKeys.has("KeyD")) {
      movementDirectionVector.addInPlace(
        new Vector3(-cameraDirection.z, 0, cameraDirection.x)
      );
    }

    movementDirectionVector.normalize();

    return movementDirectionVector;
  }
}
