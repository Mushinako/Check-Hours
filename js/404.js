// Animated 404 by sayafang
function init() {
  // Camera
  let camera = new THREE.PerspectiveCamera(80, 1, 0.1, 10000);
  camera.position.z = 200;

  // Scene
  let scene = new THREE.Scene();

  // Renderer
  let renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(300, 300);

  scene.add(camera);

  $('.bola').append(renderer.domElement);

  // Material
  let pinkMat = new THREE.MeshPhongMaterial({
    color: new THREE.Color('rgb(226,35,213)'),
    emissive: new THREE.Color('rgb(0,0,0)'),
    specular: new THREE.Color('rgb(255,155,255)'),
    shininess: 100,
    shading: THREE.FlatShading,
    transparent: 1,
    opacity: 1
  });

  let L1 = new THREE.PointLight(0xffffff, 1);
  L1.position.z = 100;
  L1.position.y = 100;
  L1.position.x = 100;
  scene.add(L1);

  let L2 = new THREE.PointLight(0xffffff, 0.8);
  L2.position.z = 200;
  L2.position.y = 400;
  L2.position.x = -100;
  scene.add(L2);

  let Ico = new THREE.Mesh(new THREE.IcosahedronGeometry(75, 1), pinkMat);
  Ico.rotation.z = 0.5;
  scene.add(Ico);

  function update() {
    Ico.rotation.x += 2 / 100;
    Ico.rotation.y += 2 / 100;
  }

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    update();
  }

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  // Display JavaScript-Related
  document.getElementById('js').style.display = 'inherit';
  document.getElementById('no-js').style.display = 'none';

  // Animated 404 by sayafang
  init();

  // Redirection
  setTimeout(() => window.location.replace('/Check-Hours/index.html'), 3000);
});
