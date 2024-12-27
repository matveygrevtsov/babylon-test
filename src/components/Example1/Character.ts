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

interface IProps {
  scene: Scene;
  camera: ArcRotateCamera;
}

export class Character {
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;

  constructor({ scene, camera }: IProps) {
    this.scene = scene;
    this.camera = camera;
  }
}
