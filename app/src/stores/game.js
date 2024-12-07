import { defineStore } from "pinia";

export const useGameStore = defineStore("game", {
  state: () => ({
    timePassed: 0,
    duration: 900000,
    coins: 0,
    accuracy: 0,
    success: 0,
    fail: 0,
  }),
  getters: {
    progress: state => (state.timePassed / state.duration) * 100,
  },
  actions: {
    updateCoins(coins) {
      this.coins = this.coins + coins;
    },
  },
});
