import { defineStore } from "pinia";
import { getUser, setUser, deleteUser } from "@/utils/user";
import api from "@/api/";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: getUser() || null,
  }),
  getters: {},
  actions: {
    async login(data) {
      const res = await api.post("/users/login", data);
      this.user = res;

      setUser(res);
    },
    async register(data) {
      const res = await api.post("/users/register", data);
      this.user = res;

      setUser(res);
    },
    async logout() {
      await api.post("/users/logout");

      deleteUser();
    },
    async current() {
      const res = await api.get("/users/current");
      
      setUser(res);
    },
  },
});
