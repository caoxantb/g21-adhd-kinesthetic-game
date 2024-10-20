<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const kinectAddress = ref("");
const isDisabled = ref(true);

// 0 not connected, 1 is connected
const configured = ref(0);

let kinectron = null;

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
      <div class="main">
        <div class="text-box">
          <el-text v-if="configured == 0">Kinect device not connected</el-text>
          <el-text v-else>Kinect device connected</el-text>
        </div>
        <div class="input-box">
          <el-input placeholder="Enter kinect IP address" class="configure-input" v-model="kinectAddress" />
          <el-button class="configure-button" @click="connectKinect">Configure</el-button>
        </div>
        <div class="buttons-box">
          <el-button class="play-button" v-bind:disabled="isDisabled">Single Player</el-button>
          <el-button class="play-button" v-bind:disabled="isDisabled">Multiplayer</el-button>
          <el-button class="back-button" @click="close">Close</el-button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>

.el-text {
  font-size: 25px;
  margin-bottom: 5px;
}

.container {
  height: 100%;
  min-height: 80%;
  display: flex;
  justify-content: center;
}

.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  --el-border-radius-base: 0px;
  --el-input-bg-color: rgb(238, 238, 238);
  --el-input-focus-border-color: none;
  --text-color-tertiary: var(--color-black);
  font-size: 16px;
  width: 200px;
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
  align-items: flex-end;
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
  height: 40px !important;
  width: 100px;
}

.el-button+.el-button {
  margin-left: 0px;
}



</style>