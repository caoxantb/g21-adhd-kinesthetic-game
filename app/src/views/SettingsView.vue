<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import { watch, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const kinectAddress = ref("");
const isDisabled = ref(true);

// 0 not connected, 1 is connected
const configured = ref(0);

const divWidth = ref(0);
const divHeight = ref(0);
const skeleton = ref(null);

watch(skeleton, (newSkeleton) => {
  if(newSkeleton) {
    divWidth.value = newSkeleton.offsetWidth;
    divHeight.value = newSkeleton.offsetHeight;
  }
})

let kinectron = null;
const s = ( sketch ) => {

  let x = 100;
  let y = 100;

  sketch.setup = () => {
    sketch.createCanvas(200, 200);
  };

  sketch.draw = () => {
    sketch.background(0);
    sketch.fill(255);
    sketch.rect(x,y,50,50);
  };

  sketch.windowResized = () => {
    divWidth.value = skeleton.value.offsetWidth;
    divHeight.value = skeleton.value.offsetHeight;
    sketch.resizeCanvas(divWidth.value - 100, divHeight.value - 50);
  }

};

let myp5 = new p5(s, "skeleton");

const connectKinect = () => {

  try {
    kinectron = Kinectron(kinectAddress);
    kinectron.setKinectType("windows");
    kinectron.makeConnection();
    configured.value = 1;
    isDisabled.value = false;
  }
  catch (e) {
    console.log("Could not connect to kinect", e);
    configured.value = 0;
    isDisabled.value = true;
  }

};

const close = () => {
  router.push("home");
};

</script>


<template>
  <MainLayout>
    <div class="container">
      <div class="left">
        <el-link :underline="false" class="back-button" @click="close">🡐 Back</el-link>
        <div class="buttons-box">
          <el-button class="play-button" v-bind:disabled="isDisabled">Single Player</el-button>
          <el-button class="play-button" v-bind:disabled="isDisabled">Multiplayer</el-button>
        </div>
      </div>
      <div class="right">
        <div class="text-box">
          <el-text v-if="configured == 0">Kinect device not connected</el-text>
          <el-text v-else>Kinect device connected</el-text>
        </div>
        <div class="input-box">
          <el-input placeholder="Enter kinect IP address" class="configure-input" v-model="kinectAddress" />
          <el-button class="configure-button" @click="connectKinect">Connect</el-button>
        </div>
        <div v-if="configured" id="skeleton" ref="skeleton">
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>

.el-text {
  font-size: 20px;
  margin-bottom: 5px;
  color: var(--color-white)
}

.container {
  height: 100%;
  min-height: 80%;
  display: flex;
}

.left {
  width: 52%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  padding: 30px;
  background: #fbfbfb;
}

.right {
  width: 48%;
  height: 100%;
  background: var(--color-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--color-white);
  padding-bottom: 30px;
}

.text-box {
  display: flex;
  justify-content: center;
}

.input-box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 40px;
}

.configure-input {
  --el-border-radius-base: 3px;
  --el-input-bg-color: rgb(238, 238, 238);
  --el-input-focus-border-color: none;
  --text-color-tertiary: var(--color-black);
  font-size: 16px;
  width: 45%;
}

.configure-button {
  margin-left: 10px;
  width: 100px;
  height: 40px !important;
  --el-button-bg-color: var(--color-green);
  --el-button-hover-bg-color: var(--color-blue);
  color: var(--color-white);
}

.buttons-box {
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
}

.play-button {
  height: 95px !important;
  margin-bottom: 20px;
  width: 350px;
  --el-border-radius-base: 20px;
  --el-font-size-base: 30px;
  --el-button-bg-color: var(--color-red);
  --el-button-hover-bg-color: var(--color-light-red);
  color: var(--color-white);
}

.play-button.is-disabled, .play-button.is-disabled:hover {
  background-color: var(--color-red);
  opacity: 0.7;
  color: var(--color-white);
}

.back-button {
  --el-link-font-size: 30px;
  --el-link-text-color: var(--color-black);
  position: absolute;
  left: 35px;
  top: 25px;
}

.el-button+.el-button {
  margin-left: 0px;
}

#skeleton {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 70%;
}




</style>