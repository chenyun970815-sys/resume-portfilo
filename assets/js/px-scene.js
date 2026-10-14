/* ============================================================
   陈云 · 作品集 V2 — WebGL 场景
   悬浮物件 + 零重力物理（cannon-es）+ 鼠标斥力/线稿切换
   ============================================================ */
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const KLEIN = [
  0xFAFAF8, 0x9B5CFF, 0xE8FF3A, 0x5A61FF,
  0xFF5A1F, 0x2B32E8, 0xC8A6FF, 0x1F1F6E
];

const isMobile = window.matchMedia('(max-width: 820px)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer, scene, camera, world;
let pointer = new THREE.Vector2(2, 2);
let pointerWorld = new THREE.Vector3(999, 999, 0);
let pointerBody, pointerBodyTarget = new CANNON.Vec3(999, 999, 0), pointerBodyCur = new CANNON.Vec3(999, 999, 0);
const objects = [];
let clock, raf = null, active = true, started = false;
let bounds = { HX: 3, HY: 3 };

/* ---------------------------------------------------------
   几何体工厂：程序化的「品牌物件」
   --------------------------------------------------------- */
function makeGeometry(kind) {
  switch (kind) {
    case 'torus':     return new THREE.TorusGeometry(0.62, 0.22, 24, 64);
    case 'ico':       return new THREE.IcosahedronGeometry(0.72, 1);
    case 'box':       return new THREE.BoxGeometry(0.86, 0.86, 0.86, 1, 1, 1);
    case 'capsule':   return new THREE.CapsuleGeometry(0.3, 0.66, 8, 20);
    case 'octa':      return new THREE.OctahedronGeometry(0.78, 0);
    case 'knot':      return new THREE.TorusKnotGeometry(0.45, 0.16, 96, 16);
    case 'sphere':    return new THREE.SphereGeometry(0.62, 32, 24);
    case 'cone':      return new THREE.ConeGeometry(0.56, 1.05, 28, 1, true);
    case 'dodeca':    return new THREE.DodecahedronGeometry(0.7, 0);
    case 'ring':      return new THREE.TorusGeometry(0.66, 0.11, 16, 60);
    case 'cylinder':  return new THREE.CylinderGeometry(0.42, 0.42, 0.92, 30, 1, true);
    case 'tetra':     return new THREE.TetrahedronGeometry(0.86, 0);
    default:          return new THREE.IcosahedronGeometry(0.7, 0);
  }
}

const MAX_LIN = 0.38;   // 线速度上限 ≈ 每秒 3.2% 视口宽
const MAX_ANG = 0.105;  // 角速度上限 ≈ 转一圈要 60 秒

/* 几何体近似包围盒 —— 略收一些，让相邻物件不容易互相挤压 */
function approximateHalfExtents(geom) {
  geom.computeBoundingBox();
  const b = geom.boundingBox;
  return new CANNON.Vec3(
    Math.max(0.05, (b.max.x - b.min.x) / 2 * 0.52),
    Math.max(0.05, (b.max.y - b.min.y) / 2 * 0.52),
    Math.max(0.05, (b.max.z - b.min.z) / 2 * 0.52)
  );
}

/* ---------------------------------------------------------
   初始化
   --------------------------------------------------------- */
function init() {
  const canvas = document.getElementById('scene');
  if (!canvas || !window.WebGLRenderingContext) return;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.6 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  /* 灯光 */
  scene.add(new THREE.AmbientLight(0xffffff, 0.72));

  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(4, 6, 8);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x8A8FFF, 1.5);
  rim.position.set(-6, -3, 4);
  scene.add(rim);

  const p1 = new THREE.PointLight(0xE8FF3A, 26, 16);
  p1.position.set(-3.2, 2.4, 3);
  scene.add(p1);

  const p2 = new THREE.PointLight(0x2B32E8, 30, 18);
  p2.position.set(3.6, -2.6, 3);
  scene.add(p2);

  /* 物理世界 */
  world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = false;
  world.defaultContactMaterial.friction = 0.02;
  /* 低弹性：碰撞要「闷」，不要弹开 */
  world.defaultContactMaterial.restitution = isMobile ? 0.22 : 0.26;

  /* 鼠标「虚拟球体」—— 推动物件 */
  pointerBody = new CANNON.Body({
    mass: 11,
    shape: new CANNON.Sphere(0.95),
    position: new CANNON.Vec3(999, 999, 0),
    linearDamping: 0.5
  });
  pointerBody.collisionResponse = true;
  world.addBody(pointerBody);

  buildObjects();

  window.__pxScene = { THREE, renderer, scene, camera, world, objects };

  clock = new THREE.Clock();
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerMove, { passive: true });
  document.addEventListener('mouseleave', () => {
    pointer.set(20, 20);
    pointerBodyTarget.set(999, 999, 0);
  });

  if (!reduced) start();
  else { renderOnce(); }

  document.documentElement.classList.add('scene-ready');
}

/* ---------------------------------------------------------
   构建悬浮物件
   --------------------------------------------------------- */
function buildObjects() {
  const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  const vw = vh * camera.aspect;
  const HX = vw / 2, HY = vh / 2;
  bounds = { HX, HY };

  /* 屏幕比例坐标（±1 = 视口边缘）：环形铺开，中央给门户矩形留白。
     内收一点，给漂移留出余量，避免被甩出画面。 */
  const spots = [
    [ 0.02,  0.74], [-0.34,  0.70], [ 0.42,  0.68],
    [-0.80,  0.24], [ 0.82,  0.18], [-0.80, -0.28], [ 0.80, -0.32],
    [-0.42, -0.72], [ 0.14, -0.76], [ 0.54, -0.70],
    [-0.64,  0.50], [ 0.76, -0.60]
  ];
  const kinds = ['torus','ico','capsule','octa','knot','sphere','cone','dodeca','ring','box','cylinder','tetra'];
  const colors = [KLEIN[4], KLEIN[1], KLEIN[2], KLEIN[0], KLEIN[3], KLEIN[5], KLEIN[2], KLEIN[1], KLEIN[4], KLEIN[0], KLEIN[7], KLEIN[3]];

  const count = isMobile ? 8 : spots.length;

  for (let i = 0; i < count; i++) {
    const kind = kinds[i % kinds.length];
    const geom = makeGeometry(kind);

    const mat = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      roughness: 0.32,
      metalness: 0.08,
      transparent: true,
      opacity: 1,
      flatShading: kind === 'ico' || kind === 'dodeca' || kind === 'tetra' || kind === 'octa'
    });

    const mesh = new THREE.Mesh(geom, mat);

    /* 线稿层 */
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xFAFAF8, transparent: true, opacity: 0, depthWrite: false
    });
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(geom, 14), lineMat);
    line.scale.setScalar(1.004);
    mesh.add(line);

    const [nx, ny] = spots[i % spots.length];
    const px = nx * HX * 0.96;
    const py = ny * HY * 0.96;
    const pz = (Math.random() - 0.5) * 1.9;

    const scale = 0.58 + Math.random() * 0.5;
    mesh.scale.setScalar(scale);
    mesh.position.set(px, py, pz);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(mesh);

    const he = approximateHalfExtents(geom);
    const body = new CANNON.Body({
      mass: 0.55 * scale,
      shape: new CANNON.Box(new CANNON.Vec3(he.x * scale, he.y * scale, he.z * scale)),
      position: new CANNON.Vec3(px, py, pz),
      quaternion: new CANNON.Quaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w),
      linearDamping: reduced ? 0.96 : 0.62,
      angularDamping: reduced ? 0.96 : 0.62
    });
    /* 几乎从静止苏醒，避免开场乱窜 */
    body.velocity.set((Math.random() - 0.5) * 0.07, (Math.random() - 0.5) * 0.07, (Math.random() - 0.5) * 0.05);
    body.angularVelocity.set(0, 0, 0);
    world.addBody(body);

    /* 每个物件一套自己的节律：两条不同周期的呼吸 + 分轴自转速率。
       大物件天然更沉（力不乘质量），所以对的刻度要一起降下来。 */
    /* scale 越大 = 越沉 = 摆一轮越久 */
    const heaviness = Math.max(0.6, scale);

    objects.push({
      mesh, body, mat, lineMat, line,
      rest: new THREE.Vector3(px, py, pz),
      phase: Math.random() * Math.PI * 2,
      /* 两条呼吸周期：主摆一轮约 26–48s，副摆一轮约 90–150s。
         ω = 2π/T，两轴错开后轨迹是不闭合的花瓣形，看不出循环。 */
      breatheA: (0.110 + Math.random() * 0.060) / heaviness,
      breatheB: (0.042 + Math.random() * 0.026) / heaviness,
      ampA: 0.26 + Math.random() * 0.20,
      ampB: 0.10 + Math.random() * 0.10,
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 0.11,
        (Math.random() - 0.5) * 0.13,
        (Math.random() - 0.5) * 0.06
      ),
      scale,
      hover: 0
    });
  }
}

/* ---------------------------------------------------------
   交互
   --------------------------------------------------------- */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function onPointerMove(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  pointerBodyTarget.set(pointer.x * bounds.HX, pointer.y * bounds.HY, 0.5);
}

function updateHover() {
  if (!renderer) return;
  ndc.copy(pointer);
  raycaster.setFromCamera(ndc, camera);
  const meshes = objects.map(o => o.mesh);
  const hits = raycaster.intersectObjects(meshes, false);
  const hitSet = new Set(hits.map(h => h.object));

  objects.forEach(o => {
    /* 鼠标与物体的空间距离 → 0..1 的线稿化程度 */
    const dRay = raycaster.ray.distanceToPoint(o.mesh.position);
    const r0 = 0.45 + o.scale * 0.4;   // 完全线稿
    const r1 = 2.6 + o.scale * 1.1;    // 开始线稿
    let t = 1 - (dRay - r0) / (r1 - r0);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    if (hitSet.has(o.mesh)) t = 1;

    /* 线稿化/实体化的转换也更从容 */
    o.hover += (t - o.hover) * 0.07;
    o.lineMat.opacity = o.hover;
    o.mat.opacity = 1 - o.hover * 0.96;
    o.mesh.scale.setScalar(o.scale * (1 + o.hover * 0.05));
  });
}

/* ---------------------------------------------------------
   循环
   --------------------------------------------------------- */
const tmpQ = new CANNON.Quaternion();

function animate() {
  raf = requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 1 / 30);
  const t = clock.elapsedTime;

  /* 鼠标球体缓缓跟随 —— 被推开的物件也慢半拍 */
  const follow = 1 - Math.pow(1 - 0.075, dt * 60);
  pointerBodyCur.x += (pointerBodyTarget.x - pointerBodyCur.x) * follow;
  pointerBodyCur.y += (pointerBodyTarget.y - pointerBodyCur.y) * follow;
  pointerBodyCur.z += (pointerBodyTarget.z - pointerBodyCur.z) * follow;
  pointerBody.position.copy(pointerBodyCur);
  pointerBody.velocity.set(0, 0, 0);

  /* 柔和弹簧回归 + 双周期呼吸 */
  objects.forEach(o => {
    const b = o.body;
    const k = 1.45;

    /* 静止点本身在做极慢的李萨如运动 —— 物件不是在乱窜，
       而是在追一条有轨迹、有呼吸感的路线 */
    const targetX =
      o.rest.x +
      Math.sin(t * o.breatheA + o.phase) * o.ampA +
      Math.sin(t * o.breatheB + o.phase * 1.9) * o.ampB;
    const targetY =
      o.rest.y +
      Math.cos(t * o.breatheA * 0.82 + o.phase * 1.3) * o.ampA * 0.85 +
      Math.sin(t * o.breatheB * 1.3 + o.phase * 0.7) * o.ampB;
    const targetZ =
      o.rest.z +
      Math.sin(t * o.breatheB * 1.6 + o.phase * 2.1) * 0.22;

    /* 柔和弹簧 + 欠阻尼：跟随有延迟，像在水里 */
    const fx = (targetX - b.position.x) * k;
    const fy = (targetY - b.position.y) * k;
    const fz = (targetZ - b.position.z) * k * 0.85;
    b.applyForce(new CANNON.Vec3(fx, fy, fz), b.position);

    /* 自转：慢慢把角速度拉向自己的固定速率，而不是持续加速。
       再叠一层慢摆，形成 快—慢—快—慢 的喘息感。 */
    const wob = 0.55 + 0.45 * Math.sin(t * o.breatheB + o.phase * 1.7);
    const ease = 0.9;
    b.angularVelocity.x += (o.spin.x * wob - b.angularVelocity.x) * ease * dt;
    b.angularVelocity.y += (o.spin.y * wob - b.angularVelocity.y) * ease * dt;
    b.angularVelocity.z += (o.spin.z * wob - b.angularVelocity.z) * ease * dt;
  });

  world.step(1 / 60, dt, 4);

  /* 速度天花板 —— 放在步进之后，连碰撞产生的冲量也一并压住，
     保证任何情况下都是从容的慢动作 */
  objects.forEach(o => {
    const b = o.body;
    const vl = b.velocity.length();
    if (vl > MAX_LIN) b.velocity.scale(MAX_LIN / vl, b.velocity);
    const al = b.angularVelocity.length();
    if (al > MAX_ANG) b.angularVelocity.scale(MAX_ANG / al, b.angularVelocity);
  });

  objects.forEach(o => {
    o.mesh.position.set(o.body.position.x, o.body.position.y, o.body.position.z);
    o.mesh.quaternion.set(o.body.quaternion.x, o.body.quaternion.y, o.body.quaternion.z, o.body.quaternion.w);
  });

  updateHover();

  renderer.render(scene, camera);
}

function renderOnce() {
  world.step(1 / 60);
  objects.forEach(o => {
    o.mesh.position.set(o.body.position.x, o.body.position.y, o.body.position.z);
    o.mesh.quaternion.set(o.body.quaternion.x, o.body.quaternion.y, o.body.quaternion.z, o.body.quaternion.w);
  });
  renderer.render(scene, camera);
}

function start() {
  if (raf) return;
  clock.getDelta();
  animate();
  document.documentElement.classList.add('scene-ready');
  started = true;
}

/* ---------------------------------------------------------
   resize / 可见性 / 滚动停帧
   --------------------------------------------------------- */
function onResize() {
  if (!renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  bounds = { HX: (vh * camera.aspect) / 2, HY: vh / 2 };
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  else if (!reduced) start();
});

/* 离开首屏后降级渲染，节省性能 */
let lower = false;
window.addEventListener('scroll', () => {
  const canvas = document.getElementById('scene');
  if (!canvas) return;
  const y = window.scrollY || 0;
  const vh = window.innerHeight;
  /* 0.55vh 开始淡出，0.85vh 完全隐藏 */
  const o = y <= vh * 0.55 ? 1 : Math.max(0, 1 - (y - vh * 0.55) / (vh * 0.30));
  canvas.style.opacity = o.toFixed(3);
  const wantLower = y > vh * 0.5;
  if (wantLower !== lower) {
    lower = wantLower;
    renderer && renderer.setPixelRatio(Math.min(window.devicePixelRatio, lower ? 1 : (isMobile ? 1.6 : 2)));
  }
}, { passive: true });

/* ---------------------------------------------------------
   启动
   --------------------------------------------------------- */
window.__pxPlayIntro = () => { if (!started && !reduced) start(); };

if (document.readyState === 'complete') init();
else window.addEventListener('load', init);
