import { navto } from '../index.js'

var tournamentSocket = undefined

export function initTournaments()
{
	if (arguments[0] == undefined)
	{
		navto('/tournaments/tournamentsHome');
		return;
	}
	const tournamentId = arguments[0];
	tournamentSocket = new WebSocket("ws://" + window.location.host + '/socketApp/tournamentsApp/' + tournamentId);

	document.getElementById('BTN_Leave').addEventListener('click', leaveTournament);

	tournamentSocket.onopen = launchTournamentSocket
	tournamentSocket.onclose = quitTournamentSocket
	tournamentSocket.onmessage = e => OnMessageTournament(e)
}

function launchTournamentSocket()
{
	console.log('Socket connected');
}

function quitTournamentSocket()
{
	console.log('Socket disconnected');
}

function leaveTournament()
{
	if (tournamentSocket == null)
		return;
	tournamentSocket.close();

	tournamentSocket = null;
	console.log('Socket disconnected');
	navto('/tournaments/tournamentsHome');
	return;
}

function OnMessageTournament(e)
{
	const data = JSON.parse(e.data);
	console.log(data);
	if (data.type == 'queue_tournament_data')
	{
		printPlayersInTournaments(data);
	}
	else if (data.type == 'match_id')
	{
		launchGame(data);
	}
}

function printPlayersInTournaments(data)
{
	document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}

var socketGame = undefined;

function launchGame(data)
{
	socketGame = new WebSocket("ws://" + window.location.host + '/socketApp/tournamentsGame/' + data.match_id);

	socketGame.onopen = launchMatchSocket
	socketGame.onclose = quitMatchSocket
	socketGame.onmessage = e => OnMessageGame(e)
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
	if (socketGame && socketGame.readyState === WebSocket.OPEN)
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
	if (socketGame && socketGame.readyState === WebSocket.OPEN)
	{
		let secondLeft = data.second_left;

		context.fillText(secondLeft, canvas.width / 2, canvas.height / 2 - 60);
	}
}

function doKeyDown(e)
{
	if (socketGame && socketGame.readyState === WebSocket.OPEN) {
			const key = e.key;
			if (key == "ArrowUp") {
					e.preventDefault();
					console.log('ArrowUp');
					socketGame.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowUp'
					}))
			} else if (key == 'ArrowDown') {
					e.preventDefault();
					console.log('ArrowDown');
					socketGame.send(JSON.stringify({
							'message': 'input',
							'input': 'ArrowDown'
					}))
			}
	}
}

function launchMatchSocket()
{
	document.addEventListener('keydown', doKeyDown);

	canvas = document.getElementById('pongCanvas');
	console.log(canvas)
	context = canvas.getContext('2d');
	canvas.widht = 720;
	canvas.height = 450;

	console.log('Pong Game is launch');
}

function quitMatchSocket()
{
	console.log('Pong game is finish');
	socketGame = null;
}

function FinishGameByScore(data)
{
	console.log(data)
	canvas.style.display="none";
	let message = "Game is finished, " + data.winner + " is the winner by the score of " + data.playerone_score + " to " + data.playertwo_score;
	document.getElementById('gameMessage').innerHTML = message;
	socketGame = null
}

function OnMessageGame(e)
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
