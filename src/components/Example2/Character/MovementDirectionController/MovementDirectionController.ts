import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";
import { KeyboardController } from "../KeyboardController/KeyboardController";

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

export class MovementDirectionController {
  private readonly camera: ArcRotateCamera;
  private readonly keyboardController: KeyboardController;
  private readonly movementDirectionVector: Vector3;

  constructor({ scene, camera }: IProps) {
    this.camera = camera;
    this.keyboardController = new KeyboardController({ scene });
    this.movementDirectionVector = Vector3.Zero();
  }

  public getMovementDirectionVector() {
    this.refreshMovementDirectionVector();
    return this.movementDirectionVector;
  }

  private refreshMovementDirectionVector() {
    const { camera, keyboardController } = this;
    const pressedKeyBoardKeys = keyboardController.getPressedKeyboardKeys();

    this.movementDirectionVector.copyFrom(Vector3.Zero());

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
        new Vector3(cameraDirection.z, 0, -cameraDirection.x)
      );
    }

    // Движение на запад.
    if (pressedKeyBoardKeys.has("KeyA") && !pressedKeyBoardKeys.has("KeyD")) {
      this.movementDirectionVector.addInPlace(
        new Vector3(-cameraDirection.z, 0, cameraDirection.x)
      );
    }

    this.movementDirectionVector.normalize();
  }
}
