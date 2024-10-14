import { defineStore } from "pinia";
import { getUser } from "@/utils/user";

export const useUsertore = defineStore("user", {
  state: () => ({
    user: getUser() || null,
  }),
  getters: {},
  actions: {
    async login(data) {},
    async logout() {},
  },
});
