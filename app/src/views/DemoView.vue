<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import LeftBar from "@/components/LeftBar.vue";
import RightBar from "@/components/RightBar.vue";

import * as THREE from "three";

const main = ref(null);
let scene, camera, renderer;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color().setHex(0xa0a0a0);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);

  main.value.appendChild(renderer.domElement);

  camera.position.z = 5;
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.render(scene, camera);
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});
</script>

<template>
  <div class="container">
    <LeftBar :progress="30" :coins="1000"></LeftBar>
    <div ref="main"></div>
    <RightBar :progress="25" :success="4" :fail="2"></RightBar>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
}
</style>
