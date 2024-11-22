<!-- GameStatsPopup.vue -->
<template>
    <div class="stats-overlay" @click="$emit('update:visible', false)" v-if="visible">
      <h1 class="title">Block {{ blockNumber }} Completed!</h1>
      
      <div class="stats-grid">
        <div class="stat-item">
          <el-icon class="success-icon"><circle-check /></el-icon>
          <div class="stat-content">
            <span class="stat-label">Success</span>
            <span class="stat-value">{{ stats.successRate }}%</span>
          </div>
        </div>
  
        <div class="stat-item">
          <el-icon class="fail-icon"><circle-close /></el-icon>
          <div class="stat-content">
            <span class="stat-label">Fails</span>
            <span class="stat-value">{{ stats.failRate }}%</span>
          </div>
        </div>
  
        <div class="stat-item">
          <el-icon class="time-icon"><timer /></el-icon>
          <div class="stat-content">
            <span class="stat-label">Time Left</span>
            <span class="stat-value">{{ stats.timeLeft }}</span>
          </div>
        </div>
  
        <div class="stat-item">
          <el-icon class="coin-icon"><Medal /></el-icon>
          <div class="stat-content">
            <span class="stat-label">Coins</span>
            <span class="stat-value">{{ stats.coins }}</span>
          </div>
        </div>
      </div>
  
      <div class="footer">
        © 2024 ADHD Kinesthetic Game - Group 21
      </div>
    </div>
  </template>
  
  <script setup>
  import { CircleCheck, CircleClose, Timer, Medal } from '@element-plus/icons-vue'
  import { useGameStore } from "@/stores/game"
  
  const store = useGameStore()
  
  defineProps({
    visible: {
      type: Boolean,
      required: true
    },
    stats: {
      type: Object,
      required: true,
      default: () => ({
        successRate: 0,
        failRate: 0,
        timeLeft: '0:00',
        coins: 0
      })
    },
    blockNumber: {
      type: Number,
      default: 1
    }
  })
  
  defineEmits(['update:visible'])
  </script>
  
  <style scoped>
  .stats-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    z-index: 9999;
    padding: 4rem 2rem;
  }
  
  .title {
    font-size: 3rem;
    color: white;
    margin-bottom: 2rem;
    text-align: center;
    font-weight: bold;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    width: 90%;
    max-width: 800px;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(4px);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .el-icon {
    font-size: 3rem;
  }
  
  .success-icon {
    color: #4ade80;
  }
  
  .fail-icon {
    color: #f87171;
  }
  
  .time-icon {
    color: #60a5fa;
  }
  
  .coin-icon {
    color: #fbbf24;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-label {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: white;
  }
  
  .footer {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }
  </style>