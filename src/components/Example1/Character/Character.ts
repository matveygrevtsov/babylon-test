import {
  ArcRotateCamera,
  KeyboardEventTypes,
  KeyboardInfo,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { TKeyboardKeys } from "./types";
import { KEYBOARD_KEYS } from "./constants";

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

export class Character {
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly cameraTarget: Mesh;
  private readonly pressedKeyBoardKeys: Set<TKeyboardKeys>;

  private capsule?: Mesh;
  private physicsAggregate?: PhysicsAggregate;

  private movementDirectionVector?: Vector3;

  constructor({ scene, camera }: IProps) {
    this.scene = scene;

    this.camera = camera;

    this.cameraTarget = new Mesh("cameraTarget", scene);
    this.camera.setTarget(this.cameraTarget);

    this.pressedKeyBoardKeys = new Set();

    this.initCapsule();

    this.addEventListeners();
  }

  private initCapsule() {
    const capsule = MeshBuilder.CreateCapsule(
      "capsule",
      {
        height: 3, // Высота капсулы
        radius: 0.5, // Радиус капсулы
        tessellation: 16, // Количество сегментов для сглаживания
      },
      this.scene,
    );
    capsule.isVisible = false;
    capsule.position.y = 1.5;
    const physicsAggregate = new PhysicsAggregate(
      capsule,
      PhysicsShapeType.CAPSULE,
      { mass: 1, restitution: 0, friction: 0 },
      this.scene,
    );

    physicsAggregate.body.setMassProperties({ inertia: new Vector3(0, 0, 0) }); // Чтобы объект мог перемещаться, но не мог поворачиваться.

    this.capsule = capsule;
    this.physicsAggregate = physicsAggregate;
  }

  private addEventListeners() {
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

      if (key === "Space") {
        this.jump();
      }
    } else {
      pressedKeyBoardKeys.delete(key);
    }
  }

  private handleSceneTick() {
    this.refreshMovementDirectionVector();
    this.refreshRotation();
    this.refreshPosition();
    console.log(this.physicsAggregate?.body.getLinearVelocity().y);
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

  private refreshRotation() {
    const { movementDirectionVector, capsule } = this;
    if (!movementDirectionVector?.length() || !capsule) return;
    capsule.lookAt(capsule.position.subtract(movementDirectionVector));
  }

  private refreshCameraTargetPosition() {
    const { capsule, cameraTarget } = this;
    if (!capsule) return;
    const { x, y, z } = capsule.position;
    cameraTarget.position.set(x, y + 2, z);
  }

  private jump() {
    const { physicsAggregate } = this;
    if (!physicsAggregate) return;
    const currentLinearVelocity = physicsAggregate.body.getLinearVelocity();
    const jumpVector = new Vector3(0, 7, 0);
    physicsAggregate.body.setLinearVelocity(
      currentLinearVelocity.add(jumpVector),
    );
  }

  private refreshPosition() {
    const { movementDirectionVector, scene, physicsAggregate } = this;
    if (!movementDirectionVector || !physicsAggregate) return;
    const delta = ((scene.deltaTime ?? 0) / 1000) * 400;
    const movementVector = movementDirectionVector.scale(delta);
    const currentLinearVelocity = physicsAggregate.body.getLinearVelocity();
    const linearVelocityX = movementVector.x;
    const linearVelocityY = currentLinearVelocity.y;
    const linearVelocityZ = movementVector.z;
    const linearVelocity = new Vector3(
      linearVelocityX,
      linearVelocityY,
      linearVelocityZ,
    );
    physicsAggregate.body.setLinearVelocity(linearVelocity);
    this.refreshCameraTargetPosition();
  }
}
