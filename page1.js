const studs = ['norminet', 'acourtin', 'gsmith', 'rfautier', 'alerandy',
	'fle-roy', 'aleduc', 'baudiber', 'ehouzard', 'fldoucet',
	'cormarti', 'cpaquet', 'esuits', 'mrigal', 'lolivet',
	'jvitry', 'jbulant', 'cmercier', 'roddavid', 'scornaz',
	'tlernoul', 'tle-gac-', 'vbaudot', 'rahassin', 'charly',
	'salty', 'sophie'];

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

const power = .00003;

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
	textures = new Array(studs.length).fill(undefined).map((_, index) => {
		return new THREE.TextureLoader().load( 'https://cdn.intra.42.fr/users/medium_' + studs[index] + '.jpg' );
	});
	const instancesNumber = 400;
	meshBody = new Array(instancesNumber).fill(undefined).map((_, index) => {
		const body = new THREE.Mesh(
			new THREE.CircleGeometry(25, 4),
			new THREE.MeshBasicMaterial({
				map: textures[index % studs.length]
			}));
		body.receiveShadow = false;
		return body;
	});
	meshGroup = new Array(instancesNumber).fill(undefined).map((_, index) => {
		const group = new THREE.Group();
		group.add(meshBody[index]);
		group.position.set(Math.cos(index) * (instancesNumber - (index * .9)),
			Math.sin(index) * (instancesNumber - (index * .9)),
			(-index * 10) + 400);
		group.rotation.set(Math.sin(index) * 1, -Math.cos(index) * 1, 0);
		group.scale.set(0, 0, 0);
		scene.add(group);
		return group;
	});

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

		xData = data.reduce((accumulator, currentValue) => accumulator + currentValue);
		meshGroup[0].scale.set(xData * power, xData * power, .1);
		for (let i = meshGroup.length - 1 ; i > 0 ; i--) {
			meshGroup[i].scale.set(meshGroup[i - 1].scale.x,
				meshGroup[i - 1].scale.y,
				meshGroup[i - 1].scale.z);
		}
		meshGroup.slice(0).reverse().map((mesh, index) => {
			if (index > 0) {
				const newIndex = meshGroup.length - index - 1;
				mesh.scale.set(meshGroup[newIndex].scale.x,
					meshGroup[newIndex].scale.y,
					meshGroup[newIndex].scale.z);
			}
		});
	}
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	if (musicLaunched == false) {
		musicLaunched = true;
		document.body.removeChild(instructionText);
		audioLoader.load('lastlegs.mp3', (buffer) => {
			audio.setBuffer(buffer);
			audio.setLoop(true);
			audio.play();
		});
	}
}

//MAIN
init();
loop();
