<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import dancing from '@/assets/game/animations/Dancing.fbx'
import hiphop from '@/assets/game/animations/Hip Hop Dancing.fbx'
import snatch from '@/assets/game/animations/Snatch.fbx'
import xbot from '@/assets/game/X Bot.fbx'
import texture from '@/assets/game/fire-edge-blue.jpg'



const canvasRef = ref(null);

let scene, camera, renderer, controls, character, actions, previousAction;
onMounted(() => {
  initThreeJS();
  loadCharacter();
  animate();
  window.addEventListener("resize", handleWindowResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);
});

function initThreeJS() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
  camera.position.z = 7;
  
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.value });
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.dampingFactor = 0.05;

  // Add a simple light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Add a simple floor
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -1.5;
  scene.add(floorMesh);
}

function loadCharacter() {
  const loader = new FBXLoader();
  const textureLoader = new THREE.TextureLoader();

  loader.load(xbot, (fbx) => {
    character = fbx;
    character.scale.setScalar(0.02);
    character.position.set(0, -1.5, 0);
    character.traverse((c) => {
      if (c.isMesh) {
        if (c.material.name === "Alpha_Body_MAT") {
          c.material = new THREE.MeshMatcapMaterial({
            matcap: textureLoader.load(texture),
          });
        }
        c.castShadow = true;
      }
    });
    scene.add(character);
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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
  padding: 25px;
}

.main {
  border-radius: 50px;
  background-color: var(--color-white);
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 64px;
}
</style>
