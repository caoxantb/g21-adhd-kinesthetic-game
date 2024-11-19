import * as THREE from "three";

export default class EffectsSystem {
  constructor(scene) {
    this.scene = scene;
    this.effectsGroup = new THREE.Group();
    this.scene.add(this.effectsGroup);

    this.time = 0;
    this.createGlowRings();
    this.createParticleSystems();
    this.createEnergyField();
  }

  createGlowRings() {
    // Main cyan ring
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
    });
    this.mainRing = new THREE.Mesh(ringGeometry, ringMaterial);
    this.mainRing.rotation.x = Math.PI / 2;
    this.mainRing.visible = false;
    this.effectsGroup.add(this.mainRing);

    // Outer purple ring
    const outerRingGeometry = new THREE.TorusGeometry(2, 0.05, 16, 32);
    const outerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.3,
    });
    this.outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    this.outerRing.rotation.x = Math.PI / 2;
    this.outerRing.visible = false;
    this.effectsGroup.add(this.outerRing);

    // Inner golden ring
    const innerRingGeometry = new THREE.TorusGeometry(1, 0.03, 16, 32);
    const innerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.4,
    });
    this.innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
    this.innerRing.rotation.x = Math.PI / 2;
    this.innerRing.visible = false;
    this.effectsGroup.add(this.innerRing);
  }

  createParticleSystems() {
    // Create sparkle particles
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 150;
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleColors = new Float32Array(sparkleCount * 3);

    const colors = [
      new THREE.Color(0x00ffff), // cyan
      new THREE.Color(0xff00ff), // purple
      new THREE.Color(0xffd700), // gold
      new THREE.Color(0xff69b4), // pink
    ];

    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const radius = 1.2 + Math.random() * 1;
      sparklePositions[i * 3] = Math.cos(angle) * radius;
      sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      sparklePositions[i * 3 + 2] = Math.sin(angle) * radius;

      const color = colors[Math.floor(Math.random() * colors.length)];
      sparkleColors[i * 3] = color.r;
      sparkleColors[i * 3 + 1] = color.g;
      sparkleColors[i * 3 + 2] = color.b;
    }

    sparkleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(sparklePositions, 3),
    );
    sparkleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(sparkleColors, 3),
    );

    const sparkleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    this.sparkleSystem = new THREE.Points(sparkleGeometry, sparkleMaterial);
    this.sparkleSystem.visible = false;
    this.effectsGroup.add(this.sparkleSystem);
  }

  createEnergyField() {
    const fieldGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const fieldMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0x00ffff) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          float pulse = sin(time * 2.0) * 0.5 + 0.5;
          float pattern = sin(vUv.x * 20.0 + time) * sin(vUv.y * 20.0 + time);
          vec3 color = baseColor * (0.5 + 0.5 * pattern) * (0.5 + 0.5 * pulse);
          float alpha = 0.3 * (0.5 + 0.5 * pattern) * (0.5 + 0.5 * pulse);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.energyField = new THREE.Mesh(fieldGeometry, fieldMaterial);
    this.energyField.visible = false;
    this.effectsGroup.add(this.energyField);
  }

  startTposeEffects() {
    this.mainRing.visible = true;
    this.outerRing.visible = true;
    this.innerRing.visible = true;
    this.sparkleSystem.visible = true;
    this.energyField.visible = true;
  }

  startLevitationEffects() {
    this.sparkleSystem.visible = true;
    this.energyField.visible = true;
    // Keep rings for dramatic effect during levitation
    this.mainRing.scale.setScalar(1.5);
    this.outerRing.scale.setScalar(1.6);
    this.innerRing.scale.setScalar(1.3);
  }

  updateEffects(phase, playerPosition) {
    this.time += 0.016; // Assuming 60fps
    this.effectsGroup.position.copy(playerPosition);

    if (this.energyField.material.uniforms) {
      this.energyField.material.uniforms.time.value = this.time;
    }
    let mainPulse, outerPulse, innerPulse, sparklePositions, positions;
    switch (phase) {
      case "tpose":
        // Rotate rings in different directions
        this.mainRing.rotation.y = Math.sin(this.time) * 0.5;
        this.outerRing.rotation.y = -this.time * 0.5;
        this.innerRing.rotation.y = this.time * 0.3;

        // Pulse ring scales
        mainPulse = 1 + Math.sin(this.time * 2) * 0.1;
        outerPulse = 1 + Math.sin(this.time * 1.5 + 1) * 0.15;
        innerPulse = 1 + Math.sin(this.time * 2.5 + 2) * 0.05;

        this.mainRing.scale.setScalar(mainPulse);
        this.outerRing.scale.setScalar(outerPulse);
        this.innerRing.scale.setScalar(innerPulse);

        // Update sparkle positions
        positions = this.sparkleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const angle = (i / positions.length) * Math.PI * 2;
          positions[i + 1] = Math.sin(angle + this.time * 2) * 0.3;
        }
        this.sparkleSystem.geometry.attributes.position.needsUpdate = true;
        break;

      case "levitating":
        // More dramatic effects during levitation
        this.mainRing.rotation.y += 0.04;
        this.outerRing.rotation.y -= 0.03;
        this.innerRing.rotation.y += 0.05;

        // Update sparkle system for upward movement
        sparklePositions =
          this.sparkleSystem.geometry.attributes.position.array;
        for (let i = 0; i < sparklePositions.length; i += 3) {
          sparklePositions[i + 1] += 0.01;
          if (sparklePositions[i + 1] > 2) {
            sparklePositions[i + 1] = -2;
          }
        }
        this.sparkleSystem.geometry.attributes.position.needsUpdate = true;
        break;
    }
  }

  cleanup() {
    this.mainRing.visible = false;
    this.outerRing.visible = false;
    this.innerRing.visible = false;
    this.sparkleSystem.visible = false;
    this.energyField.visible = false;
  }
}
