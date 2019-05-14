// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let renderer;
let scene;
let mesh;
let controls;
var angle = 0;
var position = 0;
var up = new THREE.Vector3(0, 0, 1);

function init() {
  Physijs.scripts.worker = "/lib/physijs_worker.js";
  Physijs.scripts.ammo = "/lib/ammo.js";

  container = document.querySelector("#scene-container");
  scene = new Physijs.Scene();
  scene.setGravity(new THREE.Vector3(0, -10, 0));
  scene.background = new THREE.Color("lightgrey");
  scene.rotateX(-1);
  createCamera();
  createControls();
  createLights();
  createMeshes();
  createRenderer();

  renderer.setAnimationLoop(() => {
    move();
    render();
  });

  container.appendChild(renderer.domElement);
}

function createCamera() {
  const fov = 45;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 1;
  const far = 100;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 5);
  //camera.rotateX(-1);
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
  const planeGeometry = new THREE.PlaneGeometry(2, 10, 10, 1);
  var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  var plane = new Physijs.PlaneMesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.translateY(5);
  //plane.rotateX(-1.57);
  scene.add(plane);

  var axes = new THREE.AxisHelper(20);
  scene.add(axes);

  var geometry = new THREE.SphereBufferGeometry(
    0.1,
    50,
    50,
    0,
    Math.PI * 2,
    0,
    Math.PI * 2
  );

  var material = new THREE.MeshPhongMaterial({
    color: "red",
    flatShading: THREE.FlatShading
  });

  //   var material = new THREE.MeshStandardMaterial({
  //     color: 0xff0000,
  //     flatShading: THREE.FlatShading
  //   });

  mesh = new Physijs.SphereMesh(geometry, material);
  mesh.position.y = 0.1;
  scene.add(mesh);

  var anotherSphere = mesh.clone();
  anotherSphere.position.z = 10;
  anotherSphere.position.x = 10;
  scene.add(anotherSphere);
  curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.5, 0.4, 1),
    new THREE.Vector3(0.5, 1, 1),
    new THREE.Vector3(0.3, 8, 0.01),
    new THREE.Vector3(0.2, 8.5, 0.01)
  );

  var geometry = new THREE.CylinderBufferGeometry(0.4, 0.4, 1, 2);
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  var cubeMesh = new Physijs.CylinderMesh(geometry, material);

  cubeMesh.position.set(6, 7, 8);

  cubeMesh.rotateX(-1.54);
  scene.add(cubeMesh);

  var another = cubeMesh.clone();
  another.position.y = -0.1;
  scene.add(another);
  scene.simulate();
  drawPath();
}

function drawPath() {
  var points = curve.getPoints(50);
  var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff
  });

  scene.add(new THREE.Line(lineGeometry, lineMaterial));
}

function move() {
  scene.simulate();
  position += 0.03;

  var point = curve.getPointAt(position);
  mesh.position.x = point.x;
  mesh.position.y = point.y;
  mesh.position.z = point.z;

  var angle = getAngle(position);
  mesh.quaternion.setFromAxisAngle(up, angle);
}

function getAngle(position) {
  var tangent = curve.getTangent(position).normalize();
  angle = -Math.atan(tangent.x / tangent.y);
  return angle;
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
  scene.simulate();
}

function onWindowResize() {
  console.log("You resized the browser window!");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);

init();
