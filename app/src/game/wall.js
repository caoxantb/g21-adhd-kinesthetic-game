import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

import tposewall from '@/assets/game/models/tposewall.fbx'

export default class WallSystem {
    constructor(scene) {
        this.scene = scene
        this.spawnDistance = -170
        this.despawnDistance = 70
        this.stoppingDistance = 40
    }

    async init() {
        try {
            const loader = new FBXLoader() 
            const fbx = await loader.loadAsync(tposewall)
            this.model = fbx
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
        this.model.position.set(0,5.5, this.spawnDistance)
        this.model.scale.set(0.02, 0.02, 0.02)
        this.model.rotation.y = Math.PI/2
        console.log(this.model.position.y)
        this.scene.add(this.model)
    }

    update(delta, gameSpeed) {
        // if (this.model.position.z < this.stoppingDistance)
            this.model.position.z += gameSpeed * delta
        
        if (this.model.position.z > this.despawnDistance) {
            this.scene.remove(this.model)
        }
    }

    cleanup() {
        this.scene.remove(this.model)
    }
}