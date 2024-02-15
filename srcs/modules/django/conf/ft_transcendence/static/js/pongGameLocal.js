import { navto } from "./index.js";
import { Reflector } from "../threejs_addons/Reflector.js";
import { TrailRenderer } from "../threejs_addons/TrailRenderer.js";
import { CSS2DRenderer, CSS2DObject } from "../threejs_addons/CSS2DRenderer.js";
import * as THREE from 'https://threejs.org/build/three.module.js';

const WIDTH = 720;
const HEIGHT = 450;
var frames_to_shake = 0;
var BcameraShake = false;
let canvas = null;
let socketPongIA = null;
var scene;
var camera;
var renderer;
var labelrenderer;
var paddle1;
var paddle1_sound;
var paddle2_sound;
var wall_sound;
var music;
var paddle2;
var ball;
var trail;
var listener;

let context = null;
let requestId = null;

let scoreOne;
let scoreTwo;
let isGameRunning;
let isGamePause;
let bSpeed;
let bGravity;
let gameStarted = false;

class Element {
	constructor(options) {
		this.x = options.x;
		this.y = options.y;
		this.width = options.width;
		this.height = options.height;
		this.dx = options.dx;
		this.dy = options.dy;
	}
}

const playerOne = new Element({
	x: -5.,
	y: 0,
	width: 0.2,
	height: 2.,
	gravity: 0.1,
});

/*Player two paddle*/
const playerTwo = new Element({
	x: 5.,
	y: 0,
	width: 0.2,
	height: 2.,
	gravity: 0.1,
});

/*Ball*/
const Dball = new Element({
	x: 0,
	y: 0,
	width: 0.15,
	height: 0.15,
	speed: 0,
	gravity: 0,
});

export function exit()
{
	// gameStarted = false
}

export function init_objects()
{
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
	camera.position.z = 6;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);

	// labelrenderer = new CSS2DRenderer();
	// labelrenderer.setSize(WIDTH, HEIGHT);
	// labelrenderer.domElement.style.position = 'absolute';

	scene.background = new THREE.TextureLoader().load("../../static/js/sounds/corona_bk.png");



	var wallGeometry = new THREE.PlaneGeometry(22, 3);

	var wallUp = new Reflector( wallGeometry, {
		textureWidth: 500 ,
		textureHeight: 100 ,
		color: new THREE.Color(0x7f7f7f)
	} );
	wallUp.position.y = 3.8;
	wallUp.rotation.x = Math.PI / 180 * 90 ;

	var wallDown = new Reflector( wallGeometry, {
		textureWidth: 500 ,
		textureHeight: 100 ,
		color: new THREE.Color(0x7f7f7f)
	} );
	wallDown.position.y = -3.8;
	wallDown.rotation.x = Math.PI / 180 * -90 ;

	scene.add(wallUp);
	scene.add(wallDown);



	var g_paddle1 = new THREE.BoxGeometry(0.2, 2., 2.);
	var g_paddle2 = new THREE.BoxGeometry(0.2, 2., 2.);
	var m_paddle1 = 	new THREE.MeshPhysicalMaterial({
		reflectivity : 0.3,
		transmission : 1.0,
		roughness : 0.8,
		clearcoat : 0.3,
		clearcoatRoughness : 0.25,
		ior : 1.2,
		thickness : 10.0,
		side : THREE.BackSide,
		color : new THREE.Color(0xff0000),
	});
	paddle1 = new THREE.Mesh(g_paddle1, m_paddle1);
	paddle1.position.x -= 5;
	paddle1.rotation.x = Math.PI / 180 * 90;
	paddle1.renderOrder = 2;
	scene.add(paddle1);

	var m_paddle2 = 	new THREE.MeshPhysicalMaterial({
		reflectivity : 0.3,
		side : THREE.BackSide,
		transmission : 1.0,
		roughness : 0.8,
		clearcoat : 0.3,
		clearcoatRoughness : 0.25,
		color : new THREE.Color(0x0000ff),
		ior : 1.2,
		thickness : 10.0,
	  });
	paddle2 = new THREE.Mesh(g_paddle2, m_paddle2);
	paddle2.position.x += 5;
	paddle2.renderOrder = 2;

	paddle2.rotation.x = Math.PI / 180 * 90;
	scene.add(paddle2);

	

	var g_ball = new THREE.SphereGeometry(0.15, 32, 16)
	var m_ball = new THREE.MeshBasicMaterial({ color: 0xff00ff,});
	ball = new THREE.Mesh(g_ball, m_ball);
	ball.layers.enableAll();
	scene.add(ball);


	
	listener = new THREE.AudioListener();
	camera.add(listener);
	paddle1_sound = new THREE.Audio(listener);
	paddle2_sound = new THREE.Audio(listener);
	wall_sound = new THREE.Audio(listener);
	music = new THREE.Audio(listener);
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load('../../static/js/sounds/bop_1.ogg', function(buffer) {
		paddle1_sound.setBuffer(buffer);
	});
	audioLoader.load('../../static/js/sounds/bop_2.ogg', function(buffer) {
		paddle2_sound.setBuffer(buffer);
	});
	audioLoader.load('../../static/js/sounds/bop_3.ogg', function(buffer) {
		wall_sound.setBuffer(buffer);
	});
	audioLoader.load('../../static/js/sounds/music.mp3', function(buffer) {
		music.setBuffer(buffer);
		music.setLoop(true);
		music.setVolume(0.5);
		music.play();
	});



	const light = new THREE.PointLight(0xffffff, 1000)
	light.position.set(10, 10, 10)
	scene.add(light)
	const alight = new THREE.AmbientLight( 0xF0F0F0 ); // soft white light
	scene.add( alight );



	const trailHeadGeometry = [];
	trailHeadGeometry.push( 
	new THREE.Vector3( -0.1, -0.1, -0.1 ), 
	new THREE.Vector3( 0.0, 0.0, 0.0 ), 
	new THREE.Vector3( 0.1, 0.1, 0.1 ) 
	);
	trail = new TrailRenderer( scene, false );
	trail.setAdvanceFrequency(30);
	const trailMaterial = TrailRenderer.createBaseMaterial();	
	const trailLength = 10;
	trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, ball );
	trail.activate();
	// countdown();
}

export function animate() {
    requestAnimationFrame(animate);
	if (scoreOne > 3 || scoreTwo > 3)
		finishGame();
	if (BcameraShake == true)
	{
		frames_to_shake = 10;
		BcameraShake = false;
	}
	if (frames_to_shake > 0)
	{
		if (frames_to_shake % 2 == 0)
			cameraShake();
		else
		{
			camera.position.x = 0;
			camera.position.y = 0;
			camera.position.z = 6;
		}
		frames_to_shake -= 1;
	}
	trail.update()
    renderer.render(scene, camera);
}

export function cameraShake() {
	const intensity = 0.3; // Adjust the intensity of the shake

	const originalPosition = camera.position.clone();
	camera.position.x = originalPosition.x + Math.random() * intensity - intensity / 2;
	camera.position.y = originalPosition.y + Math.random() * intensity - intensity / 2;
	camera.position.z = originalPosition.z + Math.random() * intensity - intensity / 2;
}

export function initLocalGamePong()
{
	// console.log(gameStarted = false)
	if (gameStarted == true)
	{
    console.log('here')
		gameStarted = false
		navto('/games');
		return;
	}
	gameStarted = true
	document.addEventListener('keydown', doKeyDown);
	document.addEventListener('keyup', doKeyUp);
	scoreOne = 0;
	scoreTwo = 0;
	isGameRunning = false;
	isGamePause = false;
	bSpeed = 0;
	bGravity = 0;
	Dball.x = 0;
	Dball.y = 0;
	playerOne.y = 0;
	playerTwo.y = 0;
	init_objects();
	canvas = document.getElementById("app");
	renderer.domElement.style.border = '4px solid #ccc';
	canvas.appendChild(renderer.domElement);
	console.log('Pong Game vs ia is launch');
	animate();
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function doKeyUp(e) {}

function doKeyDown(e) {
	const key = e.key;
	if (key == "Escape" && isGamePause == false) {
		e.preventDefault();
		bSpeed = ball.speed;
		bGravity = ball.gravity;
		Dball.speed = 0;
		Dball.gravity = 0;
		playerOne.gravity = 0;
		playerTwo.gravity = 0;
		isGamePause = true;
	}

	if (key == "Enter" && isGameRunning == false) {
		e.preventDefault();
		if (getRandomInt(2) == 0) {
			Dball.speed = 2;
		} else {
			Dball.speed = -2;
		}
		if (getRandomInt(2) == 0) {
			Dball.gravity = 2;
		} else {
			Dball.gravity = -2;
		}
		isGameRunning = true;
	} else if (key == "Enter" && isGamePause == true) {
		e.preventDefault();
		Dball.speed = bSpeed;
		Dball.gravity = bGravity;
		playerOne.gravity = 4;
		playerTwo.gravity = 4;
		isGamePause = false;
	}

	if (key == "w" && playerOne.y - playerOne.gravity > 6) {
		e.preventDefault();
		paddle1.position.y += playerOne.gravity;
	} else if (key == "s" && playerOne.y + playerOne.gravity < canvas.height - playerOne.height) {
		e.preventDefault();
		playerOne.y += playerOne.gravity;
	}

	if (key == "ArrowUp" && playerTwo.y - playerTwo.gravity > 0) {
		e.preventDefault();
		playerTwo.y -= playerTwo.gravity ;
	} else if (key == "ArrowDown" && playerTwo.y + playerTwo.gravity < canvas.height - playerTwo.height) {
		e.preventDefault();
		playerTwo.y += playerTwo.gravity;
	}
	animate();
}

function finishGame(c) {
	music.stop();
	c.style.display="none";

	let message;
	if (scoreOne == 3) {
		message = "Game is finished, playerOne is the winner by the score of " + scoreOne + " to " + scoreTwo;
	} else {
		message = "Game is finished, playerTwo is the winner by the score of " + scoreTwo + " to " + scoreOne;
	}

	document.removeEventListener('keydown', doKeyDown);
	document.removeEventListener('keyup', doKeyUp);

	document.getElementById('gameMessage').innerHTML = message;
}
