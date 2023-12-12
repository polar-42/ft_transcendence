import { navto } from "./index.js";

let canvas = null;
let ctx = null;

const gridSizeX = 10
const gridSizeY = 10

const boxSize = 60

const offsetX = 10
const offsetY = 100

export function FP_UnLoad()
{
	canvas.removeEventListener('click', FP_mouseClick);
	canvas.removeEventListener('contextmenu', FP_mouseRightClick);
	canvas.removeEventListener('mousedown', FP_mouseDown);
	canvas.removeEventListener('mousemove', FP_mouseMove);
	canvas.removeEventListener('mouseup', FP_mouseUp);
	if (curInterval != undefined)
		clearInterval(curInterval)
	curInterval = undefined
}

const FP_BTN_Validate = 
{
	x : (offsetX + boxSize * gridSizeX + 2) + ((1080 - (offsetX + boxSize * gridSizeX + 2)) / 2) - 100,
	y : 600,
	w : 200,
	h : 50,
	label : 'Confirme',
	color : 'blue',
	hoverColor : 'red'
}

let BoatList = [];

let BoardArray = [];

let validated = false;

var battleshipSocket = null
var gameId = null

var curInterval = undefined

export function initGame()
{
	if (arguments[0] == undefined)
	{
		navto('/battleship/matchmake')
		return
	}
	gameId = arguments[0]
	console.log("GameID = " + gameId)
	console.log("ws://" + window.location.host + '/socketApp/battleship/' + gameId)
	battleshipSocket = new WebSocket("ws://" + window.location.host + '/socketApp/battleship/' + gameId)
	battleshipSocket.onmessage = e => OnMessage(e)
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)
	console.log(data);
	switch (data.function) {
		case 'initGame':
			FP_Init()
			break;
		case 'StartGame':
			FP_UnLoad()
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			SP_Load()
			break;
		case 'StartTurn':
			SP_drawTitle("Your Turn")
			canvas.addEventListener('mousemove', SP_mouseMove);
			break
		case 'StartEnemyTurn':
			SP_drawTitle(data.playerName + " Turn")
			canvas.removeEventListener('mousemove', SP_mouseMove);
			break
		case 'User Disconnnect':
			break
		default:
			break;
	}
	currentTimer = data.timer
}

function SP_mouseMove(event)
{
	const mouseX = event.clientX - canvas.getBoundingClientRect().left;
	const mouseY = event.clientY - canvas.getBoundingClientRect().top; 
	console.log("Mouse X = " + mouseX + " MouseY = " + mouseY)
}

//#region FirstPart

function FP_Timer()
{
	if (currentTimer != -1 )
		currentTimer -= 1
	FP_draw()
}

function FP_Init()
{
	BoatList = [
		{ name : 'Carrier', x : 0, y : 0, startX : 700, startY : 150, ArrayX : -1, ArrayY : -1, size : 5, horizontal : true, isDragging : false },
		{ name : 'BattleShip', x : 0, y : 0, startX : 700, startY : 250, ArrayX : -1, ArrayY : -1, size : 4, horizontal : true, isDragging : false },
		{ name : 'Destroyer', x : 0, y : 0, startX : 700, startY : 350, ArrayX : -1, ArrayY : -1, size : 3, horizontal : true, isDragging : false },
		{ name : 'Submarine', x : 0, y : 0, startX : 700, startY : 450, ArrayX : -1, ArrayY : -1, size : 3, horizontal : true, isDragging : false },
		{ name : 'PatrolBoat', x : 0, y : 0, startX : 700, startY : 550, ArrayX : -1, ArrayY : -1, size : 2, horizontal : true, isDragging : false },
	];

	BoardArray = [];
	validated = false;
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	canvas.addEventListener('click', FP_mouseClick);
	canvas.addEventListener('contextmenu', FP_mouseRightClick);
	canvas.addEventListener('mousedown', FP_mouseDown);
	canvas.addEventListener('mousemove', FP_mouseMove);
	canvas.addEventListener('mouseup', FP_mouseUp);
	for ( let y = 0; y < gridSizeY; y++)
	{
		BoardArray[y] = [];
		for ( let x = 0; x < gridSizeX; x++)
			BoardArray[y][x] = 0;
	}
	BoatList.forEach(element => {
		element.x = element.startX;
		element.y = element.startY;
	});
	curInterval = setInterval(FP_Timer, 1000)
	FP_draw();
}

function FP_drawTitle()
{
	ctx.font = "40px Arial";
	ctx.textAlign = "center"
	ctx.fillStyle = "#0095DD";
	let placedBoat = 0;
	BoatList.forEach(element => {
		if (element.ArrayX != -1)
			placedBoat++;
	});
	if (validated == false)
		ctx.fillText(`Please, Place your navire (` + placedBoat + `/5)`, canvas.width / 2 , 65);
	else
		ctx.fillText(`Please, wait for your opponent`, canvas.width / 2 , 65);
}

function FP_isHover(element, mouseX, mouseY)
{
	if (element.horizontal == true)
	{
		if (mouseX > element.x && mouseX < element.x + element.size * boxSize && mouseY > element.y && mouseY < element.y + boxSize)
			return true;
		return false;
	}
	if (mouseX > element.x && mouseX < element.x + boxSize && mouseY > element.y && mouseY < element.y + element.size * boxSize)
		return true;
	return false;
}

let FP_tmpBoat = {x : 0, y : 0, horizontal : true};

function FP_mouseDown(e)
{
	if (e.button != 0 || validated == true)
		return ;
	const mouseX = e.clientX - canvas.getBoundingClientRect().left;
	const mouseY = e.clientY - canvas.getBoundingClientRect().top;

	BoatList.forEach(element => {
		if (FP_isHover(element, mouseX, mouseY) == true)
		{
			FP_tmpBoat.x = element.x;
			FP_tmpBoat.y = element.y;
			FP_tmpBoat.horizontal = element.horizontal;
			if (element.ArrayX != -1)
			{
				if (element.horizontal == true) 
				{
					for (let i = 0; i < element.size; i++) 
					{
						if (BoardArray[element.ArrayY][element.ArrayX + i] == 1)
							BoardArray[element.ArrayY][element.ArrayX + i] = 0;
					}
				}
				else 
				{
					for (let i = 0; i < element.size; i++) 
					{
						if (BoardArray[element.ArrayY + i][element.ArrayX] == 1)
							BoardArray[element.ArrayY + i][element.ArrayX] = 0;
					}
				}
			}
			// Start dragging
			element.isDragging = true;

			// Save the offset to adjust the position while dragging
			element.offsetX = mouseX - element.x;
			element.offsetY = mouseY - element.y;

			// Change cursor style while dragging
			canvas.style.cursor = 'grabbing';
		}
	});
}

function FP_mouseMove(e) {
	BoatList.forEach(element => {
		if (element.isDragging) {
			const mouseX = e.clientX - canvas.getBoundingClientRect().left;
			const mouseY = e.clientY - canvas.getBoundingClientRect().top;

			// Update the position of the draggable item
			element.x = mouseX - element.offsetX;
			element.y = mouseY - element.offsetY;

			// Clear the canvas and redraw the draggable item
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			FP_draw();

			// Change cursor style while dragging
			canvas.style.cursor = 'grabbing';
		}
	});
}

function FP_mouseUp(e) {
	if (e.button != 0)
		return;
	BoatList.forEach(element => {
		if (element.isDragging == true) {
			element.isDragging = false;
			if (element.x > offsetX - boxSize / 2 && element.x < (offsetX + gridSizeX * boxSize) - boxSize / 2 && element.y > offsetY - boxSize / 2 && element.y < (offsetY + gridSizeY * boxSize) - boxSize / 2) {
				if (FP_isValidPos(element) == true) {

					element.ArrayX = Math.round((element.x - offsetX) / boxSize);
					element.ArrayY = Math.round((element.y - offsetY) / boxSize);
					element.x = element.ArrayX * boxSize + offsetX;
					element.y = element.ArrayY * boxSize + offsetY;
					if (element.horizontal == true) {
						for (let i = 0; i < element.size; i++) {
							if (BoardArray[element.ArrayY][element.ArrayX + i] == 0)
								BoardArray[element.ArrayY][element.ArrayX + i] = 1;
						}
					}
					else {
						for (let i = 0; i < element.size; i++) {
							if (BoardArray[element.ArrayY + i][element.ArrayX] == 0)
								BoardArray[element.ArrayY + i][element.ArrayX] = 1;
						}
					}
				}
				else {
					element.x = FP_tmpBoat.x;
					element.y = FP_tmpBoat.y;
					element.horizontal = FP_tmpBoat.horizontal;
				}
			}
			else {
				element.horizontal = true;
				element.x = element.startX;
				element.y = element.startY;
				element.ArrayX = -1;
				element.ArrayY = -1;
			}
			FP_draw();
		}
		// Change cursor style back to default
		canvas.style.cursor = 'grab';
	});
}

function FP_mouseClick(e)
{
	if (e.button != 0)
		return;
	const mouseX = e.clientX - canvas.getBoundingClientRect().left;
	const mouseY = e.clientY - canvas.getBoundingClientRect().top;
	if (mouseX > FP_BTN_Validate.x && mouseX < FP_BTN_Validate.x + FP_BTN_Validate.w && mouseY > FP_BTN_Validate.y && mouseY < FP_BTN_Validate.y + FP_BTN_Validate.h)
	{
		validated = !validated;
		battleshipSocket.send(JSON.stringify({
			'function': 'sendBoats',
			'input': BoatList
		}))
		FP_draw();
	}
}

function FP_mouseRightClick(e)
{
	// Prevent the default context menu behavior
    e.preventDefault();
	const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
	BoatList.forEach(element => 
	{
		if (element.isDragging)
		{
			element.x =  mouseX;
			element.y =  mouseY;
			element.offsetX = mouseX - element.x;
			element.offsetY = mouseY - element.y;
			element.horizontal = !element.horizontal;
			FP_draw();
		}
	});
}

function FP_drawBoats( dragging )
{
	BoatList.forEach(element => 
	{
		if (element.isDragging == false || dragging == true)
		{
			ctx.beginPath();
			if (element.horizontal == true)
				ctx.rect(element.x, element.y, element.size * boxSize, boxSize);	
			else
				ctx.rect(element.x, element.y, boxSize, element.size * boxSize);
			ctx.fillStyle = "blue";
			ctx.fill();
			ctx.closePath();
		}
	});
}

function FP_drawDragged()
{
	BoatList.forEach(element => 
		{
			if (element.isDragging == true)
			{
				ctx.beginPath();
				if (element.horizontal == true)
					ctx.rect(element.x, element.y, element.size * boxSize, boxSize);	
				else
					ctx.rect(element.x, element.y, boxSize, element.size * boxSize);
				ctx.fillStyle = "red";
				ctx.fill();
				ctx.closePath();
			}
		});
}

function FP_drawValidateButton()
{
	let boatCount = 0;
	BoatList.forEach(element =>
		{
			if (element.ArrayX != -1)
				boatCount++;
		});
	if (boatCount == 5)
	{
		ctx.fillStyle = FP_BTN_Validate.color; // Button color
		ctx.fillRect(FP_BTN_Validate.x, FP_BTN_Validate.y, FP_BTN_Validate.w, FP_BTN_Validate.h);

		ctx.fillStyle = '#fff'; // Text color
		ctx.font = '16px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(FP_BTN_Validate.label, FP_BTN_Validate.x + FP_BTN_Validate.w / 2, FP_BTN_Validate.y + FP_BTN_Validate.h / 2);
	}
}

function FP_draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawTimer()
	FP_drawBoats(false);
	drawGrid();
	FP_drawTitle();
	FP_drawDragged();
	FP_drawValidateButton();
}

function FP_isValidPos(element)
{
	let X = Math.round((element.x - offsetX) / boxSize);
	let Y = Math.round((element.y - offsetY) / boxSize);

	if (element.horizontal == true)
	{
		if (X + element.size - 1  >= gridSizeX)
			return false;
		for (let i = 0; i < element.size; i++)
		{
			if (BoardArray[Y][X + i] == 1)
				return false;
		}
	}
	else
	{
		if (Y + element.size - 1  >= gridSizeY)
			return false;
		for (let i = 0; i < element.size; i++)
		{
			if (BoardArray[Y + i][X] == 1)
				return false;
		}
	}
	return true;
}

//#endregion

//#region SecondPart

function SP_Load()
{
	setInterval(SP_Timer, 1000)
	SP_Draw()
	battleshipSocket.send(JSON.stringify({
		'function': 'LoadEnded',
	}))
}

function SP_Timer()
{
	if (currentTimer != -1 )
		currentTimer -= 1
	drawTimer()
}

function SP_Draw()
{
	ctx.clearRect(offsetX, offsetY, gridSizeX * boxSize, gridSizeY * boxSize)
	drawGrid()
}

function SP_drawTitle(message)
{
	ctx.clearRect(canvas.width / 2 + canvas.width / 4 + canvas.width / 8, 50, 50, 50)
	ctx.font = "40px Arial";
	ctx.textAlign = "center"
	ctx.fillStyle = "#0095DD";
	ctx.fillText(message, canvas.width / 2 , 65);
}

//#endregion

//#region CommonPart


var currentTimer = -1

function drawTimer()
{
	if (currentTimer == -1)
		return
	ctx.clearRect(canvas.width / 2 + canvas.width / 4 + canvas.width / 8 - 25, 50 - 25, 50, 50)
	ctx.beginPath();
	ctx.fillStyle = '#fff'; // Text color
	ctx.font = '16px Arial';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(currentTimer.toString(), canvas.width / 2 + canvas.width / 4 + canvas.width / 8, 50);
	ctx.closePath();
}

function drawABox(x, y)
{

	ctx.beginPath();
	ctx.rect(offsetX + x * boxSize, offsetY + y * boxSize, 2, boxSize);
	ctx.rect(offsetX + x * boxSize, offsetY + y * boxSize, boxSize, 2);
	ctx.rect(offsetX + x * boxSize + boxSize, offsetY + y * boxSize, 2, boxSize);
	ctx.rect(offsetX + x * boxSize, offsetY + y * boxSize + boxSize, boxSize, 2);
	ctx.fillStyle = "green";
	ctx.fill();
	ctx.closePath();
}

function drawGrid()
{
	for (let y = 0; y < gridSizeY; y++)
	{
		for(let x = 0; x < gridSizeX; x++)
		{
			drawABox(x, y);
		}
	}
}
//#endregion