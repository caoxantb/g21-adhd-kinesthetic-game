import { defineStore } from "pinia";

export const useGameStore = defineStore("game", {
  state: () => ({
    timePassed: 0,
    duration: 900000,
    coins: 0,
    accuracy: 0,
    success: 0,
    fail: 0,
    showStats: false,
    breakTimeLeft: 20,
  }),
  getters: {
    progress: state => (state.timePassed / state.duration) * 100,
    timeLeft: state => {
      const remaining = Math.max(0, state.duration - state.timePassed);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    successRate: state => {
      const total = state.success + state.fail;
      return total > 0 ? Math.round((state.success / total) * 100) : 0;
    },
    failRate: state => {
      const total = state.success + state.fail;
      return total > 0 ? Math.round((state.fail / total) * 100) : 0;
    }
  },
  actions: {
    updateCoins(coins) {
      this.coins = Math.max(this.coins + coins, 0);
    },
    toggleStats(show = true) {
      this.showStats = show;
    },
    setBreakTime(time) {
      this.breakTimeLeft = time;
    }
  },
});