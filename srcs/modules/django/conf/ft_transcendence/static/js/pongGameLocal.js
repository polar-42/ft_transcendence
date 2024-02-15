import { navto } from "./index.js";

let canvas = null;
let context = null;
let requestId = null;

let scoreOne;
let scoreTwo;
let isGameRunning;
let isGamePause;
let bSpeed;
let bGravity;
let gameStarted = false;


export function exit()
{
	// gameStarted = false
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
	// console.log(document.innerHTML)
	canvas = document.getElementById("pongCanvasLocal");
	context = canvas.getContext("2d");
	document.addEventListener('keydown', doKeyDown);
	scoreOne = 0;
	scoreTwo = 0;
	isGameRunning = false;
	isGamePause = false;
	bSpeed = 0;
	bGravity = 0;
	ball.x = 710 / 2;
	ball.y = 450 / 2;
	playerOne.y = 200;
	playerTwo.y = 200;
	loopDraw();
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function doKeyDown(e) {
	const key = e.key;
	if (key == "Escape" && isGamePause == false) {
		e.preventDefault();
		bSpeed = ball.speed;
		bGravity = ball.gravity;
		ball.speed = 0;
		ball.gravity = 0;
		playerOne.gravity = 0;
		playerTwo.gravity = 0;
		isGamePause = true;
	}

	if (key == "Enter" && isGameRunning == false) {
		e.preventDefault();
		if (getRandomInt(2) == 0) {
			ball.speed = 2;
		} else {
			ball.speed = -2;
		}
		if (getRandomInt(2) == 0) {
			ball.gravity = 2;
		} else {
			ball.gravity = -2;
		}
		isGameRunning = true;
	} else if (key == "Enter" && isGamePause == true) {
		e.preventDefault();
		ball.speed = bSpeed;
		ball.gravity = bGravity;
		playerOne.gravity = 4;
		playerTwo.gravity = 4;
		isGamePause = false;
	}

	if (key == "w" && playerOne.y - playerOne.gravity > 6) {
		e.preventDefault();
		playerOne.y -= playerOne.gravity * 5;
	} else if (key == "s" && playerOne.y + playerOne.gravity < canvas.height - playerOne.height) {
		e.preventDefault();
		playerOne.y += playerOne.gravity * 5;
	}

	if (key == "ArrowUp" && playerTwo.y - playerTwo.gravity > 0) {
		e.preventDefault();
		playerTwo.y -= playerTwo.gravity * 5;
	} else if (key == "ArrowDown" && playerTwo.y + playerTwo.gravity < canvas.height - playerTwo.height) {
		e.preventDefault();
		playerTwo.y += playerTwo.gravity * 5;
	}
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

/*Player one paddle*/
const playerOne = new Element({
	x: 10,
	y: 200,
	width: 8,
	height: 60,
	color: "#fff",
	gravity: 4,
});

/*Player two paddle*/
const playerTwo = new Element({
	x: 705,
	y: 200,
	width: 8,
	height: 60,
	color: "#fff",
	gravity: 4,
});

/*Ball*/
const ball = new Element({
	x: 720 / 2,
	y: 450 / 2,
	width: 10,
	height: 10,
	color: "#fff",
	speed: 0,
	gravity: 0,
});

/*Player one score text*/
function displayScorePlayerOne() {
	context.font = "18px Arial";
	context.fillStyle = "#fff";
	context.fillText(scoreOne, canvas.width / 2 - 60, 30);
}

/*Player two score text*/
function displayScorePlayerTwo() {
	context.font = "18px Arial";
	context.fillStyle = "#";
	context.fillText(scoreTwo, canvas.width / 2 + 60, 30);
}

/*Draw elements*/
function drawElements() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawElement(playerOne);
	drawElement(playerTwo);
	drawElement(ball);
	displayScorePlayerOne();
	displayScorePlayerTwo();
	if (isGamePause == true) {
		context.font = "25px Arial";
		context.fillStyle = "#fff";
		context.fillText("PAUSE", canvas.width / 2 - 30, canvas.height / 2 + 10);
	}
	if (isGameRunning == false) {
		context.font = "25px Arial";
		context.fillStyle = "#fff";
		context.fillText("Press Enter to Play", canvas.width / 2 - 105, canvas.height / 2 - 50);
	}
}

function drawElement(element) {
	context.fillStyle = element.color;
	context.fillRect(element.x, element.y, element.width, element.height);
}


function loopDraw() {
	requestId = window.requestAnimationFrame(loopDraw);

	if (scoreOne >= 3 || scoreTwo >= 3) {
		window.cancelAnimationFrame(requestId);
		finishGame(canvas);
	} else {
		ballBounce();
	}
}

/*Make ball bounce*/
function ballBounce() {
	if (ball.y + ball.gravity <= 0 || ball.y + ball.gravity >= canvas.height) {
		ball.gravity = ball.gravity * -1;
		ball.y += ball.gravity;
		ball.x += ball.speed;
	} else {
		ball.y += ball.gravity;
		ball.x += ball.speed;
	}
	ballWallCollision();
}

/*Detect collision*/
function ballWallCollision() {
	if (ball.y + ball.gravity <= playerTwo.y + playerTwo.height
		&& ball.x + ball.width + ball.speed >= playerTwo.x
		&& ball.y + ball.gravity > playerTwo.y) {

			let relative_intersect_y = (ball.y + 10 * 2) - (playerTwo.y + 60 / 2);
			let normalized_relative_intersect_y = relative_intersect_y / (60 / 2);
			let bounce_angle = normalized_relative_intersect_y * (Math.PI / 4);

			ball.speed = -4;
			if (ball.gravity > 0) {
				ball.gravity = -4;
			}
			else {
				ball.gravity = 4;
			}

			ball.speed = ball.speed * Math.cos(bounce_angle);
            ball.gravity = ball.gravity * -Math.sin(bounce_angle);

            let totalspeed = Math.abs(ball.speed) + Math.abs(ball.gravity);
            ball.speed = (ball.speed / totalspeed) * 8;
            ball.gravity = (ball.gravity / totalspeed) * 8;

	} else if (ball.y + ball.gravity > playerOne.y
		&& ball.x + ball.speed <= playerOne.x + playerOne.width
		&& ball.y + ball.gravity <= playerOne.y + playerOne.height) {

			let relative_intersect_y = (ball.y + 10 * 2) - (playerOne.y + 60 / 2);
            let normalized_relative_intersect_y = relative_intersect_y / (60 / 2);
            let bounce_angle = normalized_relative_intersect_y * (Math.PI / 4);

            ball.speed = 4;
            if (ball.gravity > 0) {
				ball.gravity = -4;
			} else {
				ball.gravity = 4;
			}

            ball.speed = ball.speed * Math.cos(bounce_angle);
            ball.gravity = ball.gravity * -Math.sin(bounce_angle);

            let total_speed = Math.abs(ball.speed) + Math.abs(ball.gravity);
            ball.speed = (ball.speed / total_speed) * 8;
            ball.gravity = (ball.gravity / total_speed) * 8;

	} else if (ball.x + ball.speed < playerOne.x) {
		scoreTwo += 1;
		isGameRunning = false;
		ball.speed = 0;
		ball.gravity = 0;
		ball.x = 710 / 2;
		ball.y = 450 / 2;
	} else if (ball.x + ball.speed > playerTwo.x + playerTwo.width) {
		scoreOne += 1;
		isGameRunning = false;
		ball.speed = 0;
		ball.gravity = 0;
		ball.x = 710 / 2;
		ball.y = 450 / 2;
	}

	drawElements();

}

function finishGame(c) {

	c.style.display="none";

	let message;
	if (scoreOne == 3) {
		message = "Game is finished, playerOne is the winner by the score of " + scoreOne + " to " + scoreTwo;
	} else {
		message = "Game is finished, playerTwo is the winner by the score of " + scoreTwo + " to " + scoreOne;
	}

	document.removeEventListener('keydown', doKeyDown);


	canvas = null;
	context = null;

	scoreOne = 0
	scoreTwo = 0
	isGameRunning = false
	isGamePause = false
  gameStarted = false
	bSpeed = 0
	bGravity = 0

	ball.x = 710 / 2
	ball.y = 450 / 2

	playerOne.y = 200
	playerTwo.y = 200

	document.getElementById('gameMessage').innerHTML = message;
}
