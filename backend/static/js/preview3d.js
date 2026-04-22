// ----- BASIC SCENE -----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    5000
);
camera.position.set(400, 400, 400);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(300, 500, 300);
scene.add(dirLight);

// ----- FLOOR -----
const floorGeo = new THREE.PlaneGeometry(1000, 1000);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xc2b280 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ----- WALLS -----
const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });

function createWall(x, z, w, h) {
    const geo = new THREE.BoxGeometry(w, h, 20);
    const wall = new THREE.Mesh(geo, wallMat);
    wall.position.set(x, h / 2, z);
    scene.add(wall);
}

createWall(0, -500, 1000, 200);
createWall(0, 500, 1000, 200);
createWall(-500, 0, 1000, 200);
createWall(500, 0, 1000, 200);

// ----- FABRIC OBJECTS → 3D -----
designData.objects.forEach(obj => {
    if (obj.type === 'rect' && obj.selectable !== false) {
        const w = obj.width * obj.scaleX;
        const h = obj.height * obj.scaleY;

        const geo = new THREE.BoxGeometry(w, 40, h);
        const mat = new THREE.MeshStandardMaterial({ color: obj.fill || '#888' });
        const mesh = new THREE.Mesh(geo, mat);

        mesh.position.set(
            obj.left - 500 + w / 2,
            20,
            obj.top - 500 + h / 2
        );

        scene.add(mesh);
    }
});

// ----- RENDER LOOP -----
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
