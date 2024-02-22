import { navto } from "./index.js";
import { Reflector } from "../threejs_addons/Reflector.js";
import { TrailRenderer } from "../threejs_addons/TrailRenderer.js";
import { CSS2DRenderer, CSS2DObject } from "../threejs_addons/CSS2DRenderer.js";
import * as THREE from 'https://threejs.org/build/three.module.js';
import { getProfilePicture } from "./chatApp/CA_General.js";

let WIDTH = document.body.clientWidth * 0.62;
let HEIGHT = WIDTH * (9. / 16.);
var frames_to_shake = 0;
var BcameraShake = false;
let canvas = null;
let socketPongIA = null;
var scene;
var camera;
var renderer;
var paddle1;
var paddle2;
var ball;
var trail;
var three_box = null;
var textElement;
var scoreDisplay;
var isCountingDown = false;

export function countdown()
{
	isCountingDown = true;
	textElement.textContent = "3";
	setTimeout(function(){
		textElement.textContent = "2";
	}, 1000);
	setTimeout(function(){
		textElement.textContent = "1";
	}, 2000);
	setTimeout(function(){
		textElement.textContent = "GO!";
	}, 3000);
	setTimeout(function(){
		textElement.textContent = "";
	}, 4000);
	setTimeout(function(){
		isCountingDown = false;
	}, 4000);
}

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
	renderer.domElement.style.filter = "blur(5px)"
	renderer.dispose();
	if (socketPongIA != null)
	{
		socketPongIA.close();
	}
	socketPongIA = null;
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
	var originalWarning = console.warn; // back up the original method
	console.warn = function(){};
	var loader = new THREE.TextureLoader();
	var texture = loader.load("../../static/js/sounds/corona_bk.png");
	texture.minFilter = THREE.LinearMipmapLinearFilter;
	texture.generateMipmaps = true;
	scene.background = texture;
	console.warn = originalWarning;


	var wallGeometry = new THREE.PlaneGeometry(22, 3);

	var wallUp = new Reflector( wallGeometry, {
		textureWidth: 250 ,
		textureHeight: 50 ,
		color: new THREE.Color(0x7f7f7f)
	} );
	// var wallUp = new THREE.Mesh(wallGeometry, new THREE.MeshBasicMaterial({color:0xaaaaaa}));
	wallUp.position.y = 3.8;
	wallUp.rotation.x = Math.PI / 180 * 90 ;

	var wallDown = new Reflector( wallGeometry, {
		textureWidth: 250 ,
		textureHeight: 50 ,
		color: new THREE.Color(0x7f7f7f)
	} );
	// var wallDown = new THREE.Mesh(wallGeometry, new THREE.MeshBasicMaterial({color:0xaaaaaa}));
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
	var m_ball = new THREE.MeshPhysicalMaterial({
		reflectivity : 0.1,
		transmission : 0.5,
		roughness : 0.8,
		clearcoat : 0.5,
		clearcoatRoughness : 0.35,
		ior : 1.2,
		thickness : 10.0,
		side : THREE.BackSide,
		color : new THREE.Color(0xffaaff),
	});
	ball = new THREE.Mesh(g_ball, m_ball);
	ball.layers.enableAll();
	scene.add(ball);





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
		}
		if (paddle2.position.y + 1. >= ball.position.y && ball.position.y >= paddle2.position.y - 1. && ball.position.x >= 5. - 0.25)
		{
			BcameraShake = true;
		}
		scoreDisplay.textContent = data.playerone_score + " - " + data.playertwo_score;
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
	getNameAndPPAI();

	init_objects();
	canvas = document.querySelector(".canvas_wrapper");
	three_box = document.createElement("div");
	three_box.style.width = WIDTH + 8 + "px";
	three_box.style.height = HEIGHT + 8 + "px";
	//three_box.style.border = '4px solid #ccc';
	three_box.style.position = "relative";
	three_box.setAttribute("id", 'pongGame')
	three_box.appendChild(renderer.domElement);
	canvas.appendChild(three_box);
	textElement = document.createElement("div");
	scoreDisplay = document.createElement("div");
	scoreDisplay.textContent = "0 - 0";
	scoreDisplay.style.whiteSpace = "pre";
	scoreDisplay.style.textAlign = "center";
	scoreDisplay.style.fontSize = HEIGHT / 33 + "px";
	scoreDisplay.style.position = "absolute"; // Set position to absolute
	scoreDisplay.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	scoreDisplay.style.top = "10%"; // Center vertically
	scoreDisplay.style.left = "50%"; // Center horizontally
	scoreDisplay.style.transform = "translate(-50%, -50%)"; // Adjust position to center properly
	scoreDisplay.style.zIndex = "1"; // Ensure it's above other content
	scoreDisplay.style.padding = "10px"; // Example padding for better visualization
	three_box.appendChild(scoreDisplay);
	textElement.textContent = "";
	textElement.style.whiteSpace = "pre";
	textElement.style.textAlign = "center";
	textElement.style.fontSize = HEIGHT / 10 + "px";
	textElement.style.position = "absolute"; // Set position to absolute
	textElement.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	textElement.style.top = "50%"; // Center vertically
	textElement.style.left = "50%"; // Center horizontally
	textElement.style.transform = "translate(-50%, -50%)"; // Adjust position to center properly
	textElement.style.zIndex = "1"; // Ensure it's above other content
	textElement.style.padding = "10px"; // Example padding for better visualization

	three_box.appendChild(textElement);
	console.log('Pong Game vs ia is launch');
	window.onresize = function () {
		WIDTH = document.body.clientWidth * 0.62;
		HEIGHT = WIDTH * (9. / 16.);
		if (HEIGHT > document.body.clientHeight * 0.75)
		{
			HEIGHT = document.body.clientHeight * 0.75
			WIDTH = HEIGHT * (16. / 9.)
		}
		three_box.style.width = WIDTH + 8 + "px";
		three_box.style.height = HEIGHT + 8 + "px";
		scoreDisplay.style.fontSize = HEIGHT / 33 + "px";
		textElement.style.fontSize = HEIGHT / 10 + "px";
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();

		renderer.setSize( WIDTH, HEIGHT );

	};
	animate();
}

async function getNameAndPPAI()
{
	let profilePicture = await getProfilePicture({ 'type': 'user', 'id': 'self' })
	let ppUrl
	if (profilePicture.type == 'image/null')
		ppUrl = "../static/assets/logo/user.png"
	else
		ppUrl = URL.createObjectURL(profilePicture)
	if (document.getElementById('ppPlayer1') == undefined)
		return
	document.getElementById('ppPlayer1').src = ppUrl;

	profilePicture = await getProfilePicture({ 'type': 'user', 'id': '5' })
	ppUrl
	if (profilePicture.type == 'image/null')
		ppUrl = "../static/assets/logo/user.png"
	else
		ppUrl = URL.createObjectURL(profilePicture)
	if (document.getElementById('ppPlayer1') == undefined)
		return
	document.getElementById('ppPlayer2').src = ppUrl;

	console.log(document.getElementById('gamePlayer1').innerHTML += document.querySelectorAll('.profile_dropdown')[0].querySelectorAll('.nav__link')[0].textContent)
}

function FinishGame()
{
	scoreDisplay.remove()
	renderer.domElement.style.filter = "blur(5px)"
	console.log('Pong game is finish');
}

function FinishGameByScore(data)
{
	console.log(data)
	if (data.playerone_score >= 3 || data.playertwo_score >= 3)
	{
		scoreDisplay.textContent = data.playerone_score + " - " + data.playertwo_score;
		if (data.playerone_score < 3) {
			textElement.textContent = "You lose...\r\n";
			textElement.textContent += data.playerone_score + " - " + data.playertwo_score;
			three_box.style.border = '4px solid #0000ff';
		} else {
			textElement.textContent = "You Win!\r\n";
			textElement.textContent += data.playerone_score + " - " + data.playertwo_score;
			three_box.style.border = '4px solid #ff0000';
		}
	}
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)

	//console.log(data)s

	if (data.type == 'game_data')
	{
		// console.log('game_data is received');
		updateGameData(data);
	}
	else if (data.type == 'countdown')
	{
		countdown();
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
	else if (data.type == 'return_to_tournament')
	{
		returnToTournament(data.id)
	}
}
