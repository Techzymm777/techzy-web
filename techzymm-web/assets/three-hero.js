/* Techzy — Three.js hero scene.
   Particle field + wireframe icosahedron that drifts toward the pointer.
   ES module (importmap-free CDN import). Degrades gracefully: if WebGL
   or the CDN is unavailable, the canvas stays empty and the CSS
   gradient/grain carries the hero. Mobile gets a lighter particle count
   and gentle autonomous motion instead of pointer tracking. */

const canvas = document.getElementById("heroCanvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !reduceMotion) {
  init().catch(() => {
    /* CDN or WebGL failure: silently keep the static hero */
  });
}

async function init() {
  const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");

  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07070b, 0.035);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  /* ---- Particle field ---- */
  const COUNT = isMobile ? 900 : 2600;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    speeds[i] = 0.2 + Math.random() * 0.8;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xc8f43c,
    size: isMobile ? 0.045 : 0.035,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* ---- Wireframe icosahedron ---- */
  const icoGroup = new THREE.Group();
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.2, 1),
    new THREE.MeshBasicMaterial({
      color: 0xc8f43c,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    })
  );
  const icoInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.4, 0),
    new THREE.MeshBasicMaterial({
      color: 0xf4f4f6,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    })
  );
  icoGroup.add(ico, icoInner);
  icoGroup.position.x = isMobile ? 0 : 4.5;
  scene.add(icoGroup);

  /* ---- Pointer tracking (lerped) ---- */
  const target = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  if (finePointer) {
    window.addEventListener(
      "mousemove",
      (e) => {
        target.x = (e.clientX / window.innerWidth) * 2 - 1;
        target.y = -((e.clientY / window.innerHeight) * 2 - 1);
      },
      { passive: true }
    );
  }

  /* ---- Resize ---- */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ---- Render loop (paused when hero off-screen or tab hidden) ---- */
  let running = true;
  const hero = document.getElementById("hero");
  if ("IntersectionObserver" in window && hero) {
    new IntersectionObserver(
      (entries) => {
        running = entries[0].isIntersecting;
        if (running) requestAnimationFrame(tick);
      },
      { threshold: 0 }
    ).observe(hero);
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && running) requestAnimationFrame(tick);
  });

  const clock = new THREE.Clock();
  function tick() {
    if (!running || document.hidden) return;
    const t = clock.getElapsedTime();

    // ease pointer
    eased.x += (target.x - eased.x) * 0.04;
    eased.y += (target.y - eased.y) * 0.04;

    // drifting particles
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.002;
    }
    pGeo.attributes.position.needsUpdate = true;
    points.rotation.y = t * 0.02 + eased.x * 0.15;
    points.rotation.x = eased.y * 0.1;

    // icosahedron: slow tumble + pointer-follow
    icoGroup.rotation.y = t * 0.15 + eased.x * 0.5;
    icoGroup.rotation.x = t * 0.08 - eased.y * 0.4;
    icoGroup.position.y = Math.sin(t * 0.5) * 0.4 + eased.y * 0.8;

    // camera sway
    camera.position.x = eased.x * 1.2;
    camera.position.y = eased.y * 0.8;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
