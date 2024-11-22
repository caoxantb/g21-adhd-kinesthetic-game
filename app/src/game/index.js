// index.js
import * as THREE from "three";
import { useGameStore } from "@/stores/game";
import Environment from "./environment";
import Player from "./player"; 
import WallSystem from "./wall";
import bgm from "@/assets/game/sounds/bgm.mp3";

export default class Game {
 constructor(canvas) {
   this.store = new useGameStore();
   this.canvas = canvas;
   this.clock = new THREE.Clock();
   this.speed = 20;
   this.currentBlock = 1;
   this.currentPhaseIndex = 0;
   this.phases = ["active", "preparation", "freezing", "break"];
   this.phaseDurations = {
     active: 10,
     preparation: 10,
     freezing: 15,
     break: 20,
   };
   this.eventListeners = new Map();
   this.breakPhaseStartTime = 0;
   this.breakResetComplete = false;
   this.currentPhase = this.phases[this.currentPhaseIndex];
   this.remainingTime = this.phaseDurations[this.currentPhase];
   this.levitationStarted = false;
   this.init();
 }

 on(event, callback) {
   if (!this.eventListeners.has(event)) {
     this.eventListeners.set(event, []);
   }
   this.eventListeners.get(event).push(callback);
 }

 off(event, callback) {
   const listeners = this.eventListeners.get(event);
   if (listeners) {
     const index = listeners.indexOf(callback);
     if (index > -1) listeners.splice(index, 1);
   }
 }

 emit(event) {
   const listeners = this.eventListeners.get(event);
   if (listeners) {
     listeners.forEach(callback => callback());
   }
 }

 showBlockStats() {
   console.log('Showing block stats');
   this.emit('blockComplete');
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
   this.wallSystem = new WallSystem(this.scene, this);
   this.wallSystem.init();
   window.addEventListener("resize", this.onWindowResize.bind(this));
   window.addEventListener("keydown", e => this.handleKeyPress(e));
   window.addEventListener("click", () => this.startAudioContext(), {
     once: true,
   });
   this.renderer.setSize(window.innerWidth, window.innerHeight);
   this.startActivePhase();
   this.animate();
   this.startGameLoop();
 }

 startGameLoop() {
   this.interval = setInterval(() => {
     if (this.remainingTime > 0) {
       this.remainingTime--;
       this.store.timePassed++;
     } else {
       this.transitionToNextPhase();
     }
   }, 1000);
 }

 transitionToNextPhase() {
   this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
   this.currentPhase = this.phases[this.currentPhaseIndex];
   if (this.currentPhase === 'freezing')
     this.phaseDurations.freezing += 10
   
   this.remainingTime = this.phaseDurations[this.currentPhase];
   console.log(this.remainingTime)

   if (this.currentPhaseIndex === 0) {
     this.currentBlock++;
     if (this.currentBlock > 4) {
       this.onGameCompleted();
     } else {
       this.setupBlock();
     }
   }

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
   // Custom logic for new block
 }

 startActivePhase() {
   this.currentPhase = "active";
   this.environment.loadObstacles();
   console.log("active");
 }

 startFreezingPhase() {
   this.currentPhase = "freezing";
   this.levitationStarted = false;
   console.log("freezing");
   this.player.beforeFreeze();
 }

 startPreparationPhase() {
   console.log("preparing");
   this.wallSystem.spawnWall();
   this.currentPhase = "preparation";
 }

 startBreakPhase() {
   this.currentPhase = "break";
   this.breakPhaseStartTime = Date.now();
   this.breakResetComplete = false;
   console.log("break phase started");
   this.showBlockStats();
 }

 onGameCompleted() {
   clearInterval(this.interval);
   this.emit('complete');
 }

 active() {
   this.delta = this.clock.getDelta();
   this.environment.active(this.speed, this.delta);
   this.player.active(this.delta);
 }

 prepare() {
   this.delta = this.clock.getDelta();
   this.environment.active(this.speed, this.delta);
   this.player.active(this.delta);
   this.wallSystem.update(this.delta, this.speed);
 }

 freeze() {
   this.delta = this.clock.getDelta();
   this.environment.freeze();
   this.player.freeze(this.delta);

   if (!this.levitationStarted && this.remainingTime <= 3 ) {
     this.levitationStarted = true;
     this.player.levitate();
   }
 }

 break() {
   const elapsedTime = Date.now() - this.breakPhaseStartTime;
   if (elapsedTime >= 2000 && !this.breakResetComplete) {
     this.resetAfterBreak();
     this.breakResetComplete = true;
     this.store.toggleStats(false); // Close stats at end of break
   }
 }

 resetAfterBreak() {
   if (this.player) {
     this.player.reset({
       x: 0,
       y: 0,
       z: 68,
     });
   }

   if (this.environment) {
     this.environment.cleanup();
     this.environment.reset();
   }

   if (this.wallSystem) {
     this.wallSystem.cleanup();
   }

   this.speed = 20;
 }

 animate() {
   if (this.currentPhase === "active") {
     this.active();
   } else if (this.currentPhase === "preparation") {
     this.prepare();
   } else if (this.currentPhase === "freezing") {
     this.freeze();
   } else {
     this.break();
   }
   this.renderer.render(this.scene, this.camera);
   requestAnimationFrame(() => this.animate());
 }

 handleKeyPress(event) {
   if (event.key === "ArrowUp" && this.currentPhase === "active") {
     this.player.jump();
   }
   
   if (this.currentPhase === "freezing") {
     switch(event.key) {
       case 't':
         this.player.startPose('tpose');
         break;
     }
   }
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