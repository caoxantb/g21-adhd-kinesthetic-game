<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

import jump from '@/assets/game/animations/Jumping.fbx'
import run from '@/assets/game/animations/Running.fbx'
import xbot from '@/assets/game/X Bot.fbx'

import texture from '@/assets/game/fire-edge-blue.jpg'
import groundTexture from '@/assets/game/roadtexture.png'

import drone_obj from '@/assets/game/DroidOBJ/SciFiDroid.obj'
import drone_mtl from '@/assets/game/DroidOBJ/SciFiDroid.mtl'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const canvasRef = ref(null);

let scene, camera, renderer, character, mixer, activeAction, controls, groundMaterial;
let actions = {}
let drone = false
let drones = []; // Array to store multiple drones
let groundTiles = []; // Array to store ground segments
const RUNNING_SPEED = 0.1;
const GROUND_SEGMENT_LENGTH = 100;
const NUMBER_OF_SEGMENTS = 3;

onMounted(() => {
  initThreeJS();
  loadCharacter();
  animate();
  loadDrone();
  addLights()
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
  camera = new THREE.PerspectiveCamera(60, w / h, 0.5, 200);
  camera.position.set(0, 4, -6); // Position
  // camera.lookAt(0, 0, -1); // Look at point
  
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.value });
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // addPlane()

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Damping gives smoother movement
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1, -2);
}

function loadDrone() {
  const mtlLoader = new MTLLoader();
  mtlLoader.load(drone_mtl, (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load(drone_obj, (object) => {

      object.position.set(0, -1, 15)
      scene.add(object);
      drone = object
      animate();
    });
  });
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

let characterDefaultPosition = { x: 0, y: -1.5, z: -2 }

function loadCharacter() {
  const loader = new FBXLoader();
  const textureLoader = new THREE.TextureLoader();

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
        c.material = new THREE.MeshMatcapMaterial({
          matcap: textureLoader.load(texture),
        });
        c.castShadow = true;
      }
    });
    
    mixer = new THREE.AnimationMixer(character);

    // Load running animation with continuous loop
    loader.load(run, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.run = mixer.clipAction(anim);
      actions.run.timeScale = 0.5
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
  // Main directional light
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(2, 4, 3);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Ambient light for overall visibility
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  // Add point lights for better depth perception
  const frontLight = new THREE.PointLight(0xffffff, 0.5);
  frontLight.position.set(0, 5, 5);
  scene.add(frontLight);

  const backLight = new THREE.PointLight(0xffffff, 0.5);
  backLight.position.set(0, 5, -5);
  scene.add(backLight);
}

function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(0.016); // Update animations (assuming 60fps)
  }

  // if (drone) {
  //   drone.position.z -= 0.05
  //   if (drone.position.z < -5) {
  //     drone.position.z = 15
  //   }
  // }

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
        // Stop any currently playing action
        if (activeAction) {
          activeAction.stop();
        }

        // Set the action to play once
        actions.jump.reset().setLoop(THREE.LoopOnce, 1); 
        actions.jump.clampWhenFinished = true; // Ensure it holds the last frame
        actions.jump.play();

        // Listen for when the action finishes and stop it
        mixer.addEventListener('finished', () => {
          if (activeAction === actions.jump) {
            // After jump finishes, go back to idle
            actions.idle.reset().play();
            activeAction = actions.idle;
          }
        });
        activeAction = actions.jump; // Set active action
      }    
    }
  }
  if (e.key === 'ArrowDown') {
    if (actions && actions.dodge) {
      if (activeAction !== actions.dodge) {
        // Stop any currently playing action
        if (activeAction) {
          activeAction.stop();
        }

        // Set the action to play once
        actions.dodge.reset().setLoop(THREE.LoopOnce, 1); 
        actions.dodge.clampWhenFinished = true; // holds the last frame
        actions.dodge.play();

        // Listen for when the action finishes and stop it
        mixer.addEventListener('finished', () => {
          if (activeAction === actions.dodge) {
            // After dodge finishes, go back to idle
            actions.idle.reset().play();
            activeAction = actions.idle;
          }
        });
        activeAction = actions.dodge; // Set active action
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
