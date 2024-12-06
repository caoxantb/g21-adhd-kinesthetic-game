<script setup>
import { ref, onBeforeMount, onMounted, onUnmounted } from "vue";
import LeftBar from "@/components/LeftBar.vue";
import RightBar from "@/components/RightBar.vue";
import Game from "@/game/index.js";
import { calculateAccuracy, averageAccuracy } from "@/utils/postures";
import { useGameStore } from "@/stores/game";
import { useKinectStore } from "@/stores/kinect";

const store = useGameStore();
const kinect = useKinectStore();

const canvas = ref(null);
let kinectron = null;
let game = null;

let basehead = null;
let isJumping = false;
const height = 500;
let postureAccuracies = [];

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
  kinectron.startTrackedBodies(bodyTracked);
}

function bodyTracked(body) {
  if (game.currentPhase === "active") {
    var head = body.joints[kinectron.HEAD].depthY;
    var neck = body.joints[kinectron.NECK].depthY;

    jumpDetection(head, neck);
  } else if (game.currentPhase === "freezing") {
    if (game.remainingTime > 5) {
      let accuracy = calculateAccuracy(body, kinect.postures[17]);
      console.log("Accuracy: ", accuracy);
      postureAccuracies.push(accuracy);
    } else if (game.remainingTime === 5) {
      let accuracy = averageAccuracy(postureAccuracies);
      console.log("Average accuracy: ", accuracy);

      store.accuracy = Number(accuracy.toFixed(2));

      if (accuracy >= 90) {
        game.startTPose();
      }
      postureAccuracies = [];
    }
  }
}

function jumpDetection(head, neck) {
  if (basehead === null) {
    basehead = head * height;
  }

  if (
    neck * height - head * height >= 40 ||
    neck * height - head * height <= 10
  ) {
    console.log("WRONG POSITION!!!!!");
    basehead = null;
    return;
  }

  if (!isJumping && basehead - head * height >= 50) {
    isJumping = true;
    console.log("JUMP DETECTED!!!!!");
    game.jump();
  } else if (isJumping && basehead - head * height < 50) {
    isJumping = false;
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
