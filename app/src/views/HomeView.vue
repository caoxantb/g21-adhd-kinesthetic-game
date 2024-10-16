<script setup>
import { ref } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import skeleton from "@/assets/skeleton.png";
import { COLOR_RED } from "@/constants/";

const username = ref("Player Name");
const age = ref(8);

const level = ref(3);
const score = ref(56);

const histories = ref([
  {
    date: "Sept 23",
    level: 3,
    score: 12,
    time: 12.3,
  },
  {
    date: "Sept 20",
    level: 3,
    score: 12,
    time: 12.3,
  },
  {
    date: "Sept 18",
    level: 3,
    score: 8,
    time: 12.3,
  },
  {
    date: "Sept 06",
    level: 3,
    score: 12,
    time: 12.3,
  },
  {
    date: "Sept 04",
    level: 3,
    score: 12,
    time: 12.3,
  },
]);
</script>

<template>
  <MainLayout>
    <div class="container">
      <div class="left">
        <img class="skeleton" :src="skeleton" alt="" />
        <el-button size="large" :color="COLOR_RED" class="button-large"
          >Start New Game</el-button
        >
      </div>
      <div class="right">
        <div class="user-box">
          <div>
            <div class="username">Username</div>
            <div>{{ username }}</div>
            <div>Age: {{ age }}</div>
          </div>
          <div class="avatar"></div>
        </div>

        <div class="data-box">
          <div class="level-box">
            <div>Level</div>
            <div class="level">{{ level }}</div>
          </div>

          <div class="score-box">
            <div>Total Score</div>
            <div class="score">{{ score }}</div>
          </div>
        </div>

        <div class="history-box">
          <div
            class="history-item"
            v-for="(history, index) in histories"
            :key="index"
          >
            <div>{{ history.date }}</div>
            <div>Level {{ history.level }}</div>
            <div>Score {{ history.score }}</div>
            <div>{{ history.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.container {
  height: 100%;
  display: flex;
}

.left {
  width: 52%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  background: #fbfbfb;
}

.skeleton {
  display: block;
  max-height: 80%;
  object-fit: contain;
}

.button-large {
  width: 80%;
  height: 70px !important;
  margin-top: 10px;
  font-size: 24px;
}

.right {
  width: 48%;
  height: 100%;
  background: var(--color-primary);
  display: flex;
  flex-direction: column;
  color: var(--color-white);
  padding-bottom: 30px;
}

.user-box {
  padding: 30px 60px;
  display: flex;
  justify-content: space-between;
}

.username {
  font-size: 16px;
}

.avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: var(--color-white);
}

.data-box {
  display: flex;
  justify-content: center;
}

.level-box,
.score-box {
  width: 50%;
  padding: 20px;
  font-size: 16px;
  position: relative;
  text-align: center;
}

.level-box::after {
  content: "";
  display: block;
  width: 1px;
  height: 70%;
  background: var(--color-white);
  position: absolute;
  top: 15%;
  right: 0;
}

.level,
.score {
  font-size: 64px;
}

.history-box {
  padding: 0 30px;
  overflow: auto;
}

.history-box::-webkit-scrollbar {
  display: none;
}

.history-item {
  height: 82px;
  border-radius: 15px;
  background: rgba(217, 217, 217, 0.28);
  margin-bottom: 26px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
