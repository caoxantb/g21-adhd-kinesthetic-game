<script setup>
import { useAuthStore } from "@/stores/auth";
import { COLOR_WHITE } from "@/constants/";

const auth = useAuthStore();

async function logout() {
  try {
    await auth.logout();
  } catch (err) {}
}
</script>

<template>
  <div class="container">
    <div class="header">
      <div class="logo">Game Logo</div>
      <el-button :color="COLOR_WHITE" @click="logout">Logout</el-button>
    </div>
    <div class="main">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  width: 80%;
  max-width: 1280px;
  height: 100%;
  padding: 30px 0;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
  padding-left: 40px;
}

.logo {
  font-size: 32px;
}

.main {
  border-radius: 50px;
  background-color: var(--color-white);
  overflow: hidden;
  flex-grow: 1;
}

.el-button {
  --el-button-active-bg-color: var(--color-white) !important;
  --el-button-active-border-color: var(--text-color) !important;
}

.el-button:hover {
  opacity: 0.7;
}

.el-button:active {
  opacity: 0.8;
}
</style>
