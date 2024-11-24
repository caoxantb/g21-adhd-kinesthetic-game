import { defineStore } from "pinia";

export const useKinectStore = defineStore("kinect", {
  state: () => ({
    address: "192.168.56.1",
    //body: null,
  }),
  //getters: {
  //  head: state => state.body.joints[kinectron.HEAD].depthY,
  //  neck: state => state.body.joints[kinectron.NECK].depthY,
  //},
  //actions: {
  //  initKinectron() {
      // define and create an instance of kinectron
  //    kinectron = new Kinectron(this.address);

      // Set kinect type to "azure" or "windows"
  //    kinectron.setKinectType("windows");
    
      // connect with application over peer
  //    kinectron.makeConnection();
    
      // request all tracked bodies and pass data to your callback
  //    kinectron.startTrackedBodies(this.storeBody);
  //  },
  //  storeBody(body) {
  //    this.body = body;
  //  },
  //},
});