import { navto } from "./index.js";
import { Reflector } from "../threejs_addons/Reflector.js";
import { TrailRenderer } from "../threejs_addons/TrailRenderer.js";
import { CSS2DRenderer, CSS2DObject } from "../threejs_addons/CSS2DRenderer.js";
import * as THREE from 'https://threejs.org/build/three.module.js';
import { getProfilePicture, sleep } from "./chatApp/CA_General.js";

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
var line1;
var line2;
var ball;
var trail;
var three_box = null;
var textElement;
var scoreDisplay;
var isCountingDown = false;

export function countdown()
{
	isCountingDown = true;
	if (isCountingDown == true)
		textElement.textContent = "3";
	setTimeout(function(){
		if (isCountingDown == true)
			textElement.textContent = "2";
	}, 1000);
	setTimeout(function(){
		if (isCountingDown == true)
			textElement.textContent = "1";
	}, 2000);
	setTimeout(function(){
		if (isCountingDown == true)
			textElement.textContent = "GO!";
	}, 3000);
	setTimeout(function(){
		if (isCountingDown == true)
			textElement.textContent = "";
	}, 4000);
	setTimeout(function(){
		isCountingDown = false;
	}, 4000);
}

export async function initGamePongIA()
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
	socketPongIA = new WebSocket("wss://" + window.location.host + '/pongGame/gameVsIA');

	document.addEventListener('keydown', doKeyDown);
	document.addEventListener('keyup', doKeyUp);

	socketPongIA.onopen = LaunchGame
	socketPongIA.onclose = FinishGame
	socketPongIA.onmessage = e => OnMessage(e)

}

export function unloadGamePongIA()
{
	renderer.domElement.style.filter = "blur(5px)"
	renderer.dispose();
	if (socketPongIA != null)
	{
		socketPongIA.close();
	}
	socketPongIA = null;
	document.removeEventListener('keydown', doKeyDown);
	document.removeEventListener('keyup', doKeyUp);
	if (scene != undefined)
	{
		while (scene.children.length > 0)
			scene.remove(scene.children[0])
		renderer.setAnimationLoop(null);
		if (animationid != undefined)
		{
			cancelAnimationFrame(animationid)
			animationid = undefined
		}
		three_box = null;
		frames_to_shake = 0;
		BcameraShake = false;
		canvas = null;
		scene = undefined;
		camera = undefined;
		renderer = undefined;
		paddle1 = undefined;
		paddle2 = undefined;
		line1 = undefined;
		line2 = undefined;
		ball = undefined;
		trail = undefined;
		textElement = undefined;
		scoreDisplay = undefined;
		isCountingDown = false;
	}
}

function init_objects()
{
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
	camera.position.z = 6;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	var originalWarning = console.warn;
	console.warn = function(){};
	var loader = new THREE.TextureLoader();
	var texture = loader.load("../../static/js/sounds/corona_bk.png");
	texture.minFilter = THREE.LinearMipmapLinearFilter;
	texture.generateMipmaps = true;
	scene.background = texture;
	console.warn = originalWarning;


	var wallGeometry = new THREE.PlaneGeometry(22, 3);

	var wallUp = new THREE.Mesh(wallGeometry, new THREE.MeshBasicMaterial({color:0x6F435B}));
	wallUp.position.y = 3.8;
	wallUp.rotation.x = Math.PI / 180 * 90 ;


	var wallDown = new THREE.Mesh(wallGeometry, new THREE.MeshBasicMaterial({color:0x6F435B}));
	wallDown.position.y = -3.8;
	wallDown.rotation.x = Math.PI / 180 * -90 ;

	scene.add(wallUp);
	scene.add(wallDown);



	var g_paddle1 = new THREE.BoxGeometry(0.2, 2., 2.);
	var g_paddle2 = new THREE.BoxGeometry(0.2, 2., 2.);

	paddle1 = new THREE.Mesh(g_paddle1,  new THREE.MeshBasicMaterial({color:0xff0000}));
	paddle1.position.x -= 5;
	paddle1.rotation.x = Math.PI / 180 * 90;
	paddle1.renderOrder = 2;
	scene.add(paddle1);
	var edges = new THREE.EdgesGeometry(g_paddle1);
	var lineMaterial = new THREE.LineBasicMaterial({
		color: 0x000000,
		linewidth: 1,
	});
	line1 = new THREE.LineSegments(edges, lineMaterial);
	line2 = new THREE.LineSegments(edges, lineMaterial);
	scene.add(line1);
	scene.add(line2);
	line1.position.x = -5
	line2.position.x = 5;

	paddle2 = new THREE.Mesh(g_paddle2, new THREE.MeshBasicMaterial({color:0x0000ff}));
	paddle2.position.x += 5;
	paddle2.renderOrder = 2;

	paddle2.rotation.x = Math.PI / 180 * 90;
	scene.add(paddle2);



	var g_ball = new THREE.SphereGeometry(0.15, 32, 16)
	ball = new THREE.Mesh(g_ball, new THREE.MeshBasicMaterial({color:0xffaaff}));
	ball.layers.enableAll();
	scene.add(ball);





	const light = new THREE.PointLight(0xffffff, 1000)
	light.position.set(10, 10, 10)
	scene.add(light)
	const alight = new THREE.AmbientLight( 0xF0F0F0 );
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
}

var animationid = undefined

function animate() {
    animationid = requestAnimationFrame(animate);
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
	const intensity = 0.3;

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
		line1.position.y = paddle1.position.y;
		line2.position.y = paddle2.position.y;
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
	scoreDisplay.style.position = "absolute";
	scoreDisplay.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	scoreDisplay.style.top = "10%"; 
	scoreDisplay.style.left = "50%";
	scoreDisplay.style.transform = "translate(-50%, -50%)";
	scoreDisplay.style.zIndex = "1"; 
	scoreDisplay.style.padding = "10px"; 
	three_box.appendChild(scoreDisplay);
	textElement.textContent = "";
	textElement.style.whiteSpace = "pre";
	textElement.style.textAlign = "center";
	textElement.style.fontSize = HEIGHT / 10 + "px";
	textElement.style.position = "absolute";
	textElement.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	textElement.style.top = "50%"; 
	textElement.style.left = "50%"; 
	textElement.style.transform = "translate(-50%, -50%)";
	textElement.style.zIndex = "1"; 
	textElement.style.padding = "10px"; 

	three_box.appendChild(textElement);
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

	profilePicture = await getProfilePicture({ 'type': 'user', 'id': 'AI' })
	if (profilePicture.type == 'image/null')
		ppUrl = "../static/assets/logo/user.png"
	else
		ppUrl = URL.createObjectURL(profilePicture)
	if (document.getElementById('ppPlayer1') == undefined)
		return
	document.getElementById('ppPlayer2').src = ppUrl;
}

function FinishGame()
{
	isCountingDown = false
	if (renderer)
		renderer.domElement.style.filter = "blur(5px)"
}

function FinishGameByScore(data)
{
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
	isCountingDown = false
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)

	if (data.type == 'game_data')
	{
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
}
