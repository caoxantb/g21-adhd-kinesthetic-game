import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import GameView from "@/views/GameView.vue";
import { useAuthStore } from "@/stores/auth";
import SettingsView from "@/views/SettingsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/game",
      name: "game",
      component: GameView,
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
    },
    {
      path: "/:catchAll(.*)",
      redirect: "/",
    },
  ],
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.name !== "login" && !auth.hasUser) {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
