
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const hero = document.querySelector(".hero-visual");

if (hero && !window.matchMedia("(max-width: 600px)").matches) {
  initHero3D();
} else if (hero) {
  initHero3D();
}

function initHero3D() {
  const hero = document.querySelector(".hero-visual");
  if (!hero) return;

  try {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");

    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      zIndex: "0",
      pointerEvents: "none"
    });

    const computedPosition = getComputedStyle(hero).position;
    if (computedPosition === "static") {
      hero.style.position = "relative";
    }

    hero.insertBefore(canvas, hero.firstChild);

    [...hero.children].forEach((child) => {
      if (child !== canvas) {
        if (getComputedStyle(child).position === "static") {
          child.style.position = "relative";
        }
        child.style.zIndex = "1";
      }
    });

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(3, 4, 5);
    scene.add(mainLight);

    const sideLight = new THREE.PointLight(0xaaaaaa, 12);
    sideLight.position.set(-3, -2, 3);
    scene.add(sideLight);

    // Main 3D object
    const objectGroup = new THREE.Group();
    scene.add(objectGroup);

    const geometry = new THREE.IcosahedronGeometry(0.85, 2);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xd8d8d8,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      flatShading: true
    });

    const core = new THREE.Mesh(geometry, material);
    objectGroup.add(core);

    // Wireframe layer
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35
      })
    );

    objectGroup.add(wireframe);

    // Orbital rings
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xbdbdbd,
      metalness: 0.9,
      roughness: 0.25
    });

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.012, 12, 140),
      ringMaterial
    );

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.008, 12, 140),
      ringMaterial
    );

    const ring3 = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.006, 12, 140),
      ringMaterial
    );

    ring1.rotation.set(1.1, 0.3, 0.4);
    ring2.rotation.set(0.4, 1.1, 0.2);
    ring3.rotation.set(1.5, 0.8, 1.1);

    objectGroup.add(ring1, ring2, ring3);

    // Floating particles
    const particlePositions = [];

    for (let i = 0; i < 180; i++) {
      particlePositions.push(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3
      );
    }

    const particleGeometry = new THREE.BufferGeometry();

    particleGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(particlePositions, 3)
    );

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.018,
        transparent: true,
        opacity: 0.65
      })
    );

    scene.add(particles);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();

      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5;
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.5;
    });

    hero.addEventListener("pointerleave", () => {
      mouseX = 0;
      mouseY = 0;
    });

    // Responsive sizing
    function resize() {
      const width = hero.clientWidth;
      const height = hero.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hero);
    resize();

    // Animation
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationId;
    let isVisible = true;

    const visibilityObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;

      if (isVisible && !reducedMotion && !animationId) {
        animate();
      } else if (!isVisible && animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });

    visibilityObserver.observe(hero);

    function animate() {
      if (!isVisible || reducedMotion) return;

      animationId = requestAnimationFrame(animate);

      objectGroup.rotation.y += 0.002;
      objectGroup.rotation.x += 0.001;

      objectGroup.rotation.y +=
        (mouseX * 0.3 - objectGroup.rotation.y * 0.05) * 0.002;

      objectGroup.rotation.x +=
        (mouseY * 0.3 - objectGroup.rotation.x * 0.05) * 0.002;

      ring1.rotation.z += 0.001;
      ring2.rotation.x += 0.0008;
      ring3.rotation.y += 0.0006;

      particles.rotation.y += 0.0003;

      renderer.render(scene, camera);
    }

    renderer.render(scene, camera);

    if (!reducedMotion) {
      animate();
    }

    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    });

  } catch (error) {
    console.warn("Nova 3D scene could not initialize:", error);
  }
}
