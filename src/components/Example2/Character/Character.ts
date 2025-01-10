import {
  ArcRotateCamera,
  CharacterSupportedState,
  CharacterSurfaceInfo,
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
  SPEED,
  START_POSITION,
} from "./constants";
import { MovementDirectionController } from "./MovementDirectionController/MovementDirectionController";
import { KeyboardController } from "./KeyboardController/KeyboardController";

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

export class Character {
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly mesh: Mesh;
  private readonly keyboardController: KeyboardController;
  private readonly movementDirectionController: MovementDirectionController;
  private readonly physicsCharacterController: PhysicsCharacterController;
  private whatsToJump: boolean;

  constructor({ scene, camera }: IProps) {
    this.scene = scene;
    this.camera = camera;
    this.mesh = this.createMesh();
    this.keyboardController = new KeyboardController({
      scene,
      handlers: { Space: this.handleJump },
    });
    this.movementDirectionController = new MovementDirectionController({
      scene,
      camera,
    });
    this.physicsCharacterController = this.createPhysicsCharacterController();
    this.whatsToJump = false;
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
    const { scene, handleAfterPhysics } = this;
    scene.onAfterPhysicsObservable.add(handleAfterPhysics);
  }

  private getVelocity(
    deltaTime: number,
    characterSurfaceInfo: CharacterSurfaceInfo
  ) {
    const { movementDirectionController, physicsCharacterController } = this;
    const movementDirectionVector =
      movementDirectionController.getMovementDirectionVector();
    const currentVelocity = physicsCharacterController.getVelocity();
    const isGrounded =
      characterSurfaceInfo.supportedState == CharacterSupportedState.SUPPORTED;

    const velocity = movementDirectionVector.scale(SPEED);

    const result = physicsCharacterController.calculateMovement(
      deltaTime,
      movementDirectionVector,
      new Vector3(0, 1, 0),
      currentVelocity,
      Vector3.ZeroReadOnly,
      velocity,
      new Vector3(0, 1, 0)
    );

    if (isGrounded && this.whatsToJump) {
      this.whatsToJump = false;
      result.y = 40;
    }

    if (
      !isGrounded ||
      (isGrounded && !this.whatsToJump && currentVelocity.y > 0)
    ) {
      result.y = currentVelocity.y - 1;
    }

    return result;
  }

  handleAfterPhysics = () => {
    const { scene, physicsCharacterController, mesh } = this;
    if (scene.deltaTime == undefined) return;
    const deltaTime = scene.deltaTime / 1000.0;
    if (deltaTime == 0) return;

    const down = new Vector3(0, -1, 0);
    const characterSurfaceInfo = physicsCharacterController.checkSupport(
      deltaTime,
      down
    );

    physicsCharacterController.setVelocity(
      this.getVelocity(deltaTime, characterSurfaceInfo)
    );
    physicsCharacterController.integrate(
      deltaTime,
      characterSurfaceInfo,
      CHARACTER_GRAVITY
    );
    const newPosition = physicsCharacterController.getPosition();
    mesh.position = newPosition;
  };

  handleJump = () => {
    this.whatsToJump = true;
  };
}
