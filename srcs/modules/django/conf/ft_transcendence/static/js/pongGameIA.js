import { navto } from "./index.js";
import { TrailRenderer } from "../threejs_addons/TrailRenderer.js";
import * as THREE from 'https://threejs.org/build/three.module.js';
import { OBJLoader } from '../threejs_addons/OBJLoader.js';
const WIDTH = 720;
const HEIGHT = 450;

var BcameraShake = false;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
camera.position.z = 6;
var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor( 0xffffff);


var texture = new THREE.TextureLoader().load( '../../static/js/sounds/sky.jpg' );
var planeGeometry = new THREE.PlaneGeometry(10, 10); // Width and height of the plane
var planeMaterial =  new THREE.ShadowMaterial({ color: 0xffffff, opacity: 0.5, });
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.position.z = -1;
scene.add(plane);

var wallGeometry = new THREE.PlaneGeometry(1000, 2);
var wallMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
var wallUp = new THREE.Mesh( wallGeometry, wallMaterial);
wallUp.position.y = 3.8;
wallUp.rotation.x = Math.PI / 180 * 80 ;


var wallDown = new THREE.Mesh( wallGeometry, wallMaterial);
wallDown.position.y = -3.8;
wallDown.rotation.x = -Math.PI / 180 * 80 ;


scene.add(wallUp);
scene.add(wallDown);

var g_paddle = new THREE.BoxGeometry(0.2, 2., 2.);
var m_paddle1 = 	new THREE.MeshPhysicalMaterial({
	reflectivity : 0,
	transmission : 1.0,
	roughness : 0.2,
	metalness : 0,
	clearcoat : 0.3,
	clearcoatRoughness : 0.25,
	color : new THREE.Color(0xff0000),
	ior : 1.2,
	thickness : 10.0,
	transparent: true,
  });

var paddle1 = new THREE.Mesh(g_paddle, m_paddle1);
paddle1.position.x -= 4;
paddle1.castShadow = true;
paddle1.receiveShadow = true;
scene.add(paddle1);


var listener = new THREE.AudioListener();
camera.add(listener);
var paddle1_sound = new THREE.Audio(listener);
var paddle2_sound = new THREE.Audio(listener);
var wall_sound = new THREE.Audio(listener);
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


var m_paddle2 = 	new THREE.MeshPhysicalMaterial({
	reflectivity : 0,
	transmission : 1.0,
	roughness : 0.2,
	metalness : 0,
	clearcoat : 0.3,
	clearcoatRoughness : 0.25,
	color : new THREE.Color(0x0000ff),
	ior : 1.2,
	thickness : 10.0
  });
var paddle2 = new THREE.Mesh(g_paddle, m_paddle2);
paddle2.position.x += 4;
paddle2.castShadow = true;
paddle2.receiveShadow = true;
scene.add(paddle2);

var g_ball = new THREE.SphereGeometry(0.15, 32, 16)
var m_ball = new THREE.MeshBasicMaterial({ color: 0xff00ff, emissive: 0xffffff});
var ball = new THREE.Mesh(g_ball, m_ball);
ball.castShadow = true;
scene.add(ball);

var directionalLight = new THREE.PointLight(0xff0000, 0.2, 100);
directionalLight.position.set(1, 2, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const trailHeadGeometry = [];
trailHeadGeometry.push( 
  new THREE.Vector3( -0.1, -0.1, -0.1 ), 
  new THREE.Vector3( 0.0, 0.0, 0.0 ), 
  new THREE.Vector3( 0.1, 0.1, 0.1 ) 
);

// create the trail renderer object
const trail = new TrailRenderer( scene, false );

// set how often a new trail node will be added and existing nodes will be updated
trail.setAdvanceFrequency(30);

// create material for the trail renderer
const trailMaterial = TrailRenderer.createBaseMaterial();	

// specify length of trail
const trailLength = 10;

// initialize the trail
trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, ball );
// activate the trail
trail.activate();

function cameraShake() {
	const intensity = 0.3; // Adjust the intensity of the shake

	const originalPosition = camera.position.clone();

	// Randomly shake the camera position
	camera.position.x = originalPosition.x + Math.random() * intensity - intensity / 2;
	camera.position.y = originalPosition.y + Math.random() * intensity - intensity / 2;
	camera.position.z = originalPosition.z + Math.random() * intensity - intensity / 2;
}

var frames_to_shake = 0;

function animate() {
    requestAnimationFrame(animate);
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
			camera.position.z = 5;
		}
		frames_to_shake -= 1;
	}

	trail.update()
    renderer.render(scene, camera);
}
animate();



let canvas = null;
let socketPongIA = null;

export function initGamePongIA()
{
	if (arguments[0] == undefined)
	{
		navto('/pongGame/Home');
		return;
	}

	console.log("ws://" + window.location.host + '/pongGame/gameVsIA');
	socketPongIA = new WebSocket("ws://" + window.location.host + '/pongGame/gameVsIA');

	document.addEventListener('keydown', doKeyDown);
	document.addEventListener('keyup', doKeyUp);
	socketPongIA.onopen = LaunchGame
	socketPongIA.onclose = FinishGame
	socketPongIA.onmessage = e => OnMessage(e)

}

export function unloadGamePongIA()
{
	console.log('unloadGamePongIA');
	if (socketPongIA != null)
	{
		socketPongIA.close();
	}
	socketPongIA = null;
	if (canvas != null)
	{
		renderer.domElement.style.display="none";
	}
	document.removeEventListener('keydown', doKeyDown);
	document.removeEventListener('keyup', doKeyUp);
}

function updateGameData(data)
{
	if (socketPongIA && socketPongIA.readyState === WebSocket.OPEN)
	{
		paddle1.position.y = data.playerone_pos_y;
		paddle2.position.y = data.playertwo_pos_y;
		ball.position.x = data.ball_pos_x;
		ball.position.y = data.ball_pos_y;
		if ( paddle1.position.y + 1. >= ball.position.y && ball.position.y >= paddle1.position.y - 1. && ball.position.x <= -4. + 0.2 )
		{
			BcameraShake = true;
			paddle1_sound.play();
		}
		if (paddle2.position.y + 1. >= ball.position.y && ball.position.y >= paddle2.position.y - 1. && ball.position.x >= 4. - 0.2)
		{
			BcameraShake = true;
			paddle2_sound.play();
		}
		if (!( 3.6 >= ball.position.y && ball.position.y >= -3.6))
		{
			wall_sound.play();
		}
		console.log(data.ball_pos_x, data.ball_pos_y);
		let playerOne_score = data.playerone_score;
		let playerTwo_score = data.playertwo_score;

		document.getElementById('score').innerHTML = playerOne_score + " - " + playerTwo_score;
	}
}

function addTimer(data)
{
	if (socketPongIA && socketPongIA.readyState === WebSocket.OPEN)
	{
		let secondLeft = data.second_left;

		// context.fillText(secondLeft, canvas.width / 2, canvas.height / 2 - 60);
	}
}

function doKeyDown(e)
{
	if (socketPongIA && socketPongIA.readyState === WebSocket.OPEN) {
			const key = e.key;
			if (key == "ArrowUp" || key == "w") {
					e.preventDefault();
					console.log('ArrowUp');
					socketPongIA.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowUp'
					}))
			} else if (key == 'ArrowDown'|| key == "s") {
					e.preventDefault();
					console.log('ArrowDown');
					socketPongIA.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowDown'
					}))
			}
	}
}

function doKeyUp(e)
{
	if (socketPongIA && socketPongIA.readyState === WebSocket.OPEN) {
			const key = e.key;
			// differenciate which released to fluidify mvmt
			if (key == "ArrowUp" || key == "w") {
					e.preventDefault();
					socketPongIA.send(JSON.stringify({
						'message': 'input',
						'input': 'StopMovementUp'
					}))
			} else if (key == 'ArrowDown'|| key == "s") {
				e.preventDefault();
				socketPongIA.send(JSON.stringify({
					'message': 'input',
					'input': 'StopMovementDown'
				}))
		}
	}
}

function LaunchGame()
{
	canvas = document.getElementById("app");
	canvas.widht = 720;
	canvas.height = 450;
	renderer.domElement.style.border = '4px solid #ccc';
	canvas.appendChild(renderer.domElement);
	console.log('Pong Game vs ia is launch');
}

function FinishGame()
{
	console.log('Pong game is finish');
}

function FinishGameByScore(data)
{
	console.log(data)
	renderer.domElement.style.display="none";
	document.getElementById('score').style.display="none";
	let message = "Game is finished"; //+ data.winner + " is the winner by the score of " + data.playerone_score + " to " + data.playertwo_score;
	document.getElementById('gameMessage').innerHTML = message;
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)

	if (data.type == 'game_data')
	{
		console.log('game_data is received');
		updateGameData(data);
	}
	else if (data.type == 'game_timer')
	{
		updateGameData(data);
		addTimer(data);
	}
	else if (data.type == 'game_ending')
	{
		FinishGameByScore(data);
	}
}
