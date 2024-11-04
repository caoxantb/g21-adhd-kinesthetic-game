<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import { Back, RefreshLeft, Timer } from "@element-plus/icons-vue"
import { watch, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const kinectAddress = ref("");

// 0 not connected, 1 is connected
const configured = ref(0);

// For resizing the canvas according to the parent div.
const divWidth = ref(0);
const divHeight = ref(0);
const skeleton = ref(null);
const gameEnded = ref(1);
let p5_canv = null;

let kinectron = null;

watch(skeleton, (newSkeleton) => {
  if(newSkeleton) {
    divWidth.value = newSkeleton.offsetWidth;
    divHeight.value = newSkeleton.offsetHeight;
  }
})

// For setting up the canvas.
const s = (sketch) => {

  sketch.setup = () => {
    sketch.createCanvas(divWidth.value, divHeight.value);
  };

  // Here you can draw the body.
  sketch.draw = () => {
    sketch.background(255);
  };

  sketch.windowResized = () => {
    try {
      divWidth.value = skeleton.value.offsetWidth;
      divHeight.value = skeleton.value.offsetHeight;
      sketch.resizeCanvas(divWidth.value, divHeight.value);
    }
    catch (e) {
      console.log("Not configured", e);
    }

  }

};

const connectKinect = () => {

  // try {
  //   kinectron = Kinectron(kinectAddress);
  //   kinectron.setKinectType("windows");
  //   kinectron.makeConnection();
  //   configured.value = 1;
  // }
  // catch (e) {
  //   console.log("Could not connect to kinect", e);
  //   configured.value = 0;
  // }

  if(configured.value) {
    configured.value = 0;
  }
  else {
    configured.value = 1;

    // Setting the canvas once the kinect has been connected.
    setTimeout(() => {
    divWidth.value = skeleton.value.offsetWidth;
    divHeight.value = skeleton.value.offsetHeight;

    if (!p5_canv) {
      p5_canv = new p5(s, "skeleton");
    }
    else {
      p5_canv.resizeCanvas(divWidth.value, divHeight.value);
    }
    }, 100);
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
        <el-link :underline="false" class="back-button" @click="close" :icon="Back">Back</el-link>
        <div class="stats-box" v-if="gameEnded">
          <el-text class="goodgame-text">Good Game!</el-text>
          <span class="minutes-box">
            <el-icon :size="24" style="padding-bottom: 2px"><Timer /></el-icon>
            <el-text class="minutes-text">8.03 minutes</el-text>
          </span>
          <span class="resets-box">
            <el-icon :size="24" style="padding-bottom: 2px"><RefreshLeft /></el-icon>
            <el-text class="resets-text">7 resets</el-text>
          </span>
        </div>
        <div class="buttons-box">
          <el-button class="single-button" v-bind:disabled="!configured">Single Player</el-button>
          <el-button class="multi-button" v-bind:disabled="!configured">Multiplayer</el-button>
        </div>
      </div>
      <div class="right">
        <div class="text-box">
          <el-text v-if="!configured">Kinect device not connected</el-text>
          <el-text v-else>Kinect device connected</el-text>
        </div>
        <div class="input-box">
          <el-input placeholder="Enter kinect IP address" class="configure-input" v-model="kinectAddress" />
          <el-button class="configure-button" @click="connectKinect">Connect</el-button>
        </div>
        <div v-show="configured" id="skeleton" ref="skeleton">
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
  align-items: center;
  color: var(--color-white);
  padding-bottom: 30px;
}

.stats-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 70px;
}

.goodgame-text {
  color: var(--color-green);
  font-size: 40px;
}

.minutes-text, .resets-text {
  color: var(--color-black);
  display: flex;
  flex-direction: row;
  margin-left: 6px;
  font-weight: 500;
  font-size: 17px;
}

.resets-box, .minutes-box {
  display: flex;
  flex-direction: row;
  align-items: center;
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
  margin-left: 5px;
  margin-right: 5px;
  width: 58%;
}

.configure-input {
  --el-border-radius-base: 3px;
  --el-input-bg-color: rgb(238, 238, 238);
  --el-input-focus-border-color: none;
  --text-color-tertiary: var(--color-black);
  font-size: 16px;
  width: 90%;
  min-width: 200px;
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

.single-button, .multi-button {
  height: 95px !important;
  margin-bottom: 20px;
  width: 350px;
  --el-border-radius-base: 20px;
  --el-font-size-base: 30px;
  color: var(--color-white);
}

.single-button {
  --el-button-bg-color: var(--color-red);
  --el-button-hover-bg-color: var(--color-light-red);
}

.multi-button {
  --el-button-bg-color: var(--text-color-tertiary);
  --el-button-hover-bg-color: var(--color-light-gray);
}

.single-button.is-disabled, .single-button.is-disabled:hover  {
  background-color: var(--color-red);
  opacity: 0.7;
  color: var(--color-white);
}

.multi-button.is-disabled, .multi-button.is-disabled:hover {
  background-color: var(--text-color-tertiary);
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
  min-width: 60%;
  width: 50%;
  height: 70%;
}


</style>