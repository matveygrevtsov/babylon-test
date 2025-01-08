import {
  ArcRotateCamera,
  CharacterSupportedState,
  KeyboardEventTypes,
  KeyboardInfo,
  Mesh,
  MeshBuilder,
  PhysicsCharacterController,
  Scene,
  Vector3,
} from "@babylonjs/core";
import {
  CAPSULE_HEIGHT,
  CAPSULE_RADIUS,
  CHARACTER_GRAVITY,
  KEYBOARD_KEYS,
  SPEED,
  START_POSITION,
} from "./constants";
import { TKeyboardKeys } from "./types";

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

export class Character {
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly mesh: Mesh;
  private readonly physicsCharacterController: PhysicsCharacterController;
  private readonly pressedKeyBoardKeys: Set<TKeyboardKeys>;
  private readonly movementDirectionVector: Vector3;

  constructor({ scene, camera }: IProps) {
    this.scene = scene;
    this.camera = camera;
    this.mesh = this.createMesh();
    this.physicsCharacterController = this.createPhysicsCharacterController();
    this.pressedKeyBoardKeys = new Set<TKeyboardKeys>();
    this.movementDirectionVector = Vector3.Zero();
    this.addListeners();
  }

  private createMesh() {
    const { scene, camera } = this;
    const capsule = MeshBuilder.CreateCapsule(
      "CharacterDisplay",
      { height: CAPSULE_HEIGHT, radius: CAPSULE_RADIUS },
      scene
    );
    camera.setTarget(capsule);
    return capsule;
  }

  private createPhysicsCharacterController() {
    const { scene } = this;
    const physicsCharacterController = new PhysicsCharacterController(
      START_POSITION,
      { capsuleHeight: CAPSULE_HEIGHT, capsuleRadius: CAPSULE_RADIUS },
      scene
    );
    return physicsCharacterController;
  }

  private addListeners() {
    const { scene, handleKeyboard, handleBeforeRender, handleAfterPhysics } =
      this;
    scene.onKeyboardObservable.add(handleKeyboard);
    scene.onBeforeRenderObservable.add(handleBeforeRender);
    scene.onAfterPhysicsObservable.add(handleAfterPhysics);
  }

  private refreshMovementDirectionVector() {
    const { camera, pressedKeyBoardKeys } = this;

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

  // private refreshRotation() {
  //   const { movementDirectionVector, mesh } = this;
  //   if (!movementDirectionVector?.length() || !mesh) return;
  //   mesh.lookAt(mesh.position.subtract(movementDirectionVector));
  // }

  // private refreshPosition() {
  //   const { mesh, movementDirectionVector, scene, camera } = this;
  //   if (!mesh || !movementDirectionVector || !camera) return;
  //   const delta = ((scene.deltaTime ?? 0) / 1000) * 4;
  //   mesh.moveWithCollisions(movementDirectionVector.scale(delta));
  //   this.refreshCameraTargetPosition();
  // }

  handleKeyboard = (keyboardInfo: KeyboardInfo) => {
    const key = keyboardInfo.event.code as TKeyboardKeys;
    if (!KEYBOARD_KEYS[key]) return;

    const { pressedKeyBoardKeys } = this;
    if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
      pressedKeyBoardKeys.add(key);
      if (key === "Space") {
        this.physicsCharacterController.setVelocity(new Vector3(0, 4, 0));
        console.log(1);
      }
    } else {
      pressedKeyBoardKeys.delete(key);
    }
  };

  handleBeforeRender = () => {
    this.refreshMovementDirectionVector();
    // this.refreshRotation();
    // this.refreshPosition();
  };

  handleAfterPhysics = () => {
    const { scene, physicsCharacterController, mesh, movementDirectionVector } =
      this;
    if (scene.deltaTime == undefined) return;
    const deltaTime = scene.deltaTime / 1000.0;
    if (deltaTime == 0) return;

    const down = new Vector3(0, -1, 0);
    const characterSurfaceInfo = physicsCharacterController.checkSupport(
      deltaTime,
      down
    );

    physicsCharacterController.setVelocity(
      movementDirectionVector.scale(SPEED)
    );
    physicsCharacterController.integrate(
      deltaTime,
      characterSurfaceInfo,
      CHARACTER_GRAVITY
    );
    const newPosition = physicsCharacterController.getPosition();
    mesh.position = newPosition;
  };
}
