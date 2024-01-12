import { navto } from "./index.js";
import * as THREE from "./three/build/three.module.min.js";

const WIDTH = 720;
const HEIGHT = 450;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
camera.position.z = 5;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor( 0xffffff);

var g_paddle = new THREE.BoxGeometry(1, 2, 2);
var m_paddle1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });

var paddle1 = new THREE.Mesh(g_paddle, m_paddle1);
paddle1.position.x -= 4;
scene.add(paddle1);


var m_paddle2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
var paddle2 = new THREE.Mesh(g_paddle, m_paddle2);
paddle2.position.x += 4;
scene.add(paddle2);

var g_ball = new THREE.SphereGeometry(0.15, 32, 16);
var m_ball = new THREE.MeshBasicMaterial({ color: 0xff00ff });

var g_ball = new THREE.Mesh(g_ball, m_ball);
scene.add(g_ball);

function animate() {
    requestAnimationFrame(animate);
	paddle1.rotation.x += 0.01;
    paddle1.rotation.y += 0.01;
	paddle2.rotation.x += 0.01;
    paddle2.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();



let canvas = null;
let context = null;
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
		canvas.style.display="none";
	}
	document.removeEventListener('keydown', doKeyDown);
}

class Element {
	constructor(options) {
		this.x = options.x;
		this.y = options.y;
		this.width = options.width;
		this.height = options.height;
		this.color = options.color;
		this.speed = options.speed;
		this.gravity = options.gravity;
	}
}

const playerOne = new Element({
	x: 10,
	y: 195,
	width: 8,
	height: 600,
	color: "#fa0",
	gravity: 4,
});

const playerTwo = new Element({
	x: 720 - 8 - 10,
	y: 195,
	width: 8,
	height: 60,
	color: "#fff",
	gravity: 4,
});


const ball = new Element({
	x: 720 / 2,
	y: 450 / 2,
	width: 10,
	height: 10,
	color: "#fff",
	speed: 10,
	gravity: 0,
});


function drawElement(element)
{
	context.fillStyle = element.color;
	context.fillRect(element.x, element.y, element.width, element.height);
}

function updateGameData(data)
{
	if (socketPongIA && socketPongIA.readyState === WebSocket.OPEN)
	{
		playerOne.y = data.playerone_pos_y;
		playerTwo.y = data.playertwo_pos_y;
		ball.x = data.ball_pos_x;
		ball.y = data.ball_pos_y;
		let playerOne_score = data.playerone_score;
		let playerTwo_score = data.playertwo_score;

		context.clearRect(0, 0, canvas.width, canvas.height);
		drawElement(playerOne);
        drawElement(playerTwo);
        drawElement(ball);
		context.fillText(playerOne_score, canvas.width / 2 - 60, 30)
		context.fillText(playerTwo_score, canvas.width / 2 + 60, 30)
	}
}

function addTimer(data)
{
	if (socketPongIA && socketPongIA.readyState === WebSocket.OPEN)
	{
		let secondLeft = data.second_left;

		context.fillText(secondLeft, canvas.width / 2, canvas.height / 2 - 60);
	}
}

function doKeyDown(e)
{
	if (socketPongIA && socketPongIA.readyState === WebSocket.OPEN) {
			const key = e.key;
			if (key == "ArrowUp") {
					paddle1.position.y += 0.1;
					e.preventDefault();
					console.log('ArrowUp');
					socketPongIA.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowUp'
					}))
			} else if (key == 'ArrowDown') {
					paddle1.position.y -= 0.1;
					e.preventDefault();
					console.log('ArrowDown');
					socketPongIA.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowDown'
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
	canvas.style.display="none";
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
