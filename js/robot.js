
// Variables globales que van siempre
var renderer, scene, camera;
var material;
var cameraControls;
var angulo = -0.01;

var base, brazo, antebrazo, mano, pinzas, pinza1, pinza2;

var controls = {
  giro_base: 0,
  giro_brazo: 0,
  giro_antebrazo_y: 0,
  giro_antebrazo_z: 0,
  giro_pinza: 0,
  separacion_pinza: 0,
  alambrado: false,
  animar: false,
  //color: "#ffffff", // valor inicial para el color
  //opcion_si_no: false, // valor booleano
};

// interface de usuario
var gui = new dat.GUI();
// Carpeta Tamaño
var gui_size = gui.addFolder('Control Robot');
gui_size.add(controls, 'giro_base', -180, 180).name("Giro base");
gui_size.add(controls, 'giro_brazo', -45, 45).name("Giro brazo");
gui_size.add(controls, 'giro_antebrazo_y', -180, 180).name("Giro antebrazo Y");
gui_size.add(controls, 'giro_antebrazo_z', -90, 90).name("Giro antebrazo Z");
gui_size.add(controls, 'giro_pinza', -40, 220).name("Giro pinza");
gui_size.add(controls, 'separacion_pinza', 0, 15).name("Separacion pinza");
gui_size.add(controls, 'alambrado').name("Alambrado");
gui_size.add(controls, 'animar').name("Animacion");
//gui_size.add(controls, 'camara_global_activa').name("Camara global");
gui_size.open();

// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function deg2rad(deg) {
  return (deg / 360) * 2 * Math.PI
}

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 10000 );
  camera.position.set( 500, 500, 500 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
    material = new THREE.MeshNormalMaterial();    
    let robot = new THREE.Object3D();

    let geometriaCilindroBase = new THREE.CylinderGeometry(50, 50, 15, 32);
    base = new THREE.Mesh(geometriaCilindroBase, material);
    base.position.y = 15/2;
    robot.add(base);

    brazo = new THREE.Object3D();
    base.add(brazo);

    let geometriaEje = new THREE.CylinderGeometry(20, 20, 18, 32);
    let eje = new THREE.Mesh(geometriaEje, material);
    eje.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    brazo.add(eje);

    let geometriaEsparrago = new THREE.BoxGeometry(12, 120, 18);
    let esparrago = new THREE.Mesh(geometriaEsparrago, material);
    esparrago.position.y = 120/2;
    brazo.add(esparrago);

    let geometriaRotula = new THREE.SphereGeometry(20, 32, 32);
    let rotula = new THREE.Mesh(geometriaRotula, material);
    rotula.position.y = 120;
    brazo.add(rotula);

    antebrazo = new THREE.Object3D();
    antebrazo.position.y = 120;
    brazo.add(antebrazo);
    
    let geometriaDisco = new THREE.CylinderGeometry(22, 22, 6, 32);
    let disco = new THREE.Mesh(geometriaDisco, material);
    antebrazo.add(disco);

    let geometriaNervio = new THREE.BoxGeometry(4, 80, 4);

    w = 5;
    h = 5;

    [-w, w].forEach(x => {
      [-h, h].forEach(z => {
        let nervio = new THREE.Mesh(geometriaNervio, material);
        nervio.position.y = 40;
        nervio.position.x += x;
        nervio.position.z += z;

        antebrazo.add(nervio);
      });
    });

    let geometriaMano = new THREE.CylinderGeometry(15, 15, 40, 32);
    mano = new THREE.Mesh(geometriaMano, material);
    mano.rotateZ(Math.PI / 2);
    mano.rotateX(Math.PI / 2);
    mano.position.y = 80;
    antebrazo.add(mano);

    let geometriaPinza = new THREE.BufferGeometry();
  
    let indices = new Uint16Array( [
      0, 1, 2, // pared corta a
      2, 1, 3,
      
      0, 2, 4, // suelo
      2, 6, 4,

      4, 6, 5, // pared corta b
      5, 6, 7,

      2, 7, 6, // pared larga a
      2, 3, 7,

      0, 4, 5, // pared larga b
      0, 5, 1,

      1, 5, 3, // techo
      3, 5, 7,

      8, 9, 10, // pared corta c
      9, 11, 10,

      8, 4, 9, // suelo a pinza
      9, 4, 6,

      10, 11, 7, // techo a pinza
      10, 7, 5,

      7, 11, 6, // trapecio a
      11, 9, 6,

      8, 10, 4, // trapecio b
      10, 5, 4
    ] );
  
    let vertices = new Float32Array( [
      0, 0, 0,
      0, 20, 0,
      4, 0, 0,
      4, 20, 0,
      
      0, 0, 19,
      0, 20, 19,
      4, 0, 19,
      4, 20, 19,

      0, 5, 38,
      2, 5, 38,
      0, 15, 38,
      2, 15, 38,
    ] );

    pinzas = new THREE.Object3D();
  
    geometriaPinza.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometriaPinza.setIndex( new THREE.BufferAttribute(indices, 1));
    geometriaPinza.computeVertexNormals(); 
    pinza1 = new THREE.Mesh( geometriaPinza, material );
    pinza1.position.x = -10;
    pinzas.add(pinza1);

    pinza2 = new THREE.Mesh( geometriaPinza, material );
    pinza2.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
    pinza2.position.x = 10;
    pinzas.add(pinza2);

    pinzas.position.x = 10;
    pinzas.position.z = -3;
    pinzas.rotateZ(Math.PI / 2);
    mano.add(pinzas);

    base.add(brazo);

    scene.add(robot);
    //pinzas.rotateX(deg2rad(60));

    let geometriaPiso = new THREE.PlaneGeometry(1000, 1000, 50, 10);
    let piso = new THREE.Mesh(geometriaPiso, new THREE.MeshNormalMaterial());
    piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2) ;
    scene.add(piso);

    document.addEventListener('keydown', function(event) {
      let vel = 10;
      console.log(event.key);
      switch (event.key) {
        case 'ArrowUp':
          base.position.x += vel;
          break;
        case 'ArrowDown':
          base.position.x -= vel;
          break;
        case 'ArrowLeft':
          base.position.z += vel;
          break;
        case 'ArrowRight':
          base.position.z -= vel;
          break;
        default:
          break;
      };
    });
}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

var segundos = 0;
var sentido = 1;
function animacion() {
  if (segundos < 15) {
    controls.giro_antebrazo_y += 3;
  } else if (segundos < 45) {
    controls.giro_antebrazo_y -= 3;
  } else if (segundos < 60) {
    controls.giro_antebrazo_y += 3;
  } else if (segundos < 120) {
    controls.separacion_pinza += sentido;
    if (controls.separacion_pinza > 14) {
      sentido = -1;
    } else if (controls.separacion_pinza < 1){
      sentido = 1;
    }
    controls.giro_pinza += 2;
  } else if (segundos < 150) {
    controls.giro_brazo += 1;
    controls.giro_base += 1;
  } else if (segundos < 210) {
    controls.giro_brazo -= 1;
    controls.giro_base -= 1;
  } else if (segundos < 240) {
    controls.giro_brazo += 1;
    controls.giro_base += 1;
  } else if (segundos < 300) {
    controls.separacion_pinza += sentido;
    if (controls.separacion_pinza > 14) {
      sentido = -1;
    } else if (controls.separacion_pinza < 1){
      sentido = 1;
    }
    controls.giro_pinza -= 2;
  } else {
    segundos = 0;
    controls.animar = false;
  }
  segundos += 1;
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();
  base.rotation.set(0, deg2rad(controls.giro_base), 0);
  brazo.rotation.set(0, 0, deg2rad(controls.giro_brazo));
  antebrazo.rotation.set(0, deg2rad(controls.giro_antebrazo_y), deg2rad(controls.giro_antebrazo_z));
  mano.rotation.set(-deg2rad(controls.giro_pinza), 0, Math.PI / 2);
  pinza1.rotation.set(0, deg2rad(controls.separacion_pinza), 0)
  pinza2.rotation.set(0, -deg2rad(controls.separacion_pinza), 0)

  if (controls.animar) {
    animacion()
  }

  material.wireframe = controls.alambrado;
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}
