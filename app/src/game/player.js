import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { useGameStore } from "@/stores/game";

import EffectsSystem from "./effects";

import xbot from "@/assets/game/models/michelle.fbx";
import running from "@/assets/game/animations/Running.fbx";
import jumping from "@/assets/game/animations/Jump.fbx";
import standing from "@/assets/game/animations/Idle.fbx";
import tpose from "@/assets/game/animations/T-Pose.fbx";

import jump from "@/assets/game/sounds/jump.wav";

export default class Player {
  constructor(scene) {
    this.store = new useGameStore();
    this.scene = scene;

    this.currentAnimation = null;
    this.runningAnimation = null;
    this.jumpingAnimation = null;
    this.standingAnimation = null;
    this.tposeAnimation = null

    this.isJumping = false;

    this.isLevitating = false;
    this.levitationStartTime = 0;
    this.levitationDuration = 3000;

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

    const tposeAnimationObject = await new FBXLoader().loadAsync(tpose);
    this.tposeAnimation = this.animationMixer.clipAction(
      tposeAnimationObject.animations[0],
    );

    this.currentAnimation = this.runningAnimation;
    this.currentAnimation.reset();
    this.currentAnimation.play();
  }

  startTpose() {
    if (this.currentAnimation && this.tposeAnimation) {
      this.currentAnimation.stop();
      this.currentAnimation = this.tposeAnimation;
      this.currentAnimation.reset();
      this.currentAnimation.play();
      this.effects.startTposeEffects();
    }
  }

  startLevitation() {
    this.isLevitating = true;
    this.levitationStartTime = Date.now();
    this.effects.startLevitationEffects();
  }

  updateLevitation() {
    if (!this.isLevitating) return;
    const elapsed = Date.now() - this.levitationStartTime;
    const progress = Math.min(elapsed / this.levitationDuration, 1);

    // First move up, then forward
    const verticalProgress = progress < 0.3 ? progress / 0.3 : 1;
    const forwardProgress = progress < 0.3 ? 0 : (progress - 0.3) / 0.7;

    // Smooth easing
    const easeVertical = this.easeInOut(verticalProgress);
    const easeForward = this.easeInOut(forwardProgress);

    // Update position
    this.player.position.y = easeVertical * 1.2; // Lift 2 units up
    if (progress > 0.3) {
      this.player.position.z -= easeForward * 3; // Move forward 20 units
    }

    if (progress >= 1) {
      this.isLevitating = false;
      // Reset position after passing the wall
      this.player.position.y = 0;
    }
  }

  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  jump() {
    if (!this.isJumping) {
      this.playJumpSound();
      this.isJumping = true;
      this.currentAnimation.stop();

      this.currentAnimation = this.jumpingAnimation;
      this.currentAnimation.reset();
      this.currentAnimation.setLoop(1, 1);
      this.currentAnimation.clampWhenFinished = true;
      this.currentAnimation.setEffectiveTimeScale(0.8).setEffectiveWeight(1.0)
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
    if (this.currentAnimation && this.currentAnimation === this.standingAnimation) {
      this.currentAnimation
          .crossFadeTo(this.runningAnimation, 0.3, false)
          .play();
        this.currentAnimation = this.runningAnimation;
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
    if (this.isLevitating) {
      this.updateLevitation();
      this.effects.updateEffects('levitating', this.player.position);
    } else if (this.currentAnimation === this.tposeAnimation) {
      this.effects.updateEffects('tpose', this.player.position);
    }
  }

  reset(position) {
    // Reset position
    this.player.position.set(position.x, position.y, position.z);
    
    // Reset state
    this.isJumping = false;
    
    // Cleanup effects
    if (this.effects) {
      this.effects.cleanup();
    }
  }

  cleanup() {
    this.effects.cleanup();
  }
}
