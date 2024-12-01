import { defineStore } from "pinia";

export const useKinectStore = defineStore("kinect", {
  state: () => ({
    address: "192.168.56.1",
    postures: [
      {
        "id": "Alpha",
        "alpha": 45,
        "beta": 0,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Semaphore_Alpha.svg/2560px-Semaphore_Alpha.svg.png"
      },
      {
        "id": "Bravo",
        "alpha": 90,
        "beta": 0,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Semaphore_Bravo.svg/2560px-Semaphore_Bravo.svg.png"
      },
      {
        "id": "Charlie",
        "alpha": 135,
        "beta": 0,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Semaphore_Charlie.svg/2560px-Semaphore_Charlie.svg.png"
      },
      {
        "id": "Delta",
        "alpha": 180,
        "beta": 0,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Semaphore_Delta.svg/2560px-Semaphore_Delta.svg.png"
      },
      {
        "id": "Echo",
        "alpha": 0,
        "beta": 135,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Semaphore_Echo.svg/2560px-Semaphore_Echo.svg.png"
      },
      {
        "id": "Foxtrot",
        "alpha": 0,
        "beta": 90,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Semaphore_Foxtrot.svg/2560px-Semaphore_Foxtrot.svg.png"
      },
      {
        "id": "Golf",
        "alpha": 0,
        "beta": 45,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Semaphore_Golf.svg/2560px-Semaphore_Golf.svg.png"
      },
      {
        "id": "Hotel",
        "alpha": 90,
        "beta": 45,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Semaphore_Hotel.svg/2560px-Semaphore_Hotel.svg.png",
        "oneSide": true
      },
      {
        "id": "India",
        "alpha": 135,
        "beta": 45,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Semaphore_India.svg/2560px-Semaphore_India.svg.png",
        "oneSide": true
      },
      {
        "id": "Juliet",
        "alpha": 180,
        "beta": 90,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Semaphore_Juliet.svg/2560px-Semaphore_Juliet.svg.png"
      },
      {
        "id": "Kilo",
        "alpha": 45,
        "beta": 180,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Semaphore_Kilo.svg/2560px-Semaphore_Kilo.svg.png"
      },
      {
        "id": "Lima",
        "alpha": 45,
        "beta": 135,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Semaphore_Lima.svg/2560px-Semaphore_Lima.svg.png"
      },
      {
        "id": "Mike",
        "alpha": 45,
        "beta": 90,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Semaphore_Mike.svg/2560px-Semaphore_Mike.svg.png"
      },
      {
        "id": "November",
        "alpha": 45,
        "beta": 45,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Semaphore_November.svg/2560px-Semaphore_November.svg.png"
      },
      {
        "id": "Oscar",
        "alpha": 90,
        "beta": 135,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Semaphore_Oscar.svg/2560px-Semaphore_Oscar.svg.png",
        "oneSide": true
      },
      {
        "id": "Papa",
        "alpha": 90,
        "beta": 180,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Semaphore_Papa.svg/2560px-Semaphore_Papa.svg.png"
      },
      {
        "id": "Quebec",
        "alpha": 90,
        "beta": 135,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Semaphore_Quebec.svg/2560px-Semaphore_Quebec.svg.png"
      },
      {
        "id": "Romeo",
        "alpha": 90,
        "beta": 90,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Semaphore_Romeo.svg/2560px-Semaphore_Romeo.svg.png"
      },
      {
        "id": "Sierra",
        "alpha": 90,
        "beta": 45,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Semaphore_Sierra.svg/2560px-Semaphore_Sierra.svg.png"
      },
      {
        "id": "Tango",
        "alpha": 135,
        "beta": 180,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Semaphore_Tango.svg/2560px-Semaphore_Tango.svg.png"
      },
      {
        "id": "Uniform",
        "alpha": 135,
        "beta": 135,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Semaphore_Uniform.svg/2560px-Semaphore_Uniform.svg.png"
      },
      {
        "id": "Victor",
        "alpha": 180,
        "beta": 45,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Semaphore_Victor.svg/2560px-Semaphore_Victor.svg.png"
      },
      {
        "id": "Whiskey",
        "alpha": 135,
        "beta": 90,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Semaphore_Whiskey.svg/2560px-Semaphore_Whiskey.svg.png",
        "oneSide": true
      },
      {
        "id": "X-ray",
        "alpha": 120,
        "beta": 0,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Semaphore_X-ray.svg/2560px-Semaphore_X-ray.svg.png",
        "oneSide": true
      },
      {
        "id": "Yankee",
        "alpha": 135,
        "beta": 90,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Semaphore_Yankee.svg/2560px-Semaphore_Yankee.svg.png",
        "oneSide": true
      },
      {
        "id": "Zulu",
        "alpha": 45,
        "beta": 90,
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Semaphore_Zulu.svg/2560px-Semaphore_Zulu.svg.png",
        "oneSide": true
      }
    ],
  }),
  actions: {
    getAddress(kinectAddress) {
      this.address = kinectAddress;
    },
  },
});