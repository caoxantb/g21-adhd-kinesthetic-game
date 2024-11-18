import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import car1 from '@/assets/game/models/car1.glb'
import car2 from '@/assets/game/models/car2.glb'
import car3 from '@/assets/game/models/car3.glb'

export default class ObstacleSystem {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.activeObstacles = [];
        this.obstacleModels = [
            car1, car2
            // Add more obstacle model paths as needed
        ];
        this.modelPool = new Map();
        this.spawnDistance = -190;
        this.despawnDistance = 80;
        this.lastSpawnTime = 0;
        this.nextSpawnTime = 0;

        this.numberOfCarsSpawned = 0
        
        this.activePhaseDuration = 70;
        this.carTravelTime = Math.abs(this.despawnDistance - this.spawnDistance) / (50 * 1.5);
        this.targetNumberOfCars = Math.floor((this.activePhaseDuration) / (3 * this.carTravelTime));
        console.log(this.targetNumberOfCars)
        this.minSpawnInterval = this.carTravelTime * 1000 + 2000;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            const loader = new GLTFLoader();
            // Load actual models
            for (const modelPath of this.obstacleModels) {
                try {
                    const fbx = await loader.loadAsync(modelPath);
                    const model = fbx.scene;
                    model.traverse(child => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    this.normalizeModelSize(model)
                    this.modelPool.set(modelPath, model);
                    console.log(`Loaded model: ${modelPath}`);
                } catch (error) {
                    console.error(`Failed to load model: ${modelPath}`, error);
                }
            }

            this.initialized = true;
            this.nextSpawnTime = Date.now(); // Initial spawn delay
        } catch (error) {
            console.error("Error initializing obstacle system:", error);
        }
    }

    normalizeModelSize(model) {
        const boundingBox = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const desiredSize = 15;
        const scale = desiredSize / maxDim;
        model.scale.set(scale, scale, scale);
    }

    spawnObstacle() {
        if (this.numberOfCarsSpawned >= this.targetNumberOfCars) return
        
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime < this.minSpawnInterval) return

        // Randomly select a model
        const modelPath = this.obstacleModels[Math.floor(Math.random() * this.obstacleModels.length)];
        const obstacleModel = this.modelPool.get(modelPath);

        const obstacle = obstacleModel.clone();
        obstacle.position.set(0, 0, this.spawnDistance);

        this.scene.add(obstacle);
        this.activeObstacles.push({
            model: obstacle,
            speed: 1.5
        });
        this.numberOfCarsSpawned ++

        this.lastSpawnTime = currentTime;
        // Set next spawn interval randomly
        this.nextSpawnTime = currentTime + this.carTravelTime - 10

    }

    update(delta, gameSpeed) {
        if (!this.initialized) return;

        // Update existing obstacles
        for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
            const obstacle = this.activeObstacles[i];
            obstacle.model.position.z += gameSpeed * delta * obstacle.speed;

            // Remove if past despawn point
            if (obstacle.model.position.z > this.despawnDistance) {
                this.scene.remove(obstacle.model);
                this.activeObstacles.splice(i, 1);
            }
        }

        // Try to spawn new obstacle
        this.spawnObstacle();
    }

    cleanup() {
        for (const obstacle of this.activeObstacles) {
            this.scene.remove(obstacle.model);
        }
        this.activeObstacles = [];
    }
}