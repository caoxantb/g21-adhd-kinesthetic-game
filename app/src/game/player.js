import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";
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

    this.baseVelocity = 0;
    this.currentVelocity = 0;
    this.testGravity = -0.0113;

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

    const box3 = new THREE.Box3().setFromObject(this.player);
    box3.max.x = 1;
    box3.min.x = -1;
    this.player.userData.obb = new OBB().fromBox3(box3);
    this.player.userData.obb.center.z = this.player.position.z;
    this.player.userData.originalCenter =
      this.player.userData.obb.center.clone();

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
    this.animationSystem.playAnimation("jump");
    this.currentVelocity = 0.35;
    this.isJumping = true;
  }

  stumble() {
    if (this.animationSystem.currentAnimationName !== "stumble") {
      this.animationSystem.playAnimation("stumble");
      this.store.fail++;
      this.store.updateCoins(-5);
    }
  }

  levitate() {
    this.animationSystem.startLevitation();
  }

  startPose(poseName) {
    this.animationSystem.playAnimation(poseName);
  }

  active(delta) {
    this.animationSystem.update(delta);
    if (this.player) {
      if (this.isJumping) {
        this.player.userData.obb.center.y += this.currentVelocity;
        this.currentVelocity += this.testGravity;

        // For testing purposes, delete when satisfied with the jump.
        // const bboxMaterial2 = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true, depthTest: true  });
        // const bbox2 = new THREE.LineSegments(new THREE.BoxGeometry(
        //   this.player.userData.obb.halfSize.x*2,
        //   this.player.userData.obb.halfSize.y*2,
        //   this.player.userData.obb.halfSize.z*2
        // ),
        //   bboxMaterial2
        // );
        // bbox2.position.copy(this.player.userData.obb.center);
        // this.scene.add(bbox2);

        // setTimeout(() => {
        //   this.scene.remove(bbox2);
        // }, 100);
      }
    }
  }

  beforeFreeze() {
    this.animationSystem.playAnimation("stand");
  }

  freeze(delta) {
    this.animationSystem.update(delta);
    if (this.animationSystem.isLevitating) {
      this.animationSystem.updateLevitation();
      this.effects.updateEffects("levitating", this.player.position);
    } else if (this.animationSystem.currentAnimationName === "tpose") {
      this.effects.updateEffects("tpose", this.player.position);
    }
  }

  resetAfterJump() {
    this.isJumping = false;
    this.player.userData.obb.center.y = this.player.userData.originalCenter.y;
    this.currentVelocity = this.baseVelocity;
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
