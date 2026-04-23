/* =============================================================
   Neural-network / particle background (Three.js)
   Robotics-AI themed animated backdrop — responds to scroll + mouse.
   ============================================================= */

(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070709, 0.0015);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 320);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  /* -----------------------------------------------------------
     NODE CLOUD (neural network points)
     ----------------------------------------------------------- */
  const MOBILE = window.innerWidth < 900;
  const NODE_COUNT = MOBILE ? 110 : 180;
  const SPREAD_X = 900;
  const SPREAD_Y = 520;
  const SPREAD_Z = 400;

  const nodes = [];
  const positions = new Float32Array(NODE_COUNT * 3);
  const colors = new Float32Array(NODE_COUNT * 3);
  const sizes = new Float32Array(NODE_COUNT);

  const accent = new THREE.Color(0x00e5ff);
  const warm = new THREE.Color(0x6ef0a9);
  const ink = new THREE.Color(0xffffff);

  for (let i = 0; i < NODE_COUNT; i++) {
    const p = {
      x: (Math.random() - 0.5) * SPREAD_X,
      y: (Math.random() - 0.5) * SPREAD_Y,
      z: (Math.random() - 0.5) * SPREAD_Z,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      vz: (Math.random() - 0.5) * 0.08,
    };
    nodes.push(p);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;

    const mix = Math.random();
    const c = mix < 0.5
      ? accent.clone().lerp(ink, Math.random() * 0.5)
      : warm.clone().lerp(ink, Math.random() * 0.6);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i] = 1.4 + Math.random() * 2.2;
  }

  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  pointGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  // sprite dot
  const dotCanvas = document.createElement('canvas');
  dotCanvas.width = dotCanvas.height = 64;
  const dctx = dotCanvas.getContext('2d');
  const grad = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  dctx.fillStyle = grad;
  dctx.fillRect(0, 0, 64, 64);
  const dotTexture = new THREE.CanvasTexture(dotCanvas);

  const pointMat = new THREE.PointsMaterial({
    size: 4,
    map: dotTexture,
    transparent: true,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const pointCloud = new THREE.Points(pointGeo, pointMat);
  scene.add(pointCloud);

  /* -----------------------------------------------------------
     CONNECTING LINES (dynamic edges)
     ----------------------------------------------------------- */
  const MAX_EDGES = MOBILE ? 260 : 520;
  const linePositions = new Float32Array(MAX_EDGES * 2 * 3);
  const lineColors = new Float32Array(MAX_EDGES * 2 * 3);

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineMesh);

  const THRESHOLD = 110;
  const THRESH_SQ = THRESHOLD * THRESHOLD;

  /* -----------------------------------------------------------
     MOUSE / SCROLL INFLUENCE
     ----------------------------------------------------------- */
  const target = { mx: 0, my: 0, scroll: 0 };
  const current = { mx: 0, my: 0, scroll: 0 };

  window.addEventListener('pointermove', (e) => {
    target.mx = (e.clientX / window.innerWidth - 0.5) * 2;
    target.my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target.scroll = max > 0 ? window.scrollY / max : 0;
  }, { passive: true });

  /* -----------------------------------------------------------
     ANIMATION LOOP
     ----------------------------------------------------------- */
  const clock = new THREE.Clock();
  let frame = 0;
  let running = true;
  let lastEdgeCount = 0;

  // pause when tab hidden (saves a lot of CPU)
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) clock.start();
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;

    frame++;
    const t = clock.elapsedTime;

    current.mx += (target.mx - current.mx) * 0.06;
    current.my += (target.my - current.my) * 0.06;
    current.scroll += (target.scroll - current.scroll) * 0.06;

    // node positions — every frame (cheap)
    const posAttr = pointGeo.getAttribute('position');
    const posArr = posAttr.array;
    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy; n.z += n.vz;
      if (n.x > SPREAD_X / 2 || n.x < -SPREAD_X / 2) n.vx *= -1;
      if (n.y > SPREAD_Y / 2 || n.y < -SPREAD_Y / 2) n.vy *= -1;
      if (n.z > SPREAD_Z / 2 || n.z < -SPREAD_Z / 2) n.vz *= -1;
      posArr[i * 3]     = n.x;
      posArr[i * 3 + 1] = n.y;
      posArr[i * 3 + 2] = n.z;
    }
    posAttr.needsUpdate = true;

    // edge rebuild — every 2nd frame (O(N²) cost)
    if (frame % 2 === 0) {
      let edgeIndex = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < NODE_COUNT; j++) {
          if (edgeIndex >= MAX_EDGES) break;
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < THRESH_SQ) {
            const alpha = 1 - d2 / THRESH_SQ;
            const off = edgeIndex * 6;
            linePositions[off]     = a.x;
            linePositions[off + 1] = a.y;
            linePositions[off + 2] = a.z;
            linePositions[off + 3] = b.x;
            linePositions[off + 4] = b.y;
            linePositions[off + 5] = b.z;

            const g = 0.9 * alpha, bl = 1.0 * alpha;
            lineColors[off]     = 0;
            lineColors[off + 1] = g;
            lineColors[off + 2] = bl;
            lineColors[off + 3] = 0;
            lineColors[off + 4] = g;
            lineColors[off + 5] = bl;
            edgeIndex++;
          }
        }
      }
      lineGeo.getAttribute('position').needsUpdate = true;
      lineGeo.getAttribute('color').needsUpdate = true;
      lineGeo.setDrawRange(0, edgeIndex * 2);
      lastEdgeCount = edgeIndex;
    } else {
      // reuse last edge positions — just refresh buffer range
      lineGeo.setDrawRange(0, lastEdgeCount * 2);
    }

    // camera subtle drift + scroll push
    const scrollZ = current.scroll * 220;
    camera.position.x += (current.mx * 50 - camera.position.x) * 0.04;
    camera.position.y += (-current.my * 34 - camera.position.y) * 0.04;
    camera.position.z = 320 + scrollZ;
    camera.lookAt(0, 0, 0);

    pointCloud.rotation.y = t * 0.015 + current.scroll * 0.5;
    pointCloud.rotation.x = Math.sin(t * 0.08) * 0.04;
    lineMesh.rotation.copy(pointCloud.rotation);

    renderer.render(scene, camera);
  }
  animate();

  /* -----------------------------------------------------------
     RESIZE
     ----------------------------------------------------------- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
