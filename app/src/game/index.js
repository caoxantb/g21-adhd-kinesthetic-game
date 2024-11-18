import * as THREE from "three";
import { useGameStore } from "@/stores/game";

import Environment from "./environment";
import Player from "./player";
import WallSystem from "./wall" 

import bgm from "@/assets/game/sounds/bgm.mp3";

// active time 170s, preparation time 10s, freezing time 15s - 45s, break time 20s, 4 blocks total 900s
export default class Game {
  constructor(canvas) {
    this.store = new useGameStore();
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.speed = 20;
    this.currentBlock = 1;
    this.currentPhaseIndex = 0; // To track the current phase in each block
    this.phases = ["active", "preparation", "freezing", "break"];
    this.phaseDurations = {
      active: 10,      // seconds
      preparation: 10,  // seconds
      freezing: 15,     // seconds (can be adjusted dynamically)
      break: 20         // seconds
    };
    this.currentPhase = this.phases[this.currentPhaseIndex];
    this.remainingTime = this.phaseDurations[this.currentPhase]; // Duration for the current phase
    this.init();
  }

  async init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#929292");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      precision: "mediump",
    });
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.name = "camera";
    this.camera.position.set(0, 20, 85);
    this.camera.lookAt(0, 0, 0);
    this.camera.rotation.x = -30 * (Math.PI / 180);
    this.scene.add(this.camera);

    const ambient = new THREE.AmbientLight(0xffffff, 2.5);
    this.scene.add(ambient);
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(0, 40, -10);
    this.scene.add(light);

    const listener = new THREE.AudioListener();
    this.camera.add(listener);
    this.sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    const buffer = await audioLoader.loadAsync(bgm);
    this.sound.setBuffer(buffer);
    this.sound.setLoop(true);
    this.sound.setVolume(0.7);
    this.sound.play();

    this.environment = new Environment(this.scene);
    this.player = new Player(this.scene);
    this.wallSystem = new WallSystem(this.scene)
    this.wallSystem.init()
    window.addEventListener("resize", this.onWindowResize.bind(this));
    window.addEventListener("click", () => this.startAudioContext(), { once: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.animate();
    this.startGameLoop();
  }

  startGameLoop() {
    this.interval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.transitionToNextPhase();
      }
    }, 1000);
  }

  transitionToNextPhase() {
    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
    this.currentPhase = this.phases[this.currentPhaseIndex];
    this.remainingTime = this.phaseDurations[this.currentPhase];

    if (this.currentPhaseIndex === 0) { // New block begins
      this.currentBlock++;
      if (this.currentBlock > 4) {
        this.onGameCompleted();
      } else {
        this.setupBlock();
      }
    }

    // Trigger phase-specific logic
    switch (this.currentPhase) {
      case "active":
        this.startActivePhase();
        break;
      case "preparation":
        this.startPreparationPhase();
        break;
      case "freezing":
        this.startFreezingPhase();
        break;
      case "break":
        this.startBreakPhase();
        break;
    }
  }

  setupBlock() {
    // Custom logic to reset or prepare for a new block
  }

  startActivePhase() {
    this.currentPhase = "active";
    console.log('active')
    // Any setup needed for active phase
  }

  startFreezingPhase() {
    this.currentPhase = "freezing";
    console.log('freezing')
    this.player.beforeFreeze();
    // Any setup needed for freezing phase
  }

  startPreparationPhase() {
    console.log('preparing')
    this.wallSystem.spawnWall()
    this.currentPhase = "preparation";
    // Any setup needed for preparation phase
  }

  startBreakPhase() {
    this.currentPhase = "break";
    console.log('break')
    // Any setup needed for break phase
  }

  onGameCompleted() {
    clearInterval(this.interval);
    // Logic for completing the game
  }

  active() {
    this.delta = this.clock.getDelta();
    this.environment.active(this.speed, this.delta);
    this.player.active(this.delta);
  }

  prepare() {
    this.delta = this.clock.getDelta()
    this.environment.active(this.speed, this.delta)
    this.player.active(this.delta)
    this.wallSystem.update(this.delta, this.speed)
  }

  freeze() {
    this.delta = this.clock.getDelta();
    this.environment.freeze();
    this.player.freeze(this.delta);
  }

  animate() {
    if (this.currentPhase === "active") {
      this.active();
    } else if (this.currentPhase === "preparation") {
      this.prepare()
    } else if (this.currentPhase === "freezing") {
      this.freeze();
    } else {
      this.freeze()
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  async startAudioContext() {
    const audioContext = this.sound.context;
    if (audioContext.state === "suspended") {
      await audioContext.resume();
      this.sound.play();
    } else {
      this.sound.play();
    }
  }
}
