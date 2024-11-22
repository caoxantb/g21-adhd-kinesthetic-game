<script setup>
import { ref, onBeforeMount, onMounted, onUnmounted } from "vue";
import LeftBar from "@/components/LeftBar.vue";
import RightBar from "@/components/RightBar.vue";
import GameStatsPopup from "@/components/GameStatsPopup.vue";
import Game from "@/game/index.js";
import { useGameStore } from "@/stores/game";

const store = useGameStore();
const canvas = ref(null);
let game = null;

function onJump() {
 game.player?.jump();
}

function handleGameComplete() {
 console.log('Handling game/block completion');
 store.toggleStats(true);
}

onMounted(async () => {
 game = new Game(canvas.value);
 game.on('complete', handleGameComplete);
 game.on('blockComplete', handleGameComplete);
 console.log('Event listeners added for complete and blockComplete');
});

onUnmounted(() => {
 game?.off('complete', handleGameComplete);
 game?.off('blockComplete', handleGameComplete);
 console.log('Event listeners removed');
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
     @jump="onJump"
   ></RightBar>

   <GameStatsPopup
     v-model:visible="store.showStats"
     :stats="{
       successRate: store.successRate,
       failRate: store.failRate,
       timeLeft: store.timeLeft,
       coins: store.coins
     }"
   />
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