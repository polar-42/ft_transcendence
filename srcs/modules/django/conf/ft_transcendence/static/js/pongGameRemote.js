import { navto } from "./index.js";

var pongGameSocket = null;
var gameId = null;

export function initGamePong()
{
	if (arguments[0] == undefined)
	{
		navto('/pongGame/pongMatchmaking');
		return;
	}
	gameId = arguments[0];
	console.log("GameID = " + gameId);
	console.log("ws://" + window.location.host + '/pongGame/RemoteGame/' + gameId);
	pongGameSocket = new WebSocket("ws://" + window.location.host + '/pongGame/RemoteGame/' + gameId);
	console.log(pongGameSocket);

	document.addEventListener('keydown', doKeyDown);

	pongGameSocket.onopen = LaunchGame
	pongGameSocket.onclose = FinishGame
	pongGameSocket.onmessage = e => OnMessage(e)
}

export function unLoadGamePong()
{
	if (pongGameSocket != null)
	{
		pongGameSocket.close()
	}
	pongGameSocket = null;
	document.removeEventListener('keydown', doKeyDown);
}

let canvas = null;
let context = null;

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
	height: 60,
	color: "#fff",
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
	speed: 0,
	gravity: 0,
});


function drawElement(element)
{
	context.fillStyle = element.color;
	context.fillRect(element.x, element.y, element.width, element.height);
}

function updateGameData(data)
{
	if (pongGameSocket && pongGameSocket.readyState === WebSocket.OPEN)
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
	if (pongGameSocket && pongGameSocket.readyState === WebSocket.OPEN)
	{
		let secondLeft = data.second_left;

		context.fillText(secondLeft, canvas.width / 2, canvas.height / 2 - 60);
	}
}

function doKeyDown(e)
{
	if (pongGameSocket && pongGameSocket.readyState === WebSocket.OPEN) {
			const key = e.key;
			if (key == "ArrowUp") {
					e.preventDefault();
					console.log('ArrowUp');
					pongGameSocket.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowUp'
					}))
			} else if (key == 'ArrowDown') {
					e.preventDefault();
					console.log('ArrowDown');
					pongGameSocket.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowDown'
					}))
			}
	}
}

function LaunchGame()
{
	canvas = document.getElementById('pongCanvas');
	console.log(canvas)
	context = canvas.getContext('2d');
	canvas.widht = 720;
	canvas.height = 450;

	console.log('Pong Game is launch');
}

function FinishGame()
{
	console.log('Pong game is finish');
	pongGameSocket = null;
}

function FinishGameByScore(data)
{
	console.log(data)
	canvas.style.display="none";
	let message = "Game is finished, " + data.winner + " is the winner by the score of " + data.playerone_score + " to " + data.playertwo_score;
	document.getElementById('gameMessage').innerHTML = message;
	pongGameSocket = null
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
