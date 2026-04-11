import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

window.addEventListener('load', () => {
  const container = document.getElementById('about3d');
  if (!container) return;

  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w === 0 || h === 0) return;

  // =============================
  // Scene / Camera / Renderer
  // =============================
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // =============================
  // Lighting
  // =============================
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const keyLight = new THREE.PointLight(0x5bc8d8, 4, 20);
  keyLight.position.set(4, 4, 4);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xffffff, 2, 20);
  fillLight.position.set(-4, -2, 3);
  scene.add(fillLight);

  // =============================
  // Text Geometry
  // =============================
  const loader = new FontLoader();
  loader.load(
    'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
    (font) => {
      const geometry = new TextGeometry('LYT', {
        font,
        size: 1.4,
        height: 0.35,
        curveSegments: 16,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.025,
        bevelSegments: 6,
      });
      geometry.center();

      const material = new THREE.MeshStandardMaterial({
        color: 0xddeef0,
        metalness: 0.95,
        roughness: 0.05,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // =============================
      // Mouse Interaction
      // =============================
      let targetX = 0;
      let targetY = 0;

      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.2;
        targetY = -((e.clientY - rect.top) / rect.height - 0.5) * 1.2;
      });

      container.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
      });

      // =============================
      // Animation Loop
      // =============================
      function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.y += (targetX - mesh.rotation.y) * 0.06;
        mesh.rotation.x += (targetY - mesh.rotation.x) * 0.06;
        renderer.render(scene, camera);
      }
      animate();
    }
  );

  // =============================
  // Resize
  // =============================
  window.addEventListener('resize', () => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
});
