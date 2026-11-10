
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const hero = document.querySelector(".hero-visual");

if (hero) {
  initHero3D();
}

function initHero3D() {
  const hero = document.querySelector(".hero-visual");
  if (!hero) return;

  try {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
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

    if (getComputedStyle(hero).position === "static") {
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

    // LIGHTING
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(3, 4, 5);
    scene.add(mainLight);

    const sideLight = new THREE.PointLight(0xaaaaaa, 12);
    sideLight.position.set(-3, -2, 3);
    scene.add(sideLight);

    // MAIN 3D OBJECT
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

    // WIREFRAME
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35
      })
    );

    objectGroup.add(wireframe);

    // ORBITAL RINGS
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

    // FLOATING PARTICLES
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

    // INTERACTION STATE
    let mouseX = 0;
    let mouseY = 0;

    let currentMouseX = 0;
    let currentMouseY = 0;

    let scrollProgress = 0;
    let currentScroll = 0;

    let animationId = null;
    let isVisible = true;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // MOUSE INTERACTION
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();

      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.8;
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.8;
    });

    hero.addEventListener("pointerleave", () => {
      mouseX = 0;
      mouseY = 0;
    });

    // SCROLL INTERACTION
    function updateScrollProgress() {
      const rect = hero.getBoundingClientRect();

      const progress =
        (window.innerHeight - rect.top) /
        (window.innerHeight + rect.height);

      scrollProgress = Math.max(0, Math.min(1, progress));
    }

    window.addEventListener("scroll", updateScrollProgress, {
      passive: true
    });

    updateScrollProgress();

    // RESPONSIVE SIZE
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

    window.addEventListener("resize", resize);
    resize();

    // ANIMATION
    function animate() {
      if (!isVisible || reducedMotion) {
        animationId = null;
        return;
      }

      animationId = requestAnimationFrame(animate);

      // Smooth mouse movement
      currentMouseX += (mouseX - currentMouseX) * 0.045;
      currentMouseY += (mouseY - currentMouseY) * 0.045;

      // Smooth scroll movement
      currentScroll += (scrollProgress - currentScroll) * 0.035;

      // Natural rotation
      objectGroup.rotation.y += 0.002;
      objectGroup.rotation.x += 0.001;

      // Mouse-based rotation
objectGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.15 + currentMouseX * 0.35;
objectGroup.rotation.x = Math.cos(Date.now() * 0.001) * 0.08 + currentMouseY * 0.35;

      // Scroll-based rotation
      objectGroup.rotation.y += currentScroll * 0.0015;
      objectGroup.rotation.x += currentScroll * 0.001;

      // Subtle vertical movement
      objectGroup.position.y =
        Math.sin(currentScroll * Math.PI) * 0.12;

      // Orbital animation
      ring1.rotation.z += 0.001;
      ring2.rotation.x += 0.0008;
      ring3.rotation.y += 0.0006;

      // Particle movement
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0001;

      renderer.render(scene, camera);
    }

    // VISIBILITY OPTIMIZATION
    const visibilityObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;

      if (isVisible && !reducedMotion && animationId === null) {
        animate();
      } else if (!isVisible && animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });

    visibilityObserver.observe(hero);

    renderer.render(scene, camera);

    if (!reducedMotion) {
      animate();
    }

    // CLEANUP
    window.addEventListener("pagehide", () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }

      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScrollProgress);

      geometry.dispose();
      wireframe.geometry.dispose();
      material.dispose();
      wireframe.material.dispose();
      ringMaterial.dispose();

      particleGeometry.dispose();
      particles.material.dispose();

      renderer.dispose();
    }, { once: true });

  } catch (error) {
    console.warn("Nova 3D scene could not initialize:", error);
  }
}
