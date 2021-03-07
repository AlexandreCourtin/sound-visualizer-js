const studs = ['norminet', 'acourtin', 'gsmith', 'rfautier', 'alerandy',
	'fle-roy', 'aleduc', 'baudiber', 'ehouzard', 'fldoucet',
	'cormarti', 'cpaquet', 'esuits', 'mrigal', 'lolivet',
	'jvitry', 'jbulant', 'cmercier', 'roddavid', 'scornaz',
	'tlernoul', 'tle-gac-', 'vbaudot', 'rahassin', 'charly',
	'salty'];

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

let instructionText = document.createElement('div');
let meshGroup;
let meshBody;
let musicLaunched = false;
let audioListener;
let audio;
let audioLoader;
let audioAnalyser;

const min = 0;
const power = .00001;

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
	meshGroup = new Array(600);
	meshBody = new Array(meshGroup.length);
	textures = new Array(studs.length);
	for (let i = 0 ; i < meshGroup.length && i < studs.length ; i++) {
		textures[i] = new THREE.TextureLoader().load( 'https://cdn.intra.42.fr/users/medium_' + studs[i] + '.jpg' );
	}

	for (let i = 0 ; i < meshGroup.length ; i++) {
		meshGroup[i] = new THREE.Group();
		meshBody[i] = new THREE.Mesh(
			new THREE.CircleGeometry(25, 50),
			new THREE.MeshBasicMaterial({
				map: textures[i % studs.length]
			})
		);
		meshBody[i].receiveShadow = false;
		meshGroup[i].add(meshBody[i]);
		meshGroup[i].position.set(Math.cos(i) * 300,
			Math.sin(i) * 300,
			(-i * 10) + 400);
		meshGroup[i].rotation.set(Math.sin(i) * 1, -Math.cos(i) * 1, 0);
		meshGroup[i].scale.set(min, min, min);
		scene.add(meshGroup[i]);
	}

	// TEXT
	instructionText.style.position = 'absolute';
	instructionText.style.width = 100;
	instructionText.style.height = 100;
	instructionText.style.color = "white";
	instructionText.style.fontSize = 42;
	instructionText.innerHTML = "Click anywhere to play music";
	instructionText.style.top = 100 + 'px';
	instructionText.style.left = 100 + 'px';
	document.body.appendChild(instructionText);
}

//LOGIC FUNCTIONS
function loop() {
	const data = audioAnalyser.getFrequencyData();
	if (musicLaunched == true) {
		let xData = 0;

		for (let j = 0 ; j < data.length ; j++) {
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
		document.body.removeChild(instructionText);
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
