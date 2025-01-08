import {
  MeshBuilder,
  PhysicsCharacterController,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { CAPSULE_HEIGHT, CAPSULE_RADIUS } from "./constants";

interface IProps {
  scene: Scene;
}

export class Character {
  private readonly scene: Scene;

  constructor({ scene }: IProps) {
    this.scene = scene;
    this.init();
  }

  private init() {
    const { scene } = this;

    const characterGravity = new Vector3(0, -18, 0);
    const position = new Vector3(0, CAPSULE_HEIGHT / 2, -2);
    const capsule = MeshBuilder.CreateCapsule(
      "CharacterDisplay",
      { height: CAPSULE_HEIGHT, radius: CAPSULE_RADIUS },
      scene
    );
    capsule.position = position;
    const characterController = new PhysicsCharacterController(
      position,
      { capsuleHeight: CAPSULE_HEIGHT, capsuleRadius: CAPSULE_RADIUS },
      scene
    );

    scene.onAfterPhysicsObservable.add((_) => {
      if (scene.deltaTime == undefined) return;
      const dt = scene.deltaTime / 1000.0;
      if (dt == 0) return;

      const down = new Vector3(0, -1, 0);
      const support = characterController.checkSupport(dt, down);

      // Quaternion.FromEulerAnglesToRef(
      //   0,
      //   camera.rotation.y,
      //   0,
      //   characterOrientation
      // );

      characterController.setVelocity(new Vector3(0, 0, 1));
      characterController.integrate(dt, support, characterGravity);
      const newPosition = characterController.getPosition();
      capsule.position = newPosition;
    });
  }
}
