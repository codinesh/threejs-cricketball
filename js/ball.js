// three.js info box follows shape
var renderer, scene, camera;
var angle = 0;
var position = 0;

// direction vector for movement
var direction = new THREE.Vector3(1, 0, 0);
var up = new THREE.Vector3(0, 0, 1);
var axis = new THREE.Vector3();
// scalar to simulate speed
var speed = 0.8;

init();
animate();

function init() {
  // info
  var info =
    // renderer
    (renderer = new THREE.WebGLRenderer({
      antialias: true
    }));
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();
  // ambient light
  var ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  var planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
  var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -0.3 * Math.PI;
  scene.add(plane);

  // directional light
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(-1, -1, 1);
  scene.add(directionalLight);

  // camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(-60, 40, 30);
  camera.up.set(3, 0, 0);
  //camera.lookAt(scene.position);

  // controls
  controls = new THREE.OrbitControls(camera);
  //controls.target = new THREE.Vector3(10, -10, 10);
  controls.update();

  // material
  var material = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    shading: THREE.FlatShading
  });

  var geometry = new THREE.SphereGeometry(
    3,
    50,
    50,
    0,
    Math.PI * 2,
    0,
    Math.PI * 2
  );
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  curve = new THREE.CubicBezierCurve(
    new THREE.Vector2(-25, 15),
    new THREE.Vector2(-16, 20),
    new THREE.Vector2(15, 5),
    new THREE.Vector2(18, 1)
  );

  drawPath();

  // Start angle and point
  previousAngle = getAngle(position);
  previousPoint = curve.getPointAt(position);
}

function drawPath() {
  var vertices = curve.getSpacedPoints(50);

  // Change 2D points to 3D points
  for (var i = 0; i < vertices.length; i++) {
    point = vertices[i];
    vertices[i] = new THREE.Vector3(point.x, point.y, 0);
  }
  var lineGeometry = new THREE.Geometry();
  lineGeometry.vertices = vertices;
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff
  });
  var line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);
}

function move() {
  // add up to position for movement
  position += 0.01;

  // get the point at position
  var point = curve.getPointAt(position);
  mesh.position.x = point.x;
  mesh.position.y = point.y;

  var angle = getAngle(position);
  // set the quaternion
  mesh.quaternion.setFromAxisAngle(up, angle);

  previousPoint = point;
  previousAngle = angle;
}

function getAngle(position) {
  // get the 2Dtangent to the curve
  var tangent = curve.getTangent(position).normalize();

  // change tangent to 3D
  angle = -Math.atan(tangent.x / tangent.y);

  return angle;
}

// render
function render() {
  renderer.render(scene, camera);
}

// animate
function animate() {
  move();
  requestAnimationFrame(animate);
  render();
}
