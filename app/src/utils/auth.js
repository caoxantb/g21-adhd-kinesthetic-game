import { useAuthStore } from "@/stores/auth";
import router from "@/router";

export function setUser(user) {
  return localStorage.setItem("user", JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem("user");
  return JSON.parse(user) || null;
}

export function deleteUser() {
  localStorage.removeItem("user");

  const auth = useAuthStore();
  auth.$reset();

  router.push("login");
}
