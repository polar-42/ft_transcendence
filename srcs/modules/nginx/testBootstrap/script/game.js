const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const PlayerH = 100;
const PlayerW = 20;

const ballRadius = 10;

let dx = 2
let dy = 2

let x = canvas.width / 2 - 5;
let y = canvas.height / 2 - 5;

let y1 = canvas.height / 2 - 50;
let y2 = canvas.height / 2 - 50;

let y1Up = false;
let y1Down = false;

function drawBall()
{
	ctx.beginPath();
	ctx.arc(x, y, ballRadius, 0, Math.PI * 2, false);
	ctx.fillStyle = "white";
	ctx.fill();
	ctx.closePath();
}

function drawPlayers()
{
	ctx.beginPath();
	ctx.rect(PlayerW, y1, PlayerW, PlayerH)
	ctx.fillStyle = "blue";
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.rect(canvas.width - PlayerW - 40 / 2, y2, PlayerW, PlayerH)
	ctx.fillStyle = "blue";
	ctx.fill();
	ctx.closePath();
}

function checkBorder()
{
	if (y + dy > canvas.height - ballRadius || y + dy < ballRadius)
	{
		dy = -dy;
	}
}

function movePlayer()
{
	if (y1Down && y1 + 7 + PlayerH < canvas.height)
		y1 += 7;
	else if (y1Up && y1 - 7 > 0)
		y1 -= 7;
}

function draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBall();
	checkBorder();
	drawPlayers();
	movePlayer();
	/*if (x + dx > canvas.width - ballRadius || x + dx < ballRadius)
	{
		dx = -dx;
	}*/

	x += dx;
	y += dy;
}

function keyDownHandler(e) {
	if (e.key === "Up" || e.key === "ArrowUp") {
	  y1Up = true;
	} else if (e.key === "Down" || e.key === "ArrowDown") {
		y1Down = true;
	}
  }
  
  function keyUpHandler(e) {
	if (e.key === "Up" || e.key === "ArrowUp") {
		y1Up = false;
	} else if (e.key === "Down" || e.key === "ArrowDown") {
		y1Down = false;
	}
  }
  

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

setInterval(draw, 10)