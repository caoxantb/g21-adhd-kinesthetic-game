<script setup>
import { ref, onBeforeMount, onMounted, onUnmounted } from "vue";
import LeftBar from "@/components/LeftBar.vue";
import RightBar from "@/components/RightBar.vue";
import Game from "@/game/index.js";
import { useGameStore } from "@/stores/game";

const store = useGameStore();

const canvas = ref(null);
let game = null;

onBeforeMount(() => {});

onMounted(async () => {
  game = new Game(canvas.value);
});

onUnmounted(() => {
  if (game) {
    game.destroy();
  }
});
</script>

<template>
  <div class="container">
    <LeftBar :progress="store.progress" :coins="store.coins"></LeftBar>
    <canvas ref="canvas" id="game"></canvas>
    <RightBar
      :progress="store.accuracy"
      :success="store.success"
      :fail="store.fail"
    ></RightBar>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
}

#game {
  width: 100%;
  height: 100%;
}
</style>
