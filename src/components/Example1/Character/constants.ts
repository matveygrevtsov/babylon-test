import { IMovementVector, TPressedKeyBoardKeysRecord } from "./types";

export const ANIMAIONS = {
  Idle: "Idle",
  Death: "Death",
  Gun_Shoot: "Gun_Shoot",
  HitRecieve: "HitRecieve",
  HitRecieve_2: "HitRecieve_2",
  Idle_Gun: "Idle_Gun",
  Idle_Gun_Pointing: "Idle_Gun_Pointing",
  Idle_Gun_Shoot: "Idle_Gun_Shoot",
  Idle_Neutral: "Idle_Neutral",
  Idle_Sword: "Idle_Sword",
  Interact: "Interact",
  Kick_Left: "Kick_Left",
  Kick_Right: "Kick_Right",
  Punch_Left: "Punch_Left",
  Punch_Right: "Punch_Right",
  Roll: "Roll",
  Run: "Run",
  Run_Back: "Run_Back",
  Run_Left: "Run_Left",
  Run_Right: "Run_Right",
  Run_Shoot: "Run_Shoot",
  Sword_Slash: "Sword_Slash",
  Walk: "Walk",
  Wave: "Wave",
} as const;

export const KEYBOARD_KEYS = {
  KeyW: "KeyW",
  KeyA: "KeyA",
  KeyS: "KeyS",
  KeyD: "KeyD",
  Space: "Space",
} as const;

export const INITIAL_PRESSED_KEYBOARD_KEYS_RECORD = (() => {
  const result = {} as TPressedKeyBoardKeysRecord;
  Object.values(KEYBOARD_KEYS).forEach((key) => {
    result[key] = false;
  });
  return result;
})();

export const INITIAL_MOVEMENT_VECTOR: IMovementVector = {
  forward: 0,
  right: 0,
};
