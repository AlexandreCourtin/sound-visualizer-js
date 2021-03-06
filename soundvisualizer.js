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

let musicLaunched = false;
let audioListener;
let audio;
let audioLoader;
let audioAnalyser;

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
	farPlane = 2000;
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
	const texture = new THREE.TextureLoader().load( 'https://cdn.intra.42.fr/users/medium_' + 'norminet' + '.jpg' );
	meshGroup = new THREE.Group();
	meshBody = new THREE.Mesh(
		new THREE.CircleGeometry(25, 100),
		new THREE.MeshBasicMaterial({
			map: texture
		})
	);
	meshBody.receiveShadow = false;
	meshGroup.add(meshBody);
	scene.add(meshGroup);
}

//LOGIC FUNCTIONS
function loop() {
	const data = audioAnalyser.getFrequencyData();
	if (musicLaunched == true) {
		const min = 1;
		const power = .0001;

		let xData = 0;
		let yData = 0;

		for (let i = 0 ; i < 500 ; i++) {
			xData += data[i + 300];
			yData += data[i];
		}
		meshGroup.scale.set(min + (xData * power), min + (yData * power), .1);
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
			audio.play();  // Start playback
		});
	}
}

//MAIN
init();
loop();
