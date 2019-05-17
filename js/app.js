let container;
let camera;
let renderer;
let scene;
let mesh;
let controls;
let angle = 0;
let position = 0;
let interval = 0;
let up = new THREE.Vector3(0, 0, 1);

function init() {
  Physijs.scripts.worker = "/lib/physijs_worker.js";
  Physijs.scripts.ammo = "/lib/ammo.js";

  container = document.querySelector("#scene-container");
  scene = new Physijs.Scene();
  scene.setGravity(new THREE.Vector3(0, -30, 0));
  scene.background = new THREE.Color("lightgrey");

  scene.addEventListener("update", function() {
    scene.simulate(undefined, 1);
  });

  createGround();
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

function createGround() {
  let axes = new THREE.AxisHelper(200);
  scene.add(axes);

  loader = new THREE.TextureLoader();
  ground_material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({
      map: loader.load("images/Pitch3.jpg")
    }),
    0.8, // high friction
    0.4 // low restitution
  );
  ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
  ground_material.map.repeat.set(1, 1);

  pitch_material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({
      map: loader.load("images/Pit.jpg")
    }),
    0.4, // low friction
    0.6 // high restitution
  );
  pitch_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
  pitch_material.map.repeat.set(1, 1);

  pitch = new Physijs.BoxMesh(
    new THREE.BoxGeometry(10, 30, 0.1),
    pitch_material,
    0
  );
  pitch.receiveShadow = true;
  pitch.rotateX(-Math.PI / 2);
  pitch.position.y = 0;
  pitch.position.z = -15;
  pitch.receiveShadow = true;
  scene.add(pitch);

  // Ground
  ground = new Physijs.BoxMesh(
    new THREE.BoxGeometry(1000, 1000, 0.1),
    ground_material,
    0 // mass
  );
  ground.receiveShadow = true;
  ground.rotateX(-Math.PI / 2);
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);
  scene.simulate();
}

function createCamera() {
  const fov = 45;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 1;
  const far = 1000;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 8, 15);
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
    1 // intensity
  );

  // directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight.position.set(0, 10, 0);
  scene.add(ambientLight, directionalLight);
}

function createMeshes() {
  let ballGeometry = new THREE.SphereBufferGeometry(
    0.15,
    50,
    50,
    0,
    Math.PI * 2,
    0,
    Math.PI * 2
  );

  ballMaterial = Physijs.createMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
      flatShading: THREE.FlatShading
    }),
    0.8, // high friction
    0.4 // low restitution
  );

  ballMesh = new Physijs.SphereMesh(ballGeometry, ballMaterial, 0.1);
  ballMesh.position.y = 0.1;
  scene.add(ballMesh);

  curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(2, 5, 0),
    new THREE.Vector3(2, 5, -1),
    new THREE.Vector3(1, 0.6, -22),
    new THREE.Vector3(1, 0.1, -23)
  );

  curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(1, 0.1, -23),
    new THREE.Vector3(1, 0.1, -23),
    new THREE.Vector3(-0.3, 1, -30),
    new THREE.Vector3(-0.3, 1, -30)
  );

  createStumps();
  drawPath();
}

function createStumps() {
  let lgeometry = new THREE.Geometry();
  let lmaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  lgeometry.vertices.push(new THREE.Vector3(-4, 0.1, -5));
  lgeometry.vertices.push(new THREE.Vector3(4, 0.1, -5));
  lgeometry.vertices.push(new THREE.Vector3(4, 0.1, -2));
  lgeometry.vertices.push(new THREE.Vector3(-4, 0.1, -2));
  lgeometry.vertices.push(new THREE.Vector3(-4, 0.1, -5));
  lgeometry.vertices.push(new THREE.Vector3(-2.5, 0.1, -5));
  lgeometry.vertices.push(new THREE.Vector3(-2.5, 0.1, -2));
  lgeometry.vertices.push(new THREE.Vector3(2.5, 0.1, -2));
  lgeometry.vertices.push(new THREE.Vector3(2.5, 0.1, -5));

  crease = new THREE.Line(lgeometry, lmaterial);
  scene.add(crease);

  let anotherCrease = crease.clone();
  anotherCrease.position.z = -23;
  scene.add(anotherCrease);

  var dashedCreaseMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 1,
    gapSize: 5,
    scale: 0.1
  });
  let vgeometry = new THREE.Geometry();
  vgeometry.vertices.push(new THREE.Vector3(-4, 0.1, -5));
  vgeometry.vertices.push(new THREE.Vector3(-4, 0.1, -25));
  vgeometry.vertices.push(new THREE.Vector3(4, 0.1, -25));
  vgeometry.vertices.push(new THREE.Vector3(4, 0.1, -5));
  dashedCrease = new THREE.Line(vgeometry, dashedCreaseMaterial);

  scene.add(dashedCrease);

  loader = new THREE.TextureLoader();
  stumpsmaterial = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({
      map: loader.load("images/wood.jpg")
    }),
    0.5, // high friction
    0.8 // low restitution
  );
  stumpsmaterial.map.wrapS = stumpsmaterial.map.wrapT = THREE.RepeatWrapping;
  stumpsmaterial.map.repeat.set(1, 1);

  let geometry = new THREE.CylinderGeometry(0.07, 0.07, 2, 12);
  let cubeMesh1 = new Physijs.CylinderMesh(geometry, stumpsmaterial, 0.5);

  cubeMesh1.position.set(0, 0.5, -2);
  cubeMesh1.mass = 0;
  scene.add(cubeMesh1);

  let another1 = cubeMesh1.clone();
  another1.mass = 0;
  another1.translateX(-0.2);
  scene.add(another1);

  let another2 = cubeMesh1.clone();
  another2.translateX(0.2);
  another2.mass = 0;
  scene.add(another2);

  let another3 = cubeMesh1.clone();
  another3.mass = 0;
  another3.translateZ(-26);
  scene.add(another3);

  let another4 = another3.clone();
  another4.translateX(-0.2);
  another4.mass = 0;
  scene.add(another4);

  let another5 = another3.clone();
  another5.translateX(0.2);
  another5.mass = 0;
  scene.add(another5);
}

function drawPath() {
  let points = curve.getPoints(50);
  points = points.concat(curve2.getPoints(50));
  let lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  let lineMaterial = new THREE.LineBasicMaterial({
    color: "red",
    linewidth: 5
  });

  scene.add(new THREE.Line(lineGeometry, lineMaterial));
}

function move() {
  let point = curve.getPointAt(position);
  if (isNaN(point.x)) {
    point = curve2.getPointAt((interval += 0.03));
  }
  scene.simulate();
  position += 0.03;

  ballMesh.position.x = point.x;
  ballMesh.position.y = point.y;
  ballMesh.position.z = point.z;

  let angle = getAngle(position);
  ballMesh.quaternion.setFromAxisAngle(up, angle);
}

function getAngle(position) {
  let tangent = curve.getTangent(position).normalize();
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
}

function render() {
  camera.lookAt(new THREE.Vector3(0, 0, -30));
  scene.simulate();

  let gho = ballMesh.clone();
  gho.mass = 0;
  gho.material.transparent = true;
  gho.material.opacity = 0.5;
  scene.add(gho);
  renderer.render(scene, camera);
}

function onWindowResize() {
  console.log("You resized the browser window!");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);

init();
