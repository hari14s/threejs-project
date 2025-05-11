import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.Fog(0x000000, 10, 170);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 200);

const canvas = document.querySelector('canvas.threejs');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.0;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);

composer.addPass(outlinePass);

outlinePass.edgeStrength = 6;
outlinePass.edgeGlow = 0.5;
outlinePass.edgeThickness = 2;
outlinePass.visibleEdgeColor.set('#ffffff');
outlinePass.hiddenEdgeColor.set('#000000');


const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.enableDamping = true;
controls.autoRotate = true;
controls.update();

//light
const dirLight = new THREE.DirectionalLight(0xffffff, 4);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
scene.add(dirLight);

//const helper = new THREE.DirectionalLightHelper(dirLight, 5);
//scene.add(helper);

//ground plane
const planeSize = 60;
const loader = new THREE.TextureLoader();
const texture = loader.load('Plaster001_1K-JPG_Color.jpg');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);

texture.encoding = THREE.sRGBEncoding;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
//texture.repeat.set(10, 10);

const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshStandardMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const ground = new THREE.Mesh(planeGeo, planeMat);
ground.rotation.x = Math.PI * -.5;
scene.add(ground);

//cube
const cubeSize = 10;
const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeMat = new THREE.MeshStandardMaterial({color: '#7DF9FF'});
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(-20, cubeSize / 2, -10);
scene.add(cube);

// Sphere
const sphereRadius = 8;
const sphereWidthDivisions = 32;
const sphereHeightDivisions = 16;
const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(15, sphereRadius + 2, 15);
scene.add(sphere);

// Torus
const torusGeo = new THREE.TorusGeometry(6, 1, 16, 100); 
const torusMat = new THREE.MeshStandardMaterial({ color: '#AC8' });
const torus = new THREE.Mesh(torusGeo, torusMat);
torus.position.set(-4, 7, 5);
scene.add(torus);

// Cone
const coneGeo = new THREE.ConeGeometry(6, 8, 32); 
const coneMat = new THREE.MeshStandardMaterial({ color: '#8CA' });
const cone = new THREE.Mesh(coneGeo, coneMat);
cone.position.set(20, 4, -20);
scene.add(cone);

// Cylinder
const cylGeo = new THREE.CylinderGeometry(3, 3, 10, 32);
const cylMat = new THREE.MeshStandardMaterial({ color: '#C8A' });
const cylinder = new THREE.Mesh(cylGeo, cylMat);
cylinder.position.set(-15, 5, 20);
scene.add(cylinder);

// TorusKnot
const torusKnotGeo = new THREE.TorusKnotGeometry(4, 1.2, 100, 16);
const torusKnotMat = new THREE.MeshStandardMaterial({ color: '#F0A' });
const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
torusKnot.position.set(2, 8, -20); 
scene.add(torusKnot);

//camera.position.set(0, 10, 20);
camera.position.set(0, 40, 60);
camera.lookAt(0, 5, 0);

//raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onClick);
const clickableObjects = [cube, sphere, torus, cone, cylinder, torusKnot];

let selectedObjects = [];

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        selectedObjects = [intersects[0].object];
        outlinePass.selectedObjects = selectedObjects;
    } else {
        selectedObjects = [];
        outlinePass.selectedObjects = [];
    }
}

// Resize handler
window.addEventListener('resize', () => {
camera.aspect = window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});


// Animate
function animate() {
  controls.update();
  composer.render();
  requestAnimationFrame(animate);
}

animate();