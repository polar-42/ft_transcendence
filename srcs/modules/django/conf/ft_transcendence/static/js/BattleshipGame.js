import { navto } from "./index.js"

let canvas = null
let ctx = null

const gridSizeX = 10
const gridSizeY = 10

const boxSize = 60

const offsetX = 10
const offsetY = 100

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

let BoardCases = []

let BoatList = []

let BoardArray = []

let validated = false

var battleshipSocket = null
var gameId = null

var curInterval = undefined

export function initGame()
{
	if (battleshipSocket != undefined && battleshipSocket.readyState != WebSocket.CLOSED)
	{
		if (battleshipSocket != undefined)
		{
			battleshipSocket.close()
			battleshipSocket = undefined
		}
		navto('/games')
		return
	}
	var arg = undefined
	if (window.location.search != '')
		arg = window.location.search.substring(window.location.search.indexOf('=') + 1)
	if (arg == undefined)
	{
		if (battleshipSocket != undefined && battleshipSocket.readyState != WebSocket.CLOSED)
		{
			battleshipSocket.close()
			battleshipSocket = undefined
		}
		navto('/games')
	}
	//battleshipSocket = new WebSocket("wss://" + window.location.host + '/battleshipApp/Game/' + arg)
	battleshipSocket = new WebSocket("ws://" + window.location.host + '/battleshipApp/Game/' + arg)
	battleshipSocket.onclose = (event) => {
		console.log(code.event)
		if (event.code == 3001)
		{
			battleshipSocket = undefined
			navto('/games')
		}
	};
	battleshipSocket.onmessage = e => OnMessage(e)
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)
	switch (data.function) {
		case 'initGame':
			FP_Init()
			break
		case 'StartGame':
			FP_UnLoad()
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			SP_Load()
			break
		case 'StartTurn':
			SP_drawTitle("Your Turn")
			canvas.addEventListener('mousemove', SP_mouseMove)
			canvas.addEventListener('click', SP_mouseClick)
			break
		case 'StartEnemyTurn':
			SP_drawTitle(data.playerName + " Turn")
			SP_selected = undefined
			SP_hovered = undefined
			SP_Draw()
			canvas.removeEventListener('mousemove', SP_mouseMove)
			canvas.removeEventListener('click', SP_mouseClick)
			break
		case 'GameStop':
			RP_GameStop(data.message, data.tournamentId)
			break
		case 'RetrieveBoat':
			FP_SendBoats()
			break
		case 'RetrieveHit':
			SP_SendSelected()
			break
		case 'GotHit':
			break
		case 'HitResult':
			SP_HitCase(data.case, data.result, data.destroyedboat)
			break
		case 'Loose':
			RP_Loose(data.other, data.wAliveBoat)
			break
		case 'Win':
			RP_Win(data.other, data.wAliveBoat, data.lAliveBoat)
			break
		case 'ReturnToMatchmaking':
			if (data.Winner != 'None')
				RP_GameStop('Game end. User ' + data.Winner + ' win.', -1)
			else
				RP_GameStop('Game cancelled.', -1)
			break
		case 'ReturnToTournament':
			RP_GameStop('', data.ID)
			break
		default:
			break
	}
	currentTimer = data.timer
}
//#region ResultPart

function RP_GameStop(message, id)
{
	console.log("Tournament Match = " + id)
	if (curInterval != undefined)
		clearInterval(curInterval)
	curInterval = undefined
	if (id == -1)
	{
		canvas.style.display = 'none'
		var txtNode = document.createTextNode(message)
		canvas.parentElement.appendChild(txtNode)
		battleshipSocket = null
	}
	else
	{
		battleshipSocket = null
		navto("tournaments/Play/?T_ID=" + id)
	}
}

function RP_Loose(other, otherBoat)
{
	if (curInterval != undefined)
		clearInterval(curInterval)
	curInterval = undefined
	canvas.style.display = 'none'
	const txtNode = document.createTextNode("You loose! you destroyed only " + otherBoat + " " + other + " boats.")
	canvas.parentElement.appendChild(txtNode)
	battleshipSocket = null
}

function RP_Win(other, userBoat, otherBoat)
{
	if (curInterval != undefined)
		clearInterval(curInterval)
	curInterval = undefined
	canvas.style.display = 'none'
	const txtNode = document.createTextNode("You win! you destroyed the " + otherBoat + " " + other + " boats when he detroyed only " + userBoat + " of yours")
	canvas.parentElement.appendChild(txtNode)
	battleshipSocket = null
}

//#endregion

//#region FirstPart

function FP_UnLoad()
{
	canvas.removeEventListener('click', FP_mouseClick)
	canvas.removeEventListener('contextmenu', FP_mouseRightClick)
	canvas.removeEventListener('mousedown', FP_mouseDown)
	canvas.removeEventListener('mousemove', FP_mouseMove)
	canvas.removeEventListener('mouseup', FP_mouseUp)
	if (curInterval != undefined)
		clearInterval(curInterval)
	curInterval = undefined
}

function FP_Timer()
{
	if (currentTimer != -1 )
		currentTimer -= 1
	FP_draw()
}

function FP_Init()
{
	BoatList = [
		// { name : 'Carrier', x : 0, y : 0, startX : 700, startY : 150, ArrayX : -1, ArrayY : -1, size : 5, horizontal : true, isDragging : false },
		// { name : 'BattleShip', x : 0, y : 0, startX : 700, startY : 250, ArrayX : -1, ArrayY : -1, size : 4, horizontal : true, isDragging : false },
		// { name : 'Destroyer', x : 0, y : 0, startX : 700, startY : 350, ArrayX : -1, ArrayY : -1, size : 3, horizontal : true, isDragging : false },
		// { name : 'Submarine', x : 0, y : 0, startX : 700, startY : 450, ArrayX : -1, ArrayY : -1, size : 3, horizontal : true, isDragging : false },
		{ name : 'PatrolBoat', x : 0, y : 0, startX : 700, startY : 550, ArrayX : 9, ArrayY : 0, size : 2, horizontal : false, isDragging : false },
	]
	for (let y = 0; y < gridSizeY; y++)
	{
		for(let x = 0; x < gridSizeX; x++)
		{
			BoardCases.push(CreateABox(x, y))
		}
	}
	validated = false
	canvas = document.getElementById("myCanvas")
	ctx = canvas.getContext("2d")
	canvas.addEventListener('click', FP_mouseClick)
	canvas.addEventListener('contextmenu', FP_mouseRightClick)
	canvas.addEventListener('mousedown', FP_mouseDown)
	canvas.addEventListener('mousemove', FP_mouseMove)
	canvas.addEventListener('mouseup', FP_mouseUp)
	for ( let y = 0; y < gridSizeY; y++)
	{
		BoardArray[y] = []
		for ( let x = 0; x < gridSizeX; x++)
			BoardArray[y][x] = 0
	}
	BoatList.forEach(element => {
		element.x = element.startX
		element.y = element.startY
	})
	curInterval = setInterval(FP_Timer, 1000)
	FP_draw()
}

function FP_drawTitle()
{
	ctx.font = "40px Arial"
	ctx.textAlign = "center"
	ctx.fillStyle = "#0095DD"
	let placedBoat = 0
	BoatList.forEach(element => {
		if (element.ArrayX != -1)
			placedBoat++
	})
	if (validated == false)
		ctx.fillText(`Please, Place your navire (` + placedBoat + `/5)`, canvas.width / 2 , 65)
	else
		ctx.fillText(`Please, wait for your opponent`, canvas.width / 2 , 65)
}

function FP_isHover(element, mouseX, mouseY)
{
	if (element.horizontal == true)
	{
		if (mouseX > element.x && mouseX < element.x + element.size * boxSize && mouseY > element.y && mouseY < element.y + boxSize)
			return true
		return false
	}
	if (mouseX > element.x && mouseX < element.x + boxSize && mouseY > element.y && mouseY < element.y + element.size * boxSize)
		return true
	return false
}

let FP_tmpBoat = {x : 0, y : 0, horizontal : true}

function FP_mouseDown(e)
{
	if (e.button != 0 || validated == true)
		return
	const mouseX = e.clientX - canvas.getBoundingClientRect().left
	const mouseY = e.clientY - canvas.getBoundingClientRect().top

	BoatList.forEach(element => {
		if (FP_isHover(element, mouseX, mouseY) == true)
		{
			FP_tmpBoat.x = element.x
			FP_tmpBoat.y = element.y
			FP_tmpBoat.horizontal = element.horizontal
			if (element.ArrayX != -1)
			{
				if (element.horizontal == true)
				{
					for (let i = 0; i < element.size; i++)
					{
						if (BoardArray[element.ArrayY][element.ArrayX + i] == 1)
							BoardArray[element.ArrayY][element.ArrayX + i] = 0
					}
				}
				else
				{
					for (let i = 0; i < element.size; i++)
					{
						if (BoardArray[element.ArrayY + i][element.ArrayX] == 1)
							BoardArray[element.ArrayY + i][element.ArrayX] = 0
					}
				}
			}
			// Start dragging
			element.isDragging = true

			// Save the offset to adjust the position while dragging
			element.offsetX = mouseX - element.x
			element.offsetY = mouseY - element.y

			// Change cursor style while dragging
			canvas.style.cursor = 'grabbing'
		}
	})
}

function FP_mouseMove(e) {
	BoatList.forEach(element => {
		if (element.isDragging) {
			const mouseX = e.clientX - canvas.getBoundingClientRect().left
			const mouseY = e.clientY - canvas.getBoundingClientRect().top

			// Update the position of the draggable item
			element.x = mouseX - element.offsetX
			element.y = mouseY - element.offsetY

			// Clear the canvas and redraw the draggable item
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			FP_draw()

			// Change cursor style while dragging
			canvas.style.cursor = 'grabbing'
		}
	})
}

function FP_mouseUp(e) {
	if (e.button != 0)
		return
	BoatList.forEach(element => {
		if (element.isDragging == true) {
			element.isDragging = false
			if (element.x > offsetX - boxSize / 2 && element.x < (offsetX + gridSizeX * boxSize) - boxSize / 2 && element.y > offsetY - boxSize / 2 && element.y < (offsetY + gridSizeY * boxSize) - boxSize / 2) {
				if (FP_isValidPos(element) == true) {

					element.ArrayX = Math.round((element.x - offsetX) / boxSize)
					element.ArrayY = Math.round((element.y - offsetY) / boxSize)
					element.x = element.ArrayX * boxSize + offsetX
					element.y = element.ArrayY * boxSize + offsetY
					if (element.horizontal == true) {
						for (let i = 0; i < element.size; i++) {
							if (BoardArray[element.ArrayY][element.ArrayX + i] == 0)
								BoardArray[element.ArrayY][element.ArrayX + i] = 1
						}
					}
					else {
						for (let i = 0; i < element.size; i++) {
							if (BoardArray[element.ArrayY + i][element.ArrayX] == 0)
								BoardArray[element.ArrayY + i][element.ArrayX] = 1
						}
					}
				}
				else {
					element.x = FP_tmpBoat.x
					element.y = FP_tmpBoat.y
					element.horizontal = FP_tmpBoat.horizontal
				}
			}
			else {
				element.horizontal = true
				element.x = element.startX
				element.y = element.startY
				element.ArrayX = -1
				element.ArrayY = -1
			}
			FP_draw()
		}
		// Change cursor style back to default
		canvas.style.cursor = 'grab'
	})
}

function FP_SendBoats()
{
	var count = 0
	BoatList.forEach(element => {
		if (element.ArrayPosX != -1)
			count++
	})

	if (count != BoatList.length)
		return false

	battleshipSocket.send(JSON.stringify({
		'function': 'sendBoats',
		'input': BoatList
	}))
	return true
}

function FP_mouseClick(e)
{
	if (e.button != 0)
		return
	const mouseX = e.clientX - canvas.getBoundingClientRect().left
	const mouseY = e.clientY - canvas.getBoundingClientRect().top
	if (mouseX > FP_BTN_Validate.x && mouseX < FP_BTN_Validate.x + FP_BTN_Validate.w && mouseY > FP_BTN_Validate.y && mouseY < FP_BTN_Validate.y + FP_BTN_Validate.h)
	{
		if (FP_SendBoats() == false)
			return
		validated = !validated
		FP_draw()
	}
}

function FP_mouseRightClick(e)
{
	// Prevent the default context menu behavior
    e.preventDefault()
	const mouseX = e.clientX - canvas.getBoundingClientRect().left
    const mouseY = e.clientY - canvas.getBoundingClientRect().top
	BoatList.forEach(element =>
	{
		if (element.isDragging)
		{
			element.x =  mouseX
			element.y =  mouseY
			element.offsetX = mouseX - element.x
			element.offsetY = mouseY - element.y
			element.horizontal = !element.horizontal
			FP_draw()
		}
	})
}

function FP_drawBoats( dragging )
{
	BoatList.forEach(element =>
	{
		if (element.isDragging == false || dragging == true)
		{
			ctx.beginPath()
			if (element.horizontal == true)
				ctx.rect(element.x, element.y, element.size * boxSize, boxSize)
			else
				ctx.rect(element.x, element.y, boxSize, element.size * boxSize)
			ctx.fillStyle = "blue"
			ctx.fill()
			ctx.closePath()
		}
	})
}

function FP_drawDragged()
{
	BoatList.forEach(element =>
		{
			if (element.isDragging == true)
			{
				ctx.beginPath()
				if (element.horizontal == true)
					ctx.rect(element.x, element.y, element.size * boxSize, boxSize)
				else
					ctx.rect(element.x, element.y, boxSize, element.size * boxSize)
				ctx.fillStyle = "red"
				ctx.fill()
				ctx.closePath()
			}
		})
}

function FP_drawValidateButton()
{
	let boatCount = 0
	BoatList.forEach(element =>
		{
			if (element.ArrayX != -1)
				boatCount++
		})
	if (boatCount == BoatList.length)
	{
		ctx.fillStyle = FP_BTN_Validate.color // Button color
		ctx.fillRect(FP_BTN_Validate.x, FP_BTN_Validate.y, FP_BTN_Validate.w, FP_BTN_Validate.h)

		ctx.fillStyle = '#fff' // Text color
		ctx.font = '16px Arial'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText(FP_BTN_Validate.label, FP_BTN_Validate.x + FP_BTN_Validate.w / 2, FP_BTN_Validate.y + FP_BTN_Validate.h / 2)
	}
}

function FP_draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawTimer()
	drawGrid(2)
	FP_drawBoats(false)
	drawGrid(1)
	FP_drawTitle()
	FP_drawDragged()
	FP_drawValidateButton()
}

function FP_isValidPos(element)
{
	let X = Math.round((element.x - offsetX) / boxSize)
	let Y = Math.round((element.y - offsetY) / boxSize)

	if (element.horizontal == true)
	{
		if (X + element.size - 1  >= gridSizeX)
			return false
		for (let i = 0; i < element.size; i++)
		{
			if (BoardArray[Y][X + i] == 1)
				return false
		}
	}
	else
	{
		if (Y + element.size - 1  >= gridSizeY)
			return false
		for (let i = 0; i < element.size; i++)
		{
			if (BoardArray[Y + i][X] == 1)
				return false
		}
	}
	return true
}

//#endregion

//#region SecondPart

var SP_selected = undefined
var SP_hovered = undefined

function SP_HitCase(Tcase, result, boat)
{
	BoardCases.forEach(element => {
		if (element.ArrayPosX == Tcase.ArrayPosX && element.ArrayPosY == Tcase.ArrayPosY)
		{
			element.status = result == false ? -1 : 1

		}
	})
	if (boat != "None")
	{
		BoatList.forEach(element => {
			if (element.name == boat)
				element.status = false
		})
	}
	SP_drawEnemyBoats()
}

function SP_mouseMove(event)
{
	const mouseX = event.clientX - canvas.getBoundingClientRect().left
	const mouseY = event.clientY - canvas.getBoundingClientRect().top
	const ArrayPos = CP_getArrayPos(mouseX, mouseY)
	if (ArrayPos.x == - 1)
	{
		if (SP_hovered != undefined)
		{
			SP_hovered = undefined
			SP_Draw()
		}
	}
	else
	{
		BoardCases.forEach( element => {
			if (element.ArrayPosX == ArrayPos.x && element.ArrayPosY == ArrayPos.y)
				if (SP_hovered != element)
				{
					SP_hovered = element
					SP_Draw()
				}
				return
			})
	}
}

function SP_SendSelected()
{
	if (SP_selected == undefined)
		return false
	battleshipSocket.send(JSON.stringify({
		'function': 'HitCase',
		'input': SP_selected
	}))
	return true
}

function SP_mouseClick(event)
{
	const mouseX = event.clientX - canvas.getBoundingClientRect().left
	const mouseY = event.clientY - canvas.getBoundingClientRect().top

	const ArrayPos = CP_getArrayPos(mouseX, mouseY)

	if (ArrayPos.x == - 1)
	{
		if (mouseX > FP_BTN_Validate.x && mouseX < FP_BTN_Validate.x + FP_BTN_Validate.w && mouseY > FP_BTN_Validate.y && mouseY < FP_BTN_Validate.y + FP_BTN_Validate.h)
		{
			SP_SendSelected()
		}
		else if (SP_selected != undefined)
		{
			SP_selected = undefined
			SP_Draw()
			SP_drawSendBTN()
		}
	}
	else
	{
		BoardCases.forEach( element => {
			if (element.ArrayPosX == ArrayPos.x && element.ArrayPosY == ArrayPos.y)
			{
				if (SP_selected != element)
				{
					if (element.status == 0)
						SP_selected = element
					SP_Draw()
				}
			}
			return
		})
	}
}

function SP_Load()
{
	curInterval = setInterval(SP_Timer, 1000)
	BoatList = [
		// { name : 'Carrier', x : 700, y : 100, size : 5, status : true},
		// { name : 'BattleShip', x : 700, y : 200, size : 4, status : true},
		// { name : 'Destroyer', x : 700, y : 300, size : 3, status : true},
		// { name : 'Submarine', x : 700, y : 400, size : 3, status : true},
		{ name : 'PatrolBoat', x : 700, y : 500, size : 2, status : true},
	]
	SP_drawEnemyBoats()
	SP_Draw()
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
	drawGrid(0)
	SP_drawSendBTN()
}

function SP_drawEnemyBoats()
{
	ctx.clearRect(650, 150, 200, 500)
	BoatList.forEach(element => {
			ctx.beginPath()
			ctx.rect(element.x, element.y, element.size * boxSize, boxSize)
			if (element.status == false)
				ctx.fillStyle = "red"
			else
				ctx.fillStyle = "blue"
			ctx.fill()
			ctx.closePath()
	})

}

function SP_drawTitle(message)
{
	ctx.clearRect(canvas.width / 2 - 200, 25, 400, 70)
	ctx.beginPath()
	ctx.font = "40px Arial"
	ctx.textAlign = "center"
	ctx.fillStyle = "#0095DD"
	ctx.fillText(message, canvas.width / 2 , 65)
	ctx.closePath()
}

function SP_drawSendBTN()
{
	ctx.clearRect(FP_BTN_Validate.x, FP_BTN_Validate.y, FP_BTN_Validate.w, FP_BTN_Validate.h)
	if (SP_selected == undefined)
		return
	ctx.beginPath()
	ctx.fillStyle = FP_BTN_Validate.color // Button color
	ctx.fillRect(FP_BTN_Validate.x, FP_BTN_Validate.y, FP_BTN_Validate.w, FP_BTN_Validate.h)

	ctx.fillStyle = '#fff' // Text color
	ctx.font = '16px Arial'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText("Send", FP_BTN_Validate.x + FP_BTN_Validate.w / 2, FP_BTN_Validate.y + FP_BTN_Validate.h / 2)
	ctx.closePath()
}

//#endregion

//#region CommonPart


var currentTimer = -1

function drawTimer()
{
	if (currentTimer == -1)
		return
	ctx.clearRect(canvas.width / 2 + canvas.width / 4 + canvas.width / 8 - 25, 50 - 25, 50, 50)
	ctx.beginPath()
	ctx.fillStyle = '#fff' // Text color
	ctx.font = '16px Arial'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText(currentTimer.toString(), canvas.width / 2 + canvas.width / 4 + canvas.width / 8, 50)
	ctx.closePath()
}

function CreateABox(x, y)
{
	let Box = {
		ArrayPosX : x,
		ArrayPosY : y,
		status: 0
	}
	return Box
}

function drawGrid(drawPart)
{
	BoardCases.forEach(element => {
		if(drawPart == 1 || drawPart == 0)
		{
			ctx.beginPath()
			ctx.rect(offsetX + element.ArrayPosX * boxSize, offsetY + element.ArrayPosY * boxSize, 2, boxSize)
			ctx.rect(offsetX + element.ArrayPosX * boxSize, offsetY + element.ArrayPosY * boxSize, boxSize, 2)
			ctx.rect(offsetX + element.ArrayPosX * boxSize + boxSize, offsetY + element.ArrayPosY * boxSize, 2, boxSize)
			ctx.rect(offsetX + element.ArrayPosX * boxSize, offsetY + element.ArrayPosY * boxSize + boxSize, boxSize, 2)
			ctx.fillStyle = "green"
			ctx.fill()
			ctx.closePath()
		}
		if(drawPart == 0 || drawPart == 2)
		{
			ctx.beginPath()
			ctx.rect(offsetX + (element.ArrayPosX * boxSize) + 2, offsetY + (element.ArrayPosY * boxSize) + 2, boxSize - 2, boxSize - 2)
			if (element.status != 0)
			{
				if (element.status == 1)
					ctx.fillStyle = "blue"
				else if (element.status == -1)
					ctx.fillStyle = "rgb(155, 155, 3)"
			}
			else if (SP_selected != undefined && SP_selected == element)
				ctx.fillStyle = "grey"
			else if (SP_hovered != undefined && SP_hovered == element)
				ctx.fillStyle = "red"
			else
				ctx.fillStyle = "rgb(186, 252, 3)"
			ctx.fill()
			ctx.closePath()
		}
	})
}

function CP_getArrayPos(mouseX, mouseY)
{
	const BoardLimitX = offsetX + 2 + gridSizeX * boxSize
	const BoardLimitY = offsetY + 2 + gridSizeY * boxSize
	if (mouseX < offsetX || mouseX > BoardLimitX || mouseY < offsetY || mouseY > BoardLimitY)
		return {x : -1, y : -1}
	return {x : Math.floor((mouseX - (offsetX + 2)) / boxSize), y : Math.floor((mouseY - (offsetY + 2)) / boxSize)}
}

export function CP_Unload()
{
	if (battleshipSocket == null)
		return
	if(battleshipSocket.readyState != 3)
		battleshipSocket.close()
	battleshipSocket = null
}

//#endregion
