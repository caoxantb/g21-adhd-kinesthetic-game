import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { useGameStore } from "@/stores/game";

import xbot from "@/assets/game/models/xbot.fbx";
import running from "@/assets/game/animations/running.fbx";
import jumping from "@/assets/game/animations/jumping.fbx";
import standing from "@/assets/game/animations/standing.fbx";
import stumbling from "@/assets/game/animations/stumbling.fbx";

import jump from "@/assets/game/sounds/jump.wav";

export default class Player {
  constructor(scene) {
    this.store = new useGameStore();
    this.scene = scene;

    this.currentAnimation = null;
    this.runningAnimation = null;
    this.jumpingAnimation = null;
    this.standingAnimation = null;

    this.isJumping = false;

    this.load();
  }

  async load() {
    this.player = await new FBXLoader().loadAsync(xbot);
    this.player.position.y = 0;
    this.player.position.z = 70;
    this.player.scale.set(0.05, 0.05, 0.05);
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

    this.initialize();
  }

  async initialize() {
    const runningAnimationObject = await new FBXLoader().loadAsync(running);
    this.animationMixer = new THREE.AnimationMixer(this.player);
    this.runningAnimation = this.animationMixer.clipAction(
      runningAnimationObject.animations[0],
    );

    const jumpingAnimationObject = await new FBXLoader().loadAsync(jumping);
    this.jumpingAnimation = this.animationMixer.clipAction(
      jumpingAnimationObject.animations[0],
    );

    const standingAnimationObject = await new FBXLoader().loadAsync(standing);
    this.standingAnimation = this.animationMixer.clipAction(
      standingAnimationObject.animations[0],
    );

    this.currentAnimation = this.runningAnimation;
    this.currentAnimation.reset();
    this.currentAnimation.play();
  }

  async jump() {
    if (!this.isJumping) {
      this.playJumpSound();
      this.isJumping = true;
      this.currentAnimation.stop();

      this.currentAnimation = this.jumpingAnimation;
      this.currentAnimation.reset();
      this.currentAnimation.setLoop(1, 1);
      this.currentAnimation.clampWhenFinished = true;
      this.currentAnimation.play();

      this.animationMixer.addEventListener("finished", () => {
        this.currentAnimation
          .crossFadeTo(this.runningAnimation, 0.1, false)
          .play();
        this.currentAnimation = this.runningAnimation;
        this.isJumping = false;
      });
    }
  }

  playJumpSound() {
    this.sound.play();
  }

  active(delta) {
    if (this.animationMixer) {
      this.animationMixer.update(delta);
    }
  }

  beforeFreeze() {
    this.currentAnimation.stop();
    this.currentAnimation = this.standingAnimation;
    this.currentAnimation.reset();
    this.currentAnimation.play();
  }

  freeze(delta) {
    if (this.animationMixer) {
      this.animationMixer.update(delta);
    }
  }
}
