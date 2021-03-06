//THREEJS RELATED VARIABLES
var scene,
	camera,
	fieldOfView,
	aspectRatio,
	nearPlane,
	farPlane,
	renderer,
	container;

//SCREEN VARIABLES
var HEIGHT,
	WIDTH,
	windowHalfX,
	windowHalfY;

let meshGroup;
let meshBody;
let musicLaunched = false;
let audioListener;
let audio;
let audioLoader;
let audioAnalyser;

const min = 0;
const power = .0001;

function onWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	windowHalfX = WIDTH / 2;
	windowHalfY = HEIGHT / 2;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

//INIT THREE JS, SCREEN AND MOUSE EVENTS
function init() {
	scene = new THREE.Scene();
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 50;
	nearPlane = 1;
	farPlane = 2000000;
	camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio,
		nearPlane, farPlane);
	camera.position.z = 800;
	camera.position.y = 0;
	renderer = new THREE.WebGLRenderer({alpha: true, antialias: false });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	windowHalfX = WIDTH / 2;
	windowHalfY = HEIGHT / 2;
	window.addEventListener('mousedown', onDocumentMouseDown, false);
	window.addEventListener('resize', onWindowResize, false);

	// AUDIO
	audioListener = new THREE.AudioListener();
	audio = new THREE.Audio(audioListener);
	audioLoader = new THREE.AudioLoader();
	audioAnalyser = new THREE.AudioAnalyser(audio, 2048);

	// MESH
	const id = 'norminet';
	const texture = new THREE.TextureLoader().load( 'https://cdn.intra.42.fr/users/medium_' + id + '.jpg' );

	meshGroup = new Array(3000);
	meshBody = new Array(meshGroup.length);
	for (let i = 0 ; i < meshGroup.length ; i++) {
		meshGroup[i] = new THREE.Group();
		meshBody[i] = new THREE.Mesh(
			new THREE.CircleGeometry(25, 50),
			new THREE.MeshBasicMaterial({
				map: texture
			})
		);
		meshBody[i].receiveShadow = false;
		meshGroup[i].add(meshBody[i]);
		meshGroup[i].position.set(Math.cos(i) * 300, Math.sin(i) * 300, (-i * 10) + 300);
		meshGroup[i].rotation.set(Math.sin(i) * .5, -Math.cos(i) * .5, 0);
		meshGroup[i].scale.set(min, min, min);
		scene.add(meshGroup[i]);
	}
}

//LOGIC FUNCTIONS
function loop() {
	const data = audioAnalyser.getFrequencyData();
	if (musicLaunched == true) {
		let xData = 0;

		for (let j = 400 ; j < 600 ; j++) {
			xData += data[j];
		}
		meshGroup[0].scale.set(min + (xData * power), min + (xData * power), .1);
		for (let i = meshGroup.length - 1 ; i > 0 ; i--) {
			meshGroup[i].scale.set(meshGroup[i - 1].scale.x,
				meshGroup[i - 1].scale.y,
				meshGroup[i - 1].scale.z);
		}
	}
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	if (musicLaunched == false) {
		musicLaunched = true;
		audioLoader.load('anarchyroad.mp3', (buffer) => {
			audio.setBuffer(buffer);
			audio.setLoop(true);
			audio.play();
		});
	}
}

//MAIN
init();
loop();
