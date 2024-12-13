import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import running from "@/assets/game/animations/Running.fbx";
import jumping from "@/assets/game/animations/Jump.fbx";
import standing from "@/assets/game/animations/Idle.fbx";
import tpose from "@/assets/game/animations/T-Pose.fbx";
import stumble from "@/assets/game/animations/Jogging Stumble.fbx";

export default class AnimationSystem {
  constructor(playerInstance) {
    this.player = playerInstance;
    this.animations = new Map();
    this.currentAnimation = null;
    this.currentAnimationName = null;
    this.mixer = null;

    // State flags
    this.isLevitating = false;
    this.levitationStartTime = 0;
    this.levitationDuration = 3000;
  }

	async initialize() {
    this.mixer = new THREE.AnimationMixer(this.player.player);

    // Define all animations with their properties
    const animationDefinitions = [
      {
        name: "run",
        path: running,
        loop: true,
        clampWhenFinished: false,
        timeScale: 1.0,
        weight: 1.0,
        defaultAnimation: true,
      },
      {
        name: "jump",
        path: jumping,
        loop: 1,
        clampWhenFinished: true,
        timeScale: 0.8,
        weight: 1.0,
        onComplete: () => this.playAnimation("run"),
      },
      {
        name: "stand",
        path: standing,
        loop: true,
        clampWhenFinished: false,
        timeScale: 1.0,
        weight: 1.0,
      },
      {
        name: "tpose",
        path: tpose,
        loop: true,
        clampWhenFinished: false,
        timeScale: 1.0,
        weight: 1.0,
        onStart: () => {
          this.player.effects.startTposeEffects();
        },
      },
      {
        name: "stumble",
        path: stumble,
        loop: 1,
        clampWhenFinished: true,
        timeScale: 0.8,
        weight: 1.0,
        onComplete: () => this.playAnimation("run"),
      },
      // Add more animations here as needed
    ];

    // Load all animations
    for (const def of animationDefinitions) {
      await this.loadAnimation(def);
    }

    // Start default animation
    const defaultAnim = Array.from(this.animations.values()).find(
      anim => anim.defaultAnimation,
    );
    if (defaultAnim) {
      this.playAnimation(defaultAnim.name);
    }
  }

  async loadAnimation({
    name,
    path,
    loop,
    clampWhenFinished,
    timeScale,
    weight,
    defaultAnimation,
    onStart,
    onComplete,
  }) {
    const animationObject = await new FBXLoader().loadAsync(path);
    const clipAction = this.mixer.clipAction(animationObject.animations[0]);

    this.animations.set(name, {
      name,
      clipAction,
      loop,
      clampWhenFinished,
      timeScale,
      weight,
      defaultAnimation,
      onStart,
      onComplete,
    });
  }

  playAnimation(name, crossFadeDuration = 0.2) {
    if (!this.animations.has(name)) {
      if (name === "ipose") {
        this.player.rightArm.rotation.y = Math.PI / 2;
        this.player.rightArm.rotation.z = -Math.PI / 2;
        this.player.rightForearm.rotation.y = Math.PI / 2;
  
        this.player.leftArm.rotation.y = Math.PI / 2;
        this.player.leftArm.rotation.z = -Math.PI / 2;
        this.player.leftForearm.rotation.y = Math.PI / 2;
  
        this.player.rightShoulder.rotation.y = 0;
        this.player.leftShoulder.rotation.y = 0;
      } else if (name === "ppose") {
        this.player.leftArm.rotation.y = Math.PI / 2;
        this.player.leftArm.rotation.z = -Math.PI / 2;
        this.player.leftForearm.rotation.y = Math.PI / 2;
  
        this.player.rightArm.rotation.y = 0;
        this.player.rightArm.rotation.z = 0;
        this.player.rightForearm.rotation.y = 0;
  
        this.player.rightShoulder.rotation.y = 0;
        this.player.leftShoulder.rotation.y = 0;
      } else if (name === "npose") {
        this.player.rightShoulder.rotation.y = Math.PI / 4;
        this.player.leftShoulder.rotation.y = -Math.PI / 4;
  
        this.player.leftArm.rotation.y = 0;
        this.player.leftArm.rotation.z = 0;
        this.player.leftForearm.rotation.y = 0;
  
        this.player.rightArm.rotation.y = 0;
        this.player.rightArm.rotation.z = 0;
        this.player.rightForearm.rotation.y = 0;
      } else if (name === "jpose") {
        this.player.rightArm.rotation.y = Math.PI / 2;
        this.player.rightArm.rotation.z = -Math.PI / 2;
        this.player.rightForearm.rotation.y = Math.PI / 2;
  
        this.player.leftArm.rotation.y = 0;
        this.player.leftArm.rotation.z = 0;
        this.player.leftForearm.rotation.y = 0;
  
        this.player.rightShoulder.rotation.y = 0;
        this.player.leftShoulder.rotation.y = 0;
      }
      return
    }

    const newAnimation = this.animations.get(name);
    const prevAnimation = this.currentAnimation;

    // Stop current animation
    if (prevAnimation) {
      if (crossFadeDuration > 0) {
        prevAnimation.clipAction.crossFadeTo(
          newAnimation.clipAction,
          crossFadeDuration,
          true,
        );
      } else {
        prevAnimation.clipAction.stop();
      }
    }

    // Setup new animation
    newAnimation.clipAction.setLoop(
      newAnimation.loop,
      newAnimation.loop === 1 ? 1 : Infinity,
    );
    newAnimation.clipAction.clampWhenFinished = newAnimation.clampWhenFinished;
    newAnimation.clipAction.setEffectiveTimeScale(newAnimation.timeScale);
    newAnimation.clipAction.setEffectiveWeight(newAnimation.weight);

    // Play new animation
    newAnimation.clipAction.reset();
    newAnimation.clipAction.play();

    // Update state
    this.currentAnimation = newAnimation;
    this.currentAnimationName = name;

    // Handle animation events
    if (newAnimation.onStart) {
      newAnimation.onStart();
    }

    // Setup completion listener if needed
    if (newAnimation.onComplete) {
      const onFinish = () => {
        if (this.currentAnimationName === name) {
          newAnimation.onComplete();
          this.mixer.removeEventListener("finished", onFinish);
          this.player.resetAfterJump();
        }
      };
      this.mixer.addEventListener("finished", onFinish);
    }
  }

  isPerformingAction() {
    return (
      this.currentAnimation &&
      this.currentAnimation.loop === 1 &&
      this.mixer.time < this.currentAnimation.clipAction._clip.duration
    );
  }

  startLevitation() {
    this.isLevitating = true;
    this.levitationStartTime = Date.now();
    this.player.effects.startLevitationEffects();
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
    this.player.player.position.y = easeVertical * 1.2;
    if (progress > 0.3) {
      this.player.player.position.z -= easeForward * 3;
    }

    if (progress >= 1) {
      this.isLevitating = false;
      this.player.player.position.y = 0;
    }
  }

  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  reset() {
    if (this.currentAnimation) {
      this.currentAnimation.clipAction.stop();
    }
    this.currentAnimation = null;
    this.currentAnimationName = null;
    this.isLevitating = false;

    // Restart default animation
    const defaultAnim = Array.from(this.animations.values()).find(
      anim => anim.defaultAnimation,
    );
    if (defaultAnim) {
      this.playAnimation(defaultAnim.name);
    }
  }

  cleanup() {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    this.animations.clear();
  }
}
