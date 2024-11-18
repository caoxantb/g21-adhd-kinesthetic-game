import * as THREE from "three";
import { useGameStore } from "@/stores/game";

import Environment from "./environment";
import Player from "./player";

import bgm from "@/assets/game/sounds/bgm.mp3";

// active time 170s, preparation time 10s, freezing time 15s - 45s, break time 20s, 4 blocks total 900s
export default class Game {
  constructor(canvas) {
    this.store = new useGameStore();
    this.canvas = canvas;
    
    this.clock = new THREE.Clock();
    this.speed = 40;
    
    // Block tracking
    this.currentBlock = 1;
    this.totalBlocks = 4;
    
    // Phase tracking with durations (in seconds)
    this.phases = {
      active: { duration: 20, name: 'Active Phase' },
      preparation: { duration: 5, name: 'Preparation Phase' },
      freezing: { duration: 10, name: 'Freezing Phase' }, // Will increase per block
      break: { duration: 7, name: 'Break Phase' }
    };
    
    this.currentPhase = 'active';
    this.phaseStartTime = 0;
    this.phaseTimeRemaining = this.phases.active.duration;
    
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
      1000,
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

    window.addEventListener("resize", this.onWindowResize);
    window.addEventListener("click", () => this.startAudioContext(), {
      once: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.animate();

    this.interval = setInterval(() => {
      if (this.store.timePassed < this.store.duration) {
        this.store.timePassed += 1000;
      } else {
        clearInterval(this.interval);
      }
    }, 1000);

    this.phaseStartTime = Date.now() / 1000;
    // this.logGameState();
    
    // Set up phase timer
    this.phaseInterval = setInterval(() => {
      this.updatePhase();
    }, 1000);
  }

  updatePhase() {
    const currentTime = Date.now() / 1000;
    const elapsedTime = currentTime - this.phaseStartTime;
    this.phaseTimeRemaining = Math.max(0, this.phases[this.currentPhase].duration - elapsedTime);

    if (this.phaseTimeRemaining <= 0) {
        this.moveToNextPhase();
    }

    // this.logGameState();
  }

  moveToNextPhase() {
    switch (this.currentPhase) {
      case 'active':
          this.currentPhase = 'preparation';
          this.phaseTimeRemaining = this.phases.preparation.duration;
          this.active()
          break;
          
      case 'preparation':
          this.currentPhase = 'freezing';
          // Increase freezing time based on block number (15s, 25s, 35s, 45s)
          this.phases.freezing.duration = 10 + (this.currentBlock - 1) * 10;
          this.phaseTimeRemaining = this.phases.freezing.duration;
          this.startFreezingPhase();
          break;
          
      case 'freezing':
          this.currentPhase = 'break';
          this.phaseTimeRemaining = this.phases.break.duration;
          break;
          
      case 'break':
          if (this.currentBlock < this.totalBlocks) {
              this.currentBlock++;
              this.currentPhase = 'active';
              this.phaseTimeRemaining = this.phases.active.duration;
          } else {
              this.onGameCompleted();
              return;
          }
          break;
    }
    
    this.phaseStartTime = Date.now() / 1000;
  }

  logGameState() {
    console.log(`Current Block: ${this.currentBlock}/${this.totalBlocks}`);
    console.log(`Current Phase: ${this.phases[this.currentPhase].name}`);
    console.log(`Time Remaining: ${Math.ceil(this.phaseTimeRemaining)}s`);
    console.log('------------------------');
  }

  setupBlock() {}

  startActivePhase() {}

  startFreezingPhase() {
    this.currentPhase = "freezing";
    this.player.beforeFreeze();
  }

  onBlockCompleted() {
    if (this.currentBlock < 4) {
      this.currentBlock++;
      this.setupBlock();
    } else {
      this.onGameCompleted();
    }
  }

  onGameCompleted() {
    console.log('Game Completed!');
    clearInterval(this.phaseInterval);
    // Additional completion logic can be added here
  }

  active() {
    this.delta = this.clock.getDelta();
    this.environment.active(this.speed, this.delta);
    this.player.active(this.delta);
  }

  freeze() {
    this.delta = this.clock.getDelta();
    this.environment.freeze();
    this.player.freeze(this.delta);
  }

  animate() {
    if (this.currentPhase === "active") {
      this.active();
    } else if (this.currentPhase === "freezing") {
      this.freeze();
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    if (this.phaseInterval) {
        clearInterval(this.phaseInterval);
    }
    // Add any other cleanup needed
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
