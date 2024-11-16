<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LeftBar from "@/components/LeftBar.vue";
import RightBar from "@/components/RightBar.vue";

import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import jump from '@/assets/game/animations/jump.fbx'
import run from '@/assets/game/animations/Running.fbx'
import tpose from '@/assets/game/animations/T-Pose.fbx'
import idle from '@/assets/game/animations/Idle.fbx'
import michelle from '@/assets/game/michelle.fbx'
import car from '@/assets/game/porsche.fbx'

import wall from '@/assets/game/tposewall.fbx'
import groundTexture from '@/assets/game/roadtexture.png'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const canvasRef = ref(null);

// Core ThreeJS variables
let scene, camera, renderer, character, mixer, activeAction, controls, groundMaterial;
let actions = {} // Stores character animations
let tposeAllowed = false

const gameState = {
  RUNNING: 'running',
  SLOWING: 'slowing',
  TPOSE: 'tpose',
  LEVITATING: 'levitating',
  ENDING: 'ending'
};

let currentGameState = gameState.RUNNING;
let currentSpeed = CAR_SPEED;
const SLOWING_DISTANCE = 50; // Distance to start slowing down
const TPOSE_DISTANCE = 12; // Distance to start T-pose
let tposeTimer = 10; // 10 seconds countdown
let effectsGroup; // Group to hold all magical effects

// Ground-related constants
let groundTiles = []; 
const RUNNING_SPEED = 0.1;
const MIN_SPEED = 0.05;
const GROUND_SEGMENT_LENGTH = 100;
const NUMBER_OF_SEGMENTS = 3;

// Car spawning system variables
let carsPool = []; // Pool of available cars for reuse
let activeCars = []; // Currently active cars in the scene
const NUMBER_OF_CARS = 5;
const CAR_SPAWN_DISTANCE = 120; // Distance ahead of player where cars spawn
const CAR_SPEED = 0.5;

// Wall-related variables
let wallInstance = null;
let isWallSpawned = false;
let passedCarsCount = 0;
const CARS_BEFORE_WALL = 2;
const WALL_SPAWN_DISTANCE = 100;

let glowRing;
let particleSystem;
let flashPlane;


// Starting position for the character
let characterDefaultPosition = { x: 0, y: -1.5, z: -2 }

onMounted(() => {
  initThreeJS();
  loadCharacter();
  loadWall();
  createMagicalEffects();
  animate(); 
  initializeCarPool();
  addLights();
  createGroundSegments();
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("keydown", handleKeyDown);
});

function createMagicalEffects() {
  effectsGroup = new THREE.Group();
  
  // Create glow ring
  const ringGeometry = new THREE.TorusGeometry(1, 0.1, 16, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5
  });
  glowRing = new THREE.Mesh(ringGeometry, ringMaterial);
  glowRing.visible = false;
  effectsGroup.add(glowRing);

  // Create particle system
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  
  for(let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 1;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8
  });
  
  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  particleSystem.visible = false;
  effectsGroup.add(particleSystem);

  // Create flash plane
  const flashGeometry = new THREE.PlaneGeometry(10, 10);
  const flashMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  flashPlane = new THREE.Mesh(flashGeometry, flashMaterial);
  flashPlane.position.z = -1;
  flashPlane.visible = false;
  effectsGroup.add(flashPlane);

  scene.add(effectsGroup);
}

function updateMagicalEffects() {
  if (!character || !effectsGroup) return;

  // Update effects position to follow character
  effectsGroup.position.copy(character.position);
  
  switch(currentGameState) {
    case gameState.TPOSE:
      // Pulse glow ring
      if (glowRing.visible) {
        glowRing.scale.multiplyScalar(1.01);
        glowRing.material.opacity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
      }
      break;
      
    case gameState.LEVITATING:
      // Rotate and rise particles
      if (particleSystem.visible) {
        particleSystem.rotation.y += 0.02;
        particleSystem.position.y += 0.01;
      }
      break;
      
    case gameState.ENDING:
      // Flash effect
      if (flashPlane.visible) {
        flashPlane.material.opacity = Math.min(flashPlane.material.opacity + 0.05, 1);
      }
      break;
  }
}

function startTpose() {
  currentGameState = gameState.TPOSE;
  glowRing.visible = true;
  glowRing.scale.set(1, 1, 1);
  if (activeAction !== actions.tpose) {
    actions.run.reset()
    activeAction.crossFadeTo(actions.idle, 0.2, true)
    actions.idle.play()
    activeAction = actions.idle;
  }
}

function startLevitation() {
  currentGameState = gameState.LEVITATING;
  glowRing.visible = false;
  particleSystem.visible = true;
  
  if (character) {
    const startY = character.position.y;
    const startZ = character.position.z;
    const targetY = startY + 0.1; // Reduced height for more natural movement
    const targetZ = wallInstance.position.z + 2; // Move beyond the wall
    const duration = 3000; // Increased duration for smoother movement
    const startTime = Date.now();

    const levitationAnimation = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // First move up, then forward
      const verticalProgress = progress < 0.3 ? progress / 0.3 : 1;
      const forwardProgress = progress < 0.3 ? 0 : (progress - 0.3) / 0.7;
      
      // Update positions with eased movements
      character.position.y = startY + (targetY - startY) * easeInOut(verticalProgress);
      character.position.z = startZ + (targetZ - startZ) * easeInOut(forwardProgress);
      
      
      if (progress < 1) {
        requestAnimationFrame(levitationAnimation);
      } else {
        endGame();
      }
    };
    
    levitationAnimation();
  }
}

// Add easing function for smoother motion
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function endGame() {
  
}

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

function loadWall() {
  const fbxLoader = new FBXLoader();
  fbxLoader.load(wall, (fbx) => {
    wallInstance = fbx;
    wallInstance.scale.setScalar(0.009); // Adjust scale as needed
    
    // Rotate the wall 90 degrees around the Y-axis
    wallInstance.rotation.y = Math.PI / 2
    wallInstance.traverse(c => {
      c.castShadow = true;
    });
    wallInstance.visible = false;
    scene.add(wallInstance);
  });
}

// Spawn the wall at a specific position
function spawnWall() {
  if (!wallInstance || isWallSpawned) return;
  
  wallInstance.position.set(
    0, // x position (center)
    1, // y position (ground level)
    character.position.z + WALL_SPAWN_DISTANCE // z position (ahead of character)
  );
  
  wallInstance.visible = true;
  isWallSpawned = true;
}

// Update wall position and check for collision
function updateWall() {
  if (!wallInstance || !wallInstance.visible || !character) return;

  const distanceToWall = wallInstance.position.z - character.position.z;
  
  switch(currentGameState) {
    case gameState.RUNNING:
      if (distanceToWall < SLOWING_DISTANCE) {
        currentGameState = gameState.SLOWING;
      }
      wallInstance.position.z -= currentSpeed;
      break;
      
    case gameState.SLOWING:
      // Gradually slow down
      actions.run.setEffectiveTimeScale(0.8)
      currentSpeed = THREE.MathUtils.lerp(
        currentSpeed,
        MIN_SPEED,
        0.05
      );
      
      if (distanceToWall < TPOSE_DISTANCE) {
        currentSpeed = 0; // Stop all movement
        tposeAllowed = true
        startTpose()
      } else {
        wallInstance.position.z -= currentSpeed;
      }
      break;
      
    case gameState.TPOSE:
      // Wall and everything stays still
      // Only update timer
      tposeTimer -= 1/60;
      if (tposeTimer <= 0) {
        console.log('time!!!!!')
        startLevitation();
      }
      break;
  }
}

let shouldSpawnCars = true;

function updateCars() {
  for (let i = activeCars.length - 1; i >= 0; i--) {
    const carInstance = activeCars[i];
    // Only move cars if we're not in T-pose
    if (currentGameState !== gameState.TPOSE && currentGameState !== gameState.LEVITATING) {
      carInstance.position.z -= currentSpeed; // Use currentSpeed instead of CAR_SPEED
    }

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
      
      passedCarsCount++;
      
      if (passedCarsCount === CARS_BEFORE_WALL && !isWallSpawned) {
        spawnWall();
        shouldSpawnCars = false; // Stop spawning new cars
      }
      
      if (carsPool.length > 0 && shouldSpawnCars) {
        spawnCar();
      }
    }
  }
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

    loader.load(idle, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.idle = mixer.clipAction(anim);
    })

    // Setup jump animation
    loader.load(jump, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.jump = mixer.clipAction(anim);
    });

    loader.load(tpose, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.tpose = mixer.clipAction(anim);
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
  updateWall()
  updateMagicalEffects();
  // Update ground texture scroll
  if (groundMaterial && groundMaterial.map && 
      currentGameState !== gameState.TPOSE && 
      currentGameState !== gameState.LEVITATING) {
    groundMaterial.map.offset.y -= currentSpeed * 0.1;
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
  if (e.key === 't') {
    if (tposeAllowed) {
      activeAction.reset()
      activeAction.crossFadeTo(actions.tpose, 0.2, true)
        actions.tpose.play()
        actions.tpose
            .setEffectiveTimeScale(0.8)
            .setEffectiveWeight(1.0)
        activeAction = actions.tpose;
    }
  }
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