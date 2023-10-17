const canvas = document.getElementById("pongGame")
const context = canvas.getContext("2d");
canvas.width = 720;
canvas.height = 450;

let scoreOne = 0;
let scoreTwo = 0;
let isGameRunning = false;

document.onkeydown = function doKeyDown(e) {
	const key = e.key;
	if (key == "Enter" && isGameRunning == false)
	{
		ball.speed = 1;
		ball.gravity = 1;
		isGameRunning = true;
	}

	if (key == "w" && playerOne.y - playerOne.gravity > 6) {
		playerOne.y -= playerOne.gravity * 3;
	} else if (key == "s" && playerOne.y + playerOne.gravity < canvas.height - playerOne.height) {
		playerOne.y += playerOne.gravity * 3;
	}

	if (key == "ArrowUp" && playerTwo.y - playerTwo.gravity > 0) {
		playerTwo.y -= playerTwo.gravity * 3;
	} else if (key == "ArrowDown" && playerTwo.y + playerTwo.gravity < canvas.height - playerTwo.height) {
		playerTwo.y += playerTwo.gravity * 3;
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
	width: 5,
	height: 80,
	color: "#fff",
	gravity: 4,
});

/*Player two paddle*/
const playerTwo = new Element({
	x: 705,
	y: 200,
	width: 5,
	height: 80,
	color: "#fff",
	gravity: 4,
});

/*Ball*/
const ball = new Element({
	x: 710 / 2,
	y: 450 / 2,
	width: 5,
	height: 5,
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
}

function drawElement(element) {
	context.fillStyle = element.color;
	context.fillRect(element.x, element.y, element.width, element.height);
}

drawElements();

function loopDraw() {
	window.requestAnimationFrame(loopDraw);
	ballBounce();
}
loopDraw();

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
	if ((ball.y + ball.gravity <= playerTwo.y + playerTwo.height
		&& ball.x + ball.width + ball.speed >= playerTwo.x
		&& ball.y + ball.gravity > playerTwo.y)
		|| (ball.y + ball.gravity > playerOne.y
		&& ball.x + ball.speed <= playerOne.x + playerOne.width
		&& ball.y + ball.gravity <= playerOne.y + playerOne.height)) {
		ball.speed = ball.speed * -1;
		if (ball.speed > 0) {
			ball.speed += 1;
		} else {
			ball.speed -= 1;
		}
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
