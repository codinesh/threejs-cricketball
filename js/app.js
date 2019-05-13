// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let renderer;
let scene;
let mesh;
let controls;

function init() {
  container = document.querySelector("#scene-container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color("lightgrey");

  createCamera();
  createControls();
  createLights();
  createMeshes();
  createRenderer();

  renderer.setAnimationLoop(() => {
    update();
    render();
  });

  container.appendChild(renderer.domElement);
}

function createCamera() {
  const fov = 45;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 100;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 10);

  const planeGeometry = new THREE.PlaneGeometry(10, 2, 10, 1);
  var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -0.3 * Math.PI;
  scene.add(plane);
}

function createControls() {
  // Orbital Controls
  controls = new THREE.OrbitControls(camera, container);
  //controls.target = new THREE.Vector3(10, -10, 10);
  //controls.update();
}

function createLights() {
  const ambientLight = new THREE.HemisphereLight(
    0xddeeff, // bright sky color
    0x202020, // dim ground color
    5 // intensity
  );

  // directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight.position.set(10, 10, 10);
  scene.add(ambientLight, directionalLight);
}

function createMeshes() {
  var geometry = new THREE.SphereBufferGeometry(
    0.1,
    50,
    50,
    0,
    Math.PI * 2,
    0,
    Math.PI * 2
  );

  var material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    flatShading: THREE.FlatShading
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.1;
  scene.add(mesh);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialiasing: true
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.physicallyCorrectLights = true;
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;
}

function render() {
  renderer.render(scene, camera);
}

function update() {
  mesh.position.x += 0.001;
  mesh.position.y += 0.001;
  mesh.position.z += 0.01;
}

function onWindowResize() {
  console.log("You resized the browser window!");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);

init();
