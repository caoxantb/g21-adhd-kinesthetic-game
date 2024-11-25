import { defineStore } from "pinia";

export const useKinectStore = defineStore("kinect", {
  state: () => ({
    address: "192.168.56.1",
  }),
});