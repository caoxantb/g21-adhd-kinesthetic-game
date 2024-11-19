import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { useGameStore } from "@/stores/game";

import EffectsSystem from "./effects";
import AnimationSystem from "./animation";

import xbot from "@/assets/game/models/michelle.fbx";

import jump from "@/assets/game/sounds/jump.wav";

export default class Player {
  constructor(scene) {
    this.store = new useGameStore();
    this.scene = scene;

    this.currentAnimation = null;
    this.runningAnimation = null;
    this.jumpingAnimation = null;
    this.standingAnimation = null;
    this.tposeAnimation = null;

    this.isJumping = false;

    this.isLevitating = false;
    this.levitationStartTime = 0;
    this.levitationDuration = 3000;
    this.animationSystem = new AnimationSystem(this);

    this.effects = new EffectsSystem(scene);

    this.load();
  }

  async load() {
    this.player = await new FBXLoader().loadAsync(xbot);
    this.player.position.y = 0;
    this.player.position.z = 68;
    this.player.scale.set(0.04, 0.04, 0.04);
    this.player.rotation.y = 180 * (Math.PI / 180);
    this.scene.add(this.player);

    const listener = new THREE.AudioListener();
    this.scene.getObjectByName("camera").add(listener);
    this.sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    const buffer = await audioLoader.loadAsync(jump);
    this.sound.setBuffer(buffer);
    this.sound.setLoop(false);
    this.sound.setVolume(0.5);
    await this.animationSystem.initialize();
  }

  jump() {
    this.animationSystem.playAnimation('jump')
  }

  levitate() {
    this.animationSystem.startLevitation()
  }

  startPose(poseName) {
    this.animationSystem.playAnimation(poseName);
  }

  active(delta) {
    this.animationSystem.update(delta);
  }

  beforeFreeze() {
    this.animationSystem.playAnimation('stand');
  }

  freeze(delta) {
    this.animationSystem.update(delta);
    if (this.animationSystem.isLevitating) {
      this.animationSystem.updateLevitation();
      this.effects.updateEffects('levitating', this.player.position);
    } else if (this.animationSystem.currentAnimationName === 'tpose') {
      this.effects.updateEffects('tpose', this.player.position);
    }
  }

  reset(position) {
    this.player.position.set(position.x, position.y, position.z);
    this.animationSystem.reset();
    this.effects.cleanup();
  }

  cleanup() {
    this.effects.cleanup();
    this.animationSystem.cleanup();
  }

  playJumpSound() {
    this.sound.play();
  }
}
