import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

// import tposewall from "@/assets/game/models/tposewall.fbx";
import iposewall from "@/assets/game/models/iposewall.fbx";
import jposewall from "@/assets/game/models/jposewall.fbx";
import nposewall from "@/assets/game/models/nposewall.fbx";
import pposewall from "@/assets/game/models/pposewall.fbx";

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
    this.currentWallName = null;

    // Modified wall models to include names
    this.wallModels = [
        // { path: tposewall, name: 'twall' },
        { path: iposewall, name: 'ipose' },
        { path: jposewall, name: 'jpose' },
        { path: nposewall, name: 'npose' },
        { path: pposewall, name: 'ppose' }
    ];
    this.wallModelPool = new Map();
  }

  async init() {
    try {
        const loader = new FBXLoader();
        for (const modelData of this.wallModels) {
            try {
                const fbx = await loader.loadAsync(modelData.path);
                this.model = fbx;
                this.model.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                this.normalizeModelSize(this.model);
                // Store both the model and its name
                this.wallModelPool.set(modelData.path, {
                    model: this.model,
                    name: modelData.name
                });
            } catch (error) {
                console.error(`Failed to load model`, error);
            }
        }
    } catch (error) {
        console.error("Error initializing the wall system:", error);
    }
  }

  normalizeModelSize(model) {
    const boundingBox = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 27;
    const scale = desiredSize / maxDim;
    model.scale.set(scale, scale, scale);
  }

  spawnWall() {
    // Randomly select a model
    const modelData = this.wallModels[Math.floor(Math.random() * this.wallModels.length)];
    const wallData = this.wallModelPool.get(modelData.path);
    this.model = wallData.model.clone();
    this.currentWallName = wallData.name;  // Store the current wall name
    
    this.model.position.set(0, 5.7, this.spawnDistance);
    this.model.rotation.y = Math.PI / 2;
    this.scene.add(this.model);
    this.isActive = true;
    this.hasFreezeTriggered = false;
  }

  // New function to get the current wall name
  getCurrentWallName() {
      return this.currentWallName;
  }

  update(delta, gameSpeed) {
      if (!this.isActive || !this.model) return;
      this.model.position.z += gameSpeed * delta;

      // Check distance to player
      const distanceToPlayer = this.playerZPosition - this.model.position.z;
      
      // If wall reaches trigger distance and hasn't triggered freeze yet
      if (distanceToPlayer <= this.freezeTriggerDistance && !this.hasFreezeTriggered) {
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
      this.currentWallName = null;
  }
}