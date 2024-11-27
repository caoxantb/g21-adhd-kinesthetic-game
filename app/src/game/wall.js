import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

import tposewall from "@/assets/game/models/tposewall.fbx";

export default class WallSystem {
  constructor(scene, game) {
    this.scene = scene;
    this.game = game
    this.spawnDistance = -190;
    this.playerZPosition = 68
    this.despawnDistance = 90;
    this.freezeTriggerDistance = 20
    this.hasFreezeTriggered = false;
    this.isActive = false;
    this.wall = null;
  }

  async init() {
    try {
      const loader = new FBXLoader();
      const fbx = await loader.loadAsync(tposewall);
      this.model = fbx;
      this.model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    } catch (error) {
      console.error(`Failed to load model`, error);
    }
  }

  spawnWall() {
    this.model.position.set(0, 5.5, this.spawnDistance);
    this.model.scale.set(0.02, 0.02, 0.02);
    this.model.rotation.y = Math.PI / 2;
    this.scene.add(this.model);
    this.isActive = true;
    this.hasFreezeTriggered = false;
  }

  update(delta, gameSpeed) {
    if (!this.isActive || !this.model) return;
    this.model.position.z += gameSpeed * delta;

    // Check distance to player
    const distanceToPlayer = this.PLAYER_Z_POSITION - this.model.position.z;
    
    // If wall reaches trigger distance and hasn't triggered freeze yet
    if (distanceToPlayer <= this.FREEZE_TRIGGER_DISTANCE && !this.hasFreezeTriggered) {
        this.hasFreezeTriggered = true;
        this.isActive = false; // Stop wall movement
        this.triggerFreeze();
    }
  }

  triggerFreeze() {
    // Tell the game to transition to freeze phase
    if (this.game && typeof this.game.startFreezingPhase === 'function') {
        this.game.freeze();
    }
  }

  cleanup() {
    this.scene.remove(this.model);
  }
}
