
// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 1000 );
  camera.position.set( 40, 25, 5 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
    let material = new THREE.MeshNormalMaterial();    
      
    let escalera = new THREE.Object3D();

    let ancho = 10;
    let alto = 5;
    let geometriaEscalon = new THREE.BoxGeometry(20, alto, ancho);

    let z = 0;
    let y = alto/2;
    
    for (let i = 0; i < 6; i++) {
      let escalon = new THREE.Mesh(geometriaEscalon, material);
      escalon.position.z = z;
      escalon.position.y = y;
      escalera.add(escalon);

      z = z + ancho/2;
      y = y + alto;
    }

    scene.add(escalera);

    let geometriaPiso = new THREE.PlaneGeometry(50, 50, 50, 10);
    let piso = new THREE.Mesh(geometriaPiso, material);
    piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2) ;
    scene.add(piso);
}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}