<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
</script>

<template>
  <MainLayout>
    <div class="container">
      <div class="left"></div>
      <div class="right"></div>
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
}

.right {
  width: 48%;
  height: 100%;
  background: var(--color-primary);
}
</style>
