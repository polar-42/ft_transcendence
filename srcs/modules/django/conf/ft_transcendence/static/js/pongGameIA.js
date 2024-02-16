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
var paddle2;
var ball;
var trail;
var listener;

export function initGamePongIA()
{
	if (socketPongIA != undefined && socketPongIA.readyState != WebSocket.CLOSED)
	{
		if (socketPongIA != undefined)
		{
			socketPongIA.close()
			socketPongIA = undefined
		}
		navto('/games');
		return;
	}
	// console.log("ws://" + window.location.host + '/pongGame/gameVsIA');
	socketPongIA = new WebSocket("ws://" + window.location.host + '/pongGame/gameVsIA');
	//socketPongIA = new WebSocket("wss://" + window.location.host + '/pongGame/gameVsIA');

	document.addEventListener('keydown', doKeyDown);
	document.addEventListener('keyup', doKeyUp);

	socketPongIA.onopen = LaunchGame
	socketPongIA.onclose = FinishGame
	socketPongIA.onmessage = e => OnMessage(e)

}

export function unloadGamePongIA()
{
	// console.log('unloadGamePongIA');
	cancelAnimationFrame(animationId);
	renderer.dispose();
	if (socketPongIA != null)
	{
		socketPongIA.close();
	}
	socketPongIA = null;
	if (canvas != null)
	{
		canvas.style.display="none";
	}
	document.removeEventListener('keydown', doKeyDown);
	document.removeEventListener('keyup', doKeyUp);
}

function init_objects()
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
			camera.position.z = 6;
		}
		frames_to_shake -= 1;
	}

	trail.update()
    renderer.render(scene, camera);
	// labelrenderer.render(scene, camera);
}

function cameraShake() {
	const intensity = 0.3; // Adjust the intensity of the shake

	const originalPosition = camera.position.clone();
	camera.position.x = originalPosition.x + Math.random() * intensity - intensity / 2;
	camera.position.y = originalPosition.y + Math.random() * intensity - intensity / 2;
	camera.position.z = originalPosition.z + Math.random() * intensity - intensity / 2;
}

function updateGameData(data)
{
	if (socketPongIA && socketPongIA.readyState === WebSocket.OPEN)
	{
		paddle1.position.y = data.playerone_pos_y;
		paddle2.position.y = data.playertwo_pos_y;
		ball.position.x = data.ball_pos_x;
		ball.position.y = data.ball_pos_y;
		if ( paddle1.position.y + 1. >= ball.position.y && ball.position.y >= paddle1.position.y - 1. && ball.position.x <= -5. + 0.25 )
		{
			BcameraShake = true;
			paddle1_sound.stop();
			paddle1_sound.play();
		}
		if (paddle2.position.y + 1. >= ball.position.y && ball.position.y >= paddle2.position.y - 1. && ball.position.x >= 5. - 0.25)
		{
			BcameraShake = true;
			paddle2_sound.stop();
			paddle2_sound.play();
		}
		if (( 3.6 < ball.position.y || ball.position.y < -3.6))
		{
			wall_sound.stop();
			wall_sound.play();
		}
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
					socketPongIA.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowUp'
					}))
			} else if (key == 'ArrowDown'|| key == "s") {
					e.preventDefault();
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
	init_objects();
	canvas = document.getElementById("app");
	renderer.domElement.style.border = '4px solid #ccc';
	canvas.appendChild(renderer.domElement);
	console.log('Pong Game vs ia is launch');
	animate();
}

function FinishGame()
{
	console.log('Pong game is finish');
}

function FinishGameByScore(data)
{
	console.log(data)
	renderer.domElement.style.display = "none";
	document.getElementById('score').style.display = "none";
	let message = "Game is finished"; //+ data.winner + " is the winner by the score of " + data.playerone_score + " to " + data.playertwo_score;
	document.getElementById('gameMessage').innerHTML = message;
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)

	if (data.type == 'game_data')
	{
		// console.log('game_data is received');
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
