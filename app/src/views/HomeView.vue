<script setup>
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import MainLayout from "@/layouts/MainLayout.vue";
import skeleton from "@/assets/skeleton.png";
import { COLOR_RED } from "@/constants/";

const router = useRouter();
const auth = useAuthStore();

const tab = ref(0);
const leaderboards = ref([]);
const gameplays = ref([]);


async function getLeaderboards() {
  try {
    const res = await api.get("/users/leaderboards");
    leaderboards.value = res;
    console.log("Leaderboards: ", leaderboards.value);
  } catch (err) {}
}

async function getGameplays() {
  try {
    const res = await api.get(`gameplays/player/${auth.user.username}`);
    gameplays.value = res;
    console.log("Gameplays: ", gameplays.value);
  } catch (err) {
    console.log(err);
  }
}

function startNewGame() {
  router.push("settings");
}

onBeforeMount(async () => {
  getLeaderboards();
  getGameplays();
});
</script>

<template>
  <MainLayout>
    <div class="container">
      <div class="left">
        <img class="skeleton" :src="skeleton" alt="" />
        <el-button
          size="large"
          :color="COLOR_RED"
          class="button-large"
          @click="startNewGame"
          >Start New Game</el-button
        >
      </div>
      <div class="right">
        <div class="user-box">
          <div>
            <div class="username">Username</div>
            <div>{{ auth.user?.name }}</div>
            <div>Age {{ auth.user?.age }}</div>
          </div>
          <div class="avatar">
            <el-icon :size="60" color="#000000"><icon-ep-user /></el-icon>
          </div>
        </div>

        <div class="data-box">

          <div class="score-box">
            <div>Score</div>
            <div class="score">{{ auth.user?.totalScore }}</div>
          </div>
        </div>

        <div class="tab-box">
          <div class="tab-header">
            <div class="tab" :class="{ active: tab == 0 }" @click="tab = 0">
              Leaderboard
            </div>
            <div class="tab" :class="{ active: tab == 1 }" @click="tab = 1">
              Game History
            </div>
          </div>
        </div>

        <div class="tab-content" v-if="tab == 0">
          <div
            class="tab-item"
            v-for="(leaderboard, index) in leaderboards"
            :key="index"
          >
            <div class="tab-item-rank">{{ index + 1 }}</div>
            <div class="tab-item-name">{{ leaderboard.name }}</div>
            <div class="text-sm">Score {{ leaderboard.totalScore }}</div>
          </div>
        </div>

        <div class="tab-content" v-else>
          <div
            class="tab-item"
            v-for="(gameplay, index) in gameplays"
            :key="index"
          > 
            <div class="tab-item-rank">{{ index + 1 }}</div>
            <div class="text-sm">Score {{ gameplay.score }}</div>
            <div class="text-sm">{{ $filters.formatDate(gameplay.updatedAt) }}</div>
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
  display: flex;
  justify-content: center;
  align-items: center;
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

.tab-box {
  padding: 0 20px;
}

.tab-header {
  border-bottom: 2px solid var(--color-white);
  display: flex;
  justify-content: center;
}

.tab {
  padding: 5px 15px;
  cursor: pointer;
  color: #c8cdce;
  border: 1px solid transparent;
}

.tab.active {
  color: var(--color-white);
  background-color: rgb(217, 217, 217, 10%);
  border-color: var(--color-white);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
}

.tab-content {
  padding: 10px 30px 0;
  overflow: auto;
}

.tab-content::-webkit-scrollbar {
  display: none;
}

.tab-item {
  cursor: pointer;
  height: 52px;
  border-radius: 15px;
  background: rgba(217, 217, 217, 0.28);
  margin-bottom: 26px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  line-height: 52px;
  gap: 10px;
}

.tab-item > div {
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-item:hover {
  box-shadow: 0 0 5px 5px #98e1c6;
}

.tab-item-rank {
  flex: 0 0 15%;
}

.tab-item-name {
  flex: 0 0 33.3333%;
}

.icon-timer {
  position: relative;
  top: 4px;
}

.text-sm {
  font-size: 16px;
}

</style>
