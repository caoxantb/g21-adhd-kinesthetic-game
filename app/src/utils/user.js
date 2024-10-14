import { useUserStore } from "@/stores/user";

export function setUser(user) {}

export function getUser() {}

export function deleteUser() {
  const user = useUserStore();
  user.$reset();
}
