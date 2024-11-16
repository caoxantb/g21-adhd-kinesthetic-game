<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LeftBar from "@/components/LeftBar.vue";
import RightBar from "@/components/RightBar.vue";

import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import jump from '@/assets/game/animations/jump.fbx'
import run from '@/assets/game/animations/Running.fbx'
import michelle from '@/assets/game/michelle.fbx'
import car from '@/assets/game/porsche.fbx'

import groundTexture from '@/assets/game/roadtexture.png'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//import { jumpDetection } from '@/utils/jump';

const canvasRef = ref(null);

// Core ThreeJS variables
let scene, camera, renderer, character, mixer, activeAction, controls, groundMaterial;
let actions = {} // Stores character animations

// Ground-related constants
let groundTiles = []; 
const RUNNING_SPEED = 0.1;
const GROUND_SEGMENT_LENGTH = 100;
const NUMBER_OF_SEGMENTS = 3;

// Car spawning system variables
let carsPool = []; // Pool of available cars for reuse
let activeCars = []; // Currently active cars in the scene
const NUMBER_OF_CARS = 5;
const CAR_SPAWN_DISTANCE = 120; // Distance ahead of player where cars spawn
const CAR_SPEED = 0.35;

let kinectron = null;
let basehead = null;
let jumping = false;

// Starting position for the character
let characterDefaultPosition = { x: 0, y: -1.5, z: -2 }

onMounted(() => {
  initThreeJS();
  loadCharacter();
  animate(); 
  initializeCarPool();
  addLights()
  createGroundSegments();
  initKinectron();
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);
  window.removeEventListener("keydown", handleKeyDown);
});

// Initialize the ThreeJS scene, camera, renderer, and lighting
function initThreeJS() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#000000')
  camera = new THREE.PerspectiveCamera(60, w / h, 0.5, 200);
  camera.position.set(0, 4, -6);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.value });
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Setup orbit controls for camera manipulation
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1, -2);
}

// Create a single car instance and add it to the scene
function createCar() {
  return new Promise((resolve) => {
    const fbxLoader = new FBXLoader();
    fbxLoader.load(car, (fbx) => {
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

// Initialize pool of cars for reuse
async function initializeCarPool() {
  for (let i = 0; i < NUMBER_OF_CARS; i++) {
    const carInstance = await createCar();
    carsPool.push(carInstance);
  }
  spawnCar();
}

// Spawn a new car from the pool
function spawnCar() {
  if (carsPool.length === 0) return;

  const carInstance = carsPool.pop();
  const lanePosition = 0; // Currently only using middle lane
  
  carInstance.position.set(
    lanePosition * 2,
    -1.5,
    character.position.z + CAR_SPAWN_DISTANCE
  );
  
  carInstance.visible = true;
  activeCars.push(carInstance);
}

// Check for collision between car and character
function checkCollision(car, character) {
  const carBox = {
    width: 1,
    height: 0.1,
    depth: 1
  };
  const characterBox = {
    width: 1,
    height: 0.1,
    depth: 1
  };

  const carPos = car.position;
  const characterPos = character.position;

  const xCollision = Math.abs(carPos.x - characterPos.x) < (carBox.width + characterBox.width) / 2;
  const zCollision = Math.abs(carPos.z - characterPos.z) < (carBox.depth + characterBox.depth) / 2;

  return xCollision && zCollision;
}

// Update positions of all active cars and handle recycling
function updateCars() {
  for (let i = activeCars.length - 1; i >= 0; i--) {
    const carInstance = activeCars[i];
    carInstance.position.z -= CAR_SPEED;

    if (character && carInstance.visible) {
      if (checkCollision(carInstance, character)) {
        // Collision handling can be added here
      }
    }

    // Recycle car if it's passed the character
    if (carInstance.position.z < character.position.z - 5) {
      carInstance.visible = false;
      activeCars.splice(i, 1);
      carsPool.push(carInstance);
      
      if (carsPool.length > 0) {
        spawnCar();
      }
    }
  }
}

// Create the scrolling ground segments
function createGroundSegments() {
  const width = 10;
  const length = GROUND_SEGMENT_LENGTH;
  const geometry = new THREE.PlaneGeometry(width, length, 1, 1);
  
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(groundTexture);
  
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 20);
  
  groundMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.8,
    metalness: 0.2
  });

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

// Load and setup the character model with animations
function loadCharacter() {
  const loader = new FBXLoader();

  loader.load(michelle, (fbx) => {
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

    // Setup running animation
    loader.load(run, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.run = mixer.clipAction(anim);
      actions.run.play();
      activeAction = actions.run;
      scene.add(character)
    });

    // Setup jump animation
    loader.load(jump, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.jump = mixer.clipAction(anim);
    });
  });
}

// Setup scene lighting
function addLights() {
  let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  light.position.set(20, 100, 10);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.bias = -0.001;
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

// Main animation loop
function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(0.016); // Update animations (assuming 60fps)
  }
  updateCars();

  // Update ground texture scroll
  if (groundMaterial && groundMaterial.map) {
    groundMaterial.map.offset.y -= RUNNING_SPEED * 0.1;
  }

  renderer.render(scene, camera);
}

// Handle window resizing
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle keyboard input for jumping
function handleKeyDown(e) {
  if (e.key === 'ArrowUp') {
    if (actions && actions.jump) {
      if (activeAction !== actions.jump) {
        actions.jump
          .reset()
          .setLoop(THREE.LoopOnce, 1);
        actions.jump.clampWhenFinished = true;

        const crossFadeDuration = 0.1;
        activeAction.crossFadeTo(actions.jump, crossFadeDuration, true);
        
        actions.jump.play();
        actions.jump
          .setEffectiveTimeScale(0.8)
          .setEffectiveWeight(1.0)
        activeAction = actions.jump; 

        // Handle transition back to running after jump
        if (!mixer.listenerAdded) {
          mixer.addEventListener('finished', () => {
            if (activeAction === actions.jump) {
              actions.run.reset();
              activeAction.crossFadeTo(actions.run, crossFadeDuration, true);
              actions.run.play();
              activeAction = actions.run;
            }
          });
          mixer.listenerAdded = true;
        }
      }
    }
  }
}

function initKinectron() {
  // define and create an instance of kinectron
  kinectron = new Kinectron("192.168.56.1");
  
  // Set kinect type to "azure" or "windows"
  kinectron.setKinectType("windows");

  // connect with application over peer
  kinectron.makeConnection();

  // request all tracked bodies and pass data to your callback
  kinectron.startTrackedBodies(jumpDetection);
}

function jumpDetection(body) {
  var height = 500;
  var head = body.joints[kinectron.HEAD];

    if(basehead === null) {
        basehead = head.depthY*height;
    }

    if(!jumping && basehead - head.depthY*height >= 50) {
        jumping = true;
        console.log("JUMP DETECTED!!!!!");
        if (actions && actions.jump) {
          if (activeAction !== actions.jump) {
            actions.jump
              .reset()
              .setLoop(THREE.LoopOnce, 1);
            actions.jump.clampWhenFinished = true;

            const crossFadeDuration = 0.1;
            activeAction.crossFadeTo(actions.jump, crossFadeDuration, true);
            
            actions.jump.play();
            actions.jump
              .setEffectiveTimeScale(0.8)
              .setEffectiveWeight(1.0)
            activeAction = actions.jump; 

            // Handle transition back to running after jump
            if (!mixer.listenerAdded) {
              mixer.addEventListener('finished', () => {
                if (activeAction === actions.jump) {
                  actions.run.reset();
                  activeAction.crossFadeTo(actions.run, crossFadeDuration, true);
                  actions.run.play();
                  activeAction = actions.run;
                }
              });
              mixer.listenerAdded = true;
            }
          }
        }
    } else if(jumping && basehead - head.depthY*height < 50) {
        jumping = false;
    }
}
</script>

<template>
  <div class="container">
    <LeftBar :progress="30" :coins="1000"></LeftBar>
    <canvas ref="canvasRef" class="main"></canvas>
    <RightBar :progress="25" :success="4" :fail="2"></RightBar>
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