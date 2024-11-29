<script setup>
import { ref, onMounted } from "vue";

import skeleton from "@/assets/icons/skeleton.png";

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  success: {
    type: Number,
    default: 0,
  },
  fail: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["jump"]);

function triggerJump() {
  emit("jump");
}
</script>

<template>
  <div class="right-bar">
    <div class="progress-box">
      <el-progress
        type="circle"
        :percentage="progress"
        :stroke-width="10"
        color="#4e8c40c7"
      >
        <template #default="{ percentage }">
          <span class="percentage-value">{{ percentage }}%</span>
        </template>
      </el-progress>
    </div>

    <div class="action-box">
      <div class="action-title">ACTION</div>
      <div class="action-number">SUCCESS: {{ success }}</div>
      <div class="action-number">FAIL: {{ fail }}</div>
    </div>

    <!-- <img class="skeleton" :src="skeleton" alt="" /> -->

    <!-- <el-button size="large" @click="triggerJump">Jump</el-button> -->
  </div>
</template>

<style scoped>
.right-bar {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 420px;
  padding: 20px 20px 20px 0;
  font-family: "Graduate", serif;
}

.progress-box {
  margin-bottom: 30px;
  text-align: right;
}

.percentage-value {
  display: block;
  color: var(--color-black);
  width: 100%;
}

.action-box {
  text-align: right;
  padding-right: 20px;
}

.action-title {
  font-size: 40px;
}

.action-number {
  font-size: 24px;
}

.skeleton {
  width: 100%;
}
</style>
