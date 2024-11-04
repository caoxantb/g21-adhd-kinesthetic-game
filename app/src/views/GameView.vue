<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

import jump from '@/assets/game/animations/jump.fbx'
import run from '@/assets/game/animations/Running.fbx'
import xbot from '@/assets/game/michelle.fbx'
import car from '@/assets/game/porsche.fbx'

import texture from '@/assets/game/fire-edge-blue.jpg'
import groundTexture from '@/assets/game/roadtexture.png'

import drone_obj from '@/assets/game/DroidOBJ/SciFiDroid.obj'
import drone_mtl from '@/assets/game/DroidOBJ/SciFiDroid.mtl'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const canvasRef = ref(null);

let scene, camera, renderer, character, mixer, activeAction, controls, groundMaterial;
let actions = {}
let groundTiles = []; // Array to store ground segments
const RUNNING_SPEED = 0.1;
const GROUND_SEGMENT_LENGTH = 100;
const NUMBER_OF_SEGMENTS = 3;

let dronesPool = []; // Pool of available drones
let activeDrones = []; // Currently active drones
const NUMBER_OF_DRONES = 5; // Number of drones in the pool
const DRONE_SPAWN_DISTANCE = 40; // Distance ahead where drones spawn
const DRONE_SPEED = 0.15; // Speed of drones moving toward player

let characterDefaultPosition = { x: 0, y: -1.5, z: -2 }

onMounted(() => {
  initThreeJS();
  loadCharacter();
  animate();
  
  initializeDronePool();
  createGroundSegments();
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);
  window.removeEventListener("keydown", handleKeyDown);
});

function initThreeJS() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#FFFFFF')
  camera = new THREE.PerspectiveCamera(60, w / h, 0.5, 200);
  camera.position.set(0, 4, -6); // Position
  // camera.lookAt(0, 0, -1); // Look at point
  
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.value });
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // addPlane()
  addLights()

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Damping gives smoother movement
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1, -2);
}

function createDrone() {
  return new Promise((resolve) => {
    const fbxloader = new FBXLoader();
    fbxloader.load(car, (fbx) => {
      fbx.scale.setScalar(0.015);
      fbx.traverse(c => {
        c.castShadow = true;
      });
      fbx.visible = false
      scene.add(fbx)
      resolve(fbx)
    });
  });
}

function createDrone1() {
  return new Promise((resolve) => {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(drone_mtl, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);

      objLoader.load(drone_obj, (object) => {
        object.visible = false; // Start invisible
        object.scale.set(0.8, 0.8, 0.8); // Adjust scale if needed
        scene.add(object);
        resolve(object);
      });
    });
  });
}

async function initializeDronePool() {
  // Create pool of drones
  for (let i = 0; i < NUMBER_OF_DRONES; i++) {
    const drone = await createDrone();
    dronesPool.push(drone);
  }
  
  // Start spawning drones
  spawnDrone();
}

function spawnDrone() {
  if (dronesPool.length === 0) return;

  const drone = dronesPool.pop();
  const lanePosition = 0// Math.floor(Math.random() * 3) - 1; // Random lane (-1, 0, 1)
  
  drone.position.set(
    lanePosition * 2, // X position (lane)
    -1.5, // Y position (height)
    character.position.z + DRONE_SPAWN_DISTANCE // Z position (ahead of player)
  );
  
  drone.visible = true;
  activeDrones.push(drone);
}

function checkCollision(drone, character) {
  // Define collision box dimensions
  const droneBox = {
    width: 1,  // Adjust these values based on your drone size
    height: 0.1,
    depth: 1
  };
  const characterBox = {
    width: 1,  // Adjust these values based on your character size
    height: 0.1,
    depth: 1
  };

  // Get positions
  const dronePos = drone.position;
  const characterPos = character.position;

  // Check for overlap in all dimensions
  const xCollision = Math.abs(dronePos.x - characterPos.x) < (droneBox.width + characterBox.width) / 2;
  const zCollision = Math.abs(dronePos.z - characterPos.z) < (droneBox.depth + characterBox.depth) / 2;

  return xCollision && zCollision //&& zCollision;
}

function updateDrones() {
  for (let i = activeDrones.length - 1; i >= 0; i--) {
    const drone = activeDrones[i];
    drone.position.z -= DRONE_SPEED;

    if (character && drone.visible) {
      if (checkCollision(drone, character)) {
        // do something
      }
    }

    // If drone has passed the character, recycle it
    if (drone.position.z < character.position.z - 5) {
      drone.visible = false;
      activeDrones.splice(i, 1);
      dronesPool.push(drone);
      
      // Spawn a new drone if we have any in the pool
      if (dronesPool.length > 0) {
        spawnDrone();
      }
    }
  }
}

function createGroundSegments() {
  const width = 10;
  const length = GROUND_SEGMENT_LENGTH;
  const geometry = new THREE.PlaneGeometry(width, length, 1, 1);
  
  // Load texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(groundTexture);
  
  // Set texture properties
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 20); // Adjust these values to change texture tiling
  
  // Create material with animated texture
  groundMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.8,
    metalness: 0.2
  });

  // Create multiple ground segments
  for (let i = 0; i < NUMBER_OF_SEGMENTS; i++) {
    const plane = new THREE.Mesh(geometry, groundMaterial);
    plane.rotation.x = Math.PI * -0.5;
    plane.receiveShadow = true;
    plane.position.y = -1.5;
    plane.position.z = -2 + (i * GROUND_SEGMENT_LENGTH);
    scene.add(plane);
    groundTiles.push(plane);
  }
}


// function loadCorridor() {
//   const mtlLoader = new MTLLoader();
//   const objLoader = new OBJLoader();

//   mtlLoader.load(corridor_mtl, (materials) => {
//     materials.preload();
//     objLoader.setMaterials(materials);
    
//     objLoader.load(corridor_obj, (object) => {
//       object.scale.setScalar(0.02); // Adjust scale as needed
//       // object.position.set(0, -1.5, -2); // Match character position
//       object.traverse((child) => {
//         if (child.isMesh) {
//           child.castShadow = true;
//           child.receiveShadow = true;
//         }
//       });
//       scene.add(object);
//     }, 
//     (xhr) => {
//       console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//     },
//     (error) => {
//       console.error('Error loading model:', error);
//     });
//   });
// }


function loadCharacter() {
  const loader = new FBXLoader();

  loader.load(xbot, (fbx) => {
    character = fbx;
    character.scale.setScalar(0.02);
    character.position.set(
      characterDefaultPosition.x, 
      characterDefaultPosition.y, 
      characterDefaultPosition.z
    );
    character.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
      }
    });
    
    mixer = new THREE.AnimationMixer(character);

    // Load running animation with continuous loop
    loader.load(run, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.run = mixer.clipAction(anim);
      // actions.run.timeScale = 0.5
      actions.run.play();
      activeAction = actions.run;
    });

    // Load jump animation
    loader.load(jump, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.jump = mixer.clipAction(anim);
    });

    scene.add(character);
  });
}

function addLights() {
  let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  light.position.set(20, 100, 10);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.bias = -0.00001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 500.0;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500.0;
  light.shadow.camera.left = 100;
  light.shadow.camera.right = -100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;
  scene.add(light);

  light = new THREE.AmbientLight(0xFFFFFF, 2.0);
  scene.add(light);
}

function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(0.016); // Update animations (assuming 60fps)
  }
  updateDrones();

  if (groundMaterial && groundMaterial.map) {
    groundMaterial.map.offset.y -= RUNNING_SPEED * 0.1; // Adjust this value to change texture scroll speed
  }

  renderer.render(scene, camera);
}

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(e) {
  if (e.key === 'ArrowUp') {
    if (actions && actions.jump) {
      if (activeAction !== actions.jump) {
        // Set up the jump animation
        
        actions.jump
          .reset()
          .setLoop(THREE.LoopOnce, 1);
        actions.jump.clampWhenFinished = true;

        // Create a smooth crossfade from running to jumping
        const crossFadeDuration = 0.1;  // Adjust this value to control blend speed
        activeAction.crossFadeTo(actions.jump, crossFadeDuration, true);
        
        actions.jump.play();
        actions.jump
          .setEffectiveTimeScale(0.8)  // Use setEffectiveTimeScale instead of timeScale
          .setEffectiveWeight(1.0)
        activeAction = actions.jump; 

        // Store previous action to transition back to
        if (!mixer.listenerAdded) {
          mixer.addEventListener('finished', () => {
            if (activeAction === actions.jump) {
              // After jump finishes, transition back to run
              actions.run.reset();
              activeAction.crossFadeTo(actions.run, crossFadeDuration, true);
              actions.run.play();
              activeAction = actions.run;
            }
          });
          mixer.listenerAdded = true; // Custom flag to prevent multiple listener additions
        }
      }
    }
  }
}
</script>

<template>
  <div class="container">
    <canvas ref="canvasRef" class="main">
      <!-- <div>Game Begins</div> -->
    </canvas>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
}

.main {
  background-color: var(--color-white);
  overflow: hidden;
  height: 100%;
  font-size: 64px;
}
</style>
