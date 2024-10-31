<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

import jump from '@/assets/game/animations/Jumping.fbx'
import dodge from '@/assets/game/animations/Dodging Right.fbx'
import idle from '@/assets/game/animations/Idle.fbx'
import xbot from '@/assets/game/X Bot.fbx'
import texture from '@/assets/game/fire-edge-blue.jpg'
import corridor_obj from '@/assets/game/Corridor.obj'
import corridor_mtl from '@/assets/game/Corridor.mtl'
import drone_obj from '@/assets/game/DroidOBJ/SciFiDroid.obj'
import drone_mtl from '@/assets/game/DroidOBJ/SciFiDroid.mtl'

const canvasRef = ref(null);

let scene, camera, renderer, character, mixer, activeAction;
let actions = {}

onMounted(() => {
  initThreeJS();
  loadCharacter();
  animate();
  loadDrone();
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
  camera.lookAt(0, 0, -1); // Look at point
  
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.value });
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  loadCorridor()
  addLights()
}

function loadDrone() {
  const mtlLoader = new MTLLoader();
  mtlLoader.load(drone_mtl, (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load(drone_obj, (object) => {
      scene.add(object);
      animate();
    });
  });
}


function loadCorridor() {
  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();

  mtlLoader.load(corridor_mtl, (materials) => {
    materials.preload();
    objLoader.setMaterials(materials);
    
    objLoader.load(corridor_obj, (object) => {
      object.scale.setScalar(0.02); // Adjust scale as needed
      // object.position.set(0, -1.5, -2); // Match character position
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(object);
    }, 
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
      console.error('Error loading model:', error);
    });
  });
}

function loadCharacter() {
  const loader = new FBXLoader();
  const textureLoader = new THREE.TextureLoader();

  loader.load(xbot, (fbx) => {
    character = fbx;
    character.scale.setScalar(0.02);
    character.position.set(0, -1.5, -2);
    character.traverse((c) => {
      if (c.isMesh) {
        c.material = new THREE.MeshMatcapMaterial({
          matcap: textureLoader.load(texture),
        });
        c.castShadow = true;
      }
    });
    
    // Set up animation mixer
    mixer = new THREE.AnimationMixer(character);

    loader.load(idle, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.idle= mixer.clipAction(anim)
      actions.idle.play(); // Play idle animation by default
      activeAction = actions.idle; // Set idle as the active action
    });
    

    loader.load(jump, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.jump = mixer.clipAction(anim);
    });

    loader.load(dodge, (animFbx) => {
      const anim = animFbx.animations[0];
      actions.dodge = mixer.clipAction(anim);
    });

    scene.add(character);

  });
}

// function addPlane() {
//   const width = 10; // Width of the plane
//   const length = 10000; // Length of the plane 
//   const geometry = new THREE.PlaneGeometry(width, length);
//   const material = new THREE.MeshStandardMaterial({ color: 0x001020 });
  
//   const plane = new THREE.Mesh(geometry, material);
//   plane.rotation.x = Math.PI * -0.5; // Rotate the plane to lie flat (facing upwards)
//   plane.receiveShadow = true;
//   plane.position.y = -1.5; // Adjust position if needed
  
//   scene.add(plane);
// }

function addLights() {
  const sunLight = new THREE.DirectionalLight(0xffffff, 10);
  sunLight.position.set(2, 4, 3);
  sunLight.castShadow = true;
  scene.add(sunLight);
}

function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(0.016); // Update animations (assuming 60fps)
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
