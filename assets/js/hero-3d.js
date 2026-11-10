import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/*
  NOVA CINEMATIC ENGINE
  Scroll position drives the 3D camera and scene timeline in both directions.
  GSAP + ScrollTrigger are loaded globally by index.html.
*/
const canvas = document.querySelector("#nova-cinematic-canvas");
const story = document.querySelector("#cinematic-story");

if (canvas && story) initCinematicExperience();

function initCinematicExperience() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 700px)").matches;

  try {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.045);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050505, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 5, 7);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x9b9b9b, 18, 18);
    rimLight.position.set(-4, -2, 3);
    scene.add(rimLight);

    const world = new THREE.Group();
    scene.add(world);

    const makeMaterial = (color, metalness = 0.8, roughness = 0.24, opacity = 1) =>
      new THREE.MeshStandardMaterial({
        color, metalness, roughness, transparent: opacity < 1, opacity,
        side: THREE.DoubleSide
      });

    function addWireSphere(parent, radius, detail, color, opacity = 0.42) {
      const geometry = new THREE.IcosahedronGeometry(radius, detail);
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
      parent.add(wire);
      return wire;
    }

    // CHAPTER 00 — the Nova core
    const heroScene = new THREE.Group();
    world.add(heroScene);
    const heroCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05, 3),
      makeMaterial(0xc9c9c9, 0.92, 0.18)
    );
    heroScene.add(heroCore);
    addWireSphere(heroScene, 1.12, 2, 0xffffff, 0.38);
    const heroRingA = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.012, 12, 180), makeMaterial(0xdddddd));
    const heroRingB = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.006, 8, 180), makeMaterial(0x888888));
    heroRingA.rotation.set(1.1, 0.25, 0.2);
    heroRingB.rotation.set(0.35, 1.1, 0.65);
    heroScene.add(heroRingA, heroRingB);

    // CHAPTER 01 — connected systems
    const serviceScene = new THREE.Group();
    world.add(serviceScene);
    const serviceCore = new THREE.Mesh(new THREE.OctahedronGeometry(1.05, 2), makeMaterial(0xe0e0e0, 0.75, 0.2));
    serviceScene.add(serviceCore);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.45 + i * 0.28, 0.008, 8, 150),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38 - i * 0.07 })
      );
      ring.rotation.set(i * 0.8, i * 0.55, i * 0.3);
      serviceScene.add(ring);
    }
    const nodes = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 20), makeMaterial(0xffffff, 0.5, 0.2));
      node.position.set(Math.cos(angle) * 2.05, Math.sin(angle) * 1.25, 0.15);
      nodes.add(node);
    }
    serviceScene.add(nodes);

    // CHAPTER 02 — digital work / architectural frame
    const workScene = new THREE.Group();
    world.add(workScene);
    const frameMaterial = new THREE.MeshBasicMaterial({ color: 0xd8d8d8, wireframe: true, transparent: true, opacity: 0.55 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 1.25, 4, 3, 2), frameMaterial);
    workScene.add(frame);
    const workOrb = new THREE.Mesh(new THREE.SphereGeometry(0.58, 48, 48), makeMaterial(0xbdbdbd, 0.95, 0.16));
    workOrb.position.set(0, 0, 0.15);
    workScene.add(workOrb);
    const workRing = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.018, 12, 160), makeMaterial(0xffffff));
    workRing.rotation.x = 1.1;
    workScene.add(workRing);

    // CHAPTER 03 — the studio / expanding geometry
    const aboutScene = new THREE.Group();
    world.add(aboutScene);
    const aboutShape = new THREE.Mesh(new THREE.DodecahedronGeometry(1.12, 1), makeMaterial(0xd0d0d0, 0.9, 0.2));
    aboutScene.add(aboutShape);
    const aboutWire = addWireSphere(aboutScene, 1.55, 1, 0xffffff, 0.28);
    const aboutRing = new THREE.Mesh(new THREE.TorusKnotGeometry(1.75, 0.012, 180, 8, 2, 5), new THREE.MeshBasicMaterial({ color: 0xbdbdbd, transparent: true, opacity: 0.45 }));
    aboutRing.rotation.set(0.6, 0.2, 0.4);
    aboutScene.add(aboutRing);

    // CHAPTER 04 — converging light / contact
    const contactScene = new THREE.Group();
    world.add(contactScene);
    const contactCore = new THREE.Mesh(new THREE.SphereGeometry(0.72, 64, 64), makeMaterial(0xf0f0f0, 0.85, 0.12));
    contactScene.add(contactCore);
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.15 + i * 0.22, 0.006, 8, 160),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 - i * 0.035 })
      );
      ring.rotation.set(i * 0.42, i * 0.31, i * 0.22);
      contactScene.add(ring);
    }

    const scenes = [heroScene, serviceScene, workScene, aboutScene, contactScene];
    scenes.forEach((group, index) => {
      group.position.set(0, 0, 0);
      group.scale.setScalar(index === 0 ? 1 : 0.001);
      group.visible = true;
    });

    // Floating dust gives depth without external image dependencies.
    const particleCount = isMobile ? 260 : 620;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: isMobile ? 0.018 : 0.022, transparent: true, opacity: 0.48, sizeAttenuation: true })
    );
    scene.add(particles);

    let targetX = 0, targetY = 0, smoothX = 0, smoothY = 0;
    let raf = 0;
    let visible = true;
    let lastTime = 0;

    function onPointerMove(event) {
      targetX = (event.clientX / window.innerWidth - 0.5) * 0.7;
      targetY = (event.clientY / window.innerHeight - 0.5) * 0.45;
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.fov = width < 700 ? 49 : 42;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.8));
    }
    window.addEventListener("resize", resize, { passive: true });

    // Scroll is the film timeline: moving up scrubs the exact same animation backward.
    if (window.gsap && window.ScrollTrigger && !reducedMotion) {
      gsap.registerPlugin(ScrollTrigger);

      const film = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: story,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.15,
          invalidateOnRefresh: true
        }
      });

      film
        .to(camera.position, { x: 0.15, y: 0.05, z: 7.1, duration: 1 }, 0)
        .to(heroScene.rotation, { y: Math.PI * 1.15, x: 0.5, duration: 1 }, 0)
        .to(heroScene.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.9 }, 0.05)
        .to(heroScene.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.18 }, 0.82)

        .to(serviceScene.scale, { x: 1, y: 1, z: 1, duration: 0.18 }, 0.78)
        .to(serviceScene.rotation, { y: Math.PI * 1.2, z: -0.45, duration: 1 }, 0.82)
        .to(serviceScene.position, { x: -0.25, y: 0.1, z: -0.4, duration: 1 }, 0.82)
        .to(serviceScene.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.16 }, 1.55)
        .to(serviceScene.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.18 }, 1.82)

        .to(workScene.scale, { x: 1, y: 1, z: 1, duration: 0.18 }, 1.78)
        .to(workScene.rotation, { x: 0.35, y: Math.PI * 1.1, z: 0.35, duration: 1 }, 1.82)
        .to(workScene.position, { x: 0.2, y: -0.1, z: -0.6, duration: 1 }, 1.82)
        .to(workScene.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.16 }, 2.55)
        .to(workScene.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.18 }, 2.82)

        .to(aboutScene.scale, { x: 1, y: 1, z: 1, duration: 0.18 }, 2.78)
        .to(aboutScene.rotation, { x: Math.PI * 0.55, y: Math.PI * 1.3, duration: 1 }, 2.82)
        .to(aboutScene.position, { x: -0.15, y: 0.15, z: -0.5, duration: 1 }, 2.82)
        .to(aboutScene.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.16 }, 3.55)
        .to(aboutScene.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.18 }, 3.82)

        .to(contactScene.scale, { x: 1, y: 1, z: 1, duration: 0.18 }, 3.78)
        .to(contactScene.rotation, { x: 0.5, y: Math.PI * 1.4, z: 0.25, duration: 1 }, 3.82)
        .to(contactScene.position, { x: 0, y: 0, z: -0.25, duration: 1 }, 3.82)
        .to(camera.position, { x: 0, y: 0, z: 6.2, duration: 0.9 }, 3.9);

      // DOM elements enter like titles in a film, but remain readable and accessible.
      document.querySelectorAll(".cinematic-section").forEach((section) => {
        const targets = section.querySelectorAll(".cinematic-copy, .cinematic-card");
        if (!targets.length) return;
        gsap.fromTo(targets,
          { y: 54, opacity: 0.25, filter: "blur(5px)" },
          {
            y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9, stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              end: "top 28%",
              scrub: 0.7
            }
          }
        );
      });
    }

    function render(time = 0) {
      raf = requestAnimationFrame(render);
      const delta = Math.min((time - lastTime) / 1000 || 0.016, 0.05);
      lastTime = time;

      smoothX += (targetX - smoothX) * 0.035;
      smoothY += (targetY - smoothY) * 0.035;
      camera.position.x += (smoothX * 0.85 - camera.position.x) * 0.012;
      camera.position.y += (-smoothY * 0.65 - camera.position.y) * 0.012;
      camera.lookAt(0, 0, 0);

      if (!reducedMotion) {
        heroCore.rotation.y += delta * 0.13;
        heroCore.rotation.x += delta * 0.07;
        heroRingA.rotation.z += delta * 0.035;
        heroRingB.rotation.y += delta * 0.025;
        serviceCore.rotation.y += delta * 0.16;
        nodes.rotation.z -= delta * 0.08;
        frame.rotation.y += delta * 0.06;
        workOrb.rotation.x += delta * 0.1;
        workRing.rotation.z += delta * 0.04;
        aboutShape.rotation.y += delta * 0.1;
        aboutWire.rotation.x -= delta * 0.035;
        aboutRing.rotation.y += delta * 0.04;
        contactCore.rotation.y += delta * 0.08;
        particles.rotation.y += delta * 0.008;
      }

      renderer.render(scene, camera);
    }

    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !raf) render();
      if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }, { threshold: 0 });
    observer.observe(story);

    render();

    window.addEventListener("pagehide", () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      if (window.ScrollTrigger) ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    }, { once: true });

  } catch (error) {
    console.error("Nova cinematic engine could not initialize:", error);
    canvas.style.display = "none";
  }
}
