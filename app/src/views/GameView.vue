<script setup>
import { ref, onBeforeMount, onMounted, onUnmounted } from "vue";
import LeftBar from "@/components/LeftBar.vue";
import RightBar from "@/components/RightBar.vue";
import Game from "@/game/index.js";
import { useGameStore } from "@/stores/game";
import { useKinectStore } from "@/stores/kinect";

const store = useGameStore();
const kinect = useKinectStore();

const canvas = ref(null);
let kinectron = null;
let game = null;

let basehead = null;
let jumping = false;
const height = 500;

onBeforeMount(() => {});

onMounted(async () => {
  game = new Game(canvas.value);
  initKinectron();
});

onUnmounted(() => {
  if (game) {
    game.destroy();
  }
});

function initKinectron() {
  // define and create an instance of kinectron
  kinectron = new Kinectron(kinect.address);
  
  // Set kinect type to "azure" or "windows"
  kinectron.setKinectType("windows");

  // connect with application over peer
  kinectron.makeConnection();

  // request all tracked bodies and pass data to your callback
  kinectron.startTrackedBodies(jumpDetection);
}

function jumpDetection(body) {
  var head = body.joints[kinectron.HEAD].depthY;
  var neck = body.joints[kinectron.NECK].depthY;

  if(basehead === null) {
    basehead = head*height;
  }

  if(neck*height - head*height >= 50 || neck*height - head*height <= 10) {
    console.log("WRONG POSITION!!!!!");
    basehead = null;
    return;
  }

  if(!jumping && basehead - head*height >= 50) {
    jumping = true;
    console.log("JUMP DETECTED!!!!!");
    game.jump();
  }
  else if(jumping && basehead - head*height < 50) {
    jumping = false;
  }
}
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
