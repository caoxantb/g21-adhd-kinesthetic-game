<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import { reactive, ref } from "vue";

const kinectAddress = ref("");

// 0 not connected, 1 is connected
const configured = ref(0);

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
          <el-button class="configure-button">Configure</el-button>
        </div>
        <div class="buttons-box">
          <el-button class="play-button">Single Player</el-button>
          <el-button class="play-button">Multiplayer</el-button>
          <el-button class="back-button">Close</el-button>
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
  margin-bottom: 50px;
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
}

.play-button {
  height: 80px !important;
  margin-bottom: 20px;
  width: 400px;
}

.back-button {
  height: 40px !important;
  width: 100px;
}

.el-button+.el-button {
  margin-left: 0px;
}

</style>