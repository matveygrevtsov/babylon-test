import { Vector3 } from "@babylonjs/core";

export const CAPSULE_HEIGHT = 1.8;
export const CAPSULE_RADIUS = 0.6;

export const START_POSITION = new Vector3(0, CAPSULE_HEIGHT / 2, -2);

export const GRAVITATIONAL_ACCELERATION = 9.8;

export const CHARACTER_GRAVITY = new Vector3(0, -GRAVITATIONAL_ACCELERATION, 0);

export const SPEED = 5;
