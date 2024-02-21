import { navto } from "./index.js"
import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from "../threejs_addons/OrbitControls.js";

let WIDTH = document.body.clientWidth * 0.75;
let HEIGHT = WIDTH * (9. / 16.);

let canvas = null
let ctx = null

const gridSizeX = 10
const gridSizeY = 10
const boxSize = 1;
const offsetX = 10
const offsetY = 100

let mouse = new THREE.Vector2();

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

let Boatm = []

let BoardArray = []

let validated = false

var battleshipSocket = null
var gameId = null

var curInterval = undefined

let CURRENT_SELECTION = null;
let CURRENT_COLOR = null;

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
	battleshipSocket = new WebSocket("wss://" + window.location.host + '/battleshipApp/Game/' + arg)
	// battleshipSocket = new WebSocket("ws://" + window.location.host + '/battleshipApp/Game/' + arg)
	battleshipSocket.onclose = (event) => {
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
			document.addEventListener('mousemove', SP_mouseMove)
			document.addEventListener('click', SP_mouseClick)
			break
		case 'StartEnemyTurn':
			SP_drawTitle(data.playerName + " Turn")
			SP_Draw()
			document.removeEventListener('mousemove', SP_mouseMove)
			document.removeEventListener('click', SP_mouseClick)
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
	// console.log("Tournament Match = " + id)
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
		navto("/tournaments/Play/?id=" + id)
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
	document.removeEventListener('mousedown', FP_mouseDown)
	document.removeEventListener('mousemove', FP_mouseMove)
	// console.log("42 omg")
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

const boardGroup = new THREE.Group();
const boardSizeX = 10;
const boardSizeY = 10;
 // Adjust as needed
const boardOffsetX = 0; // Adjust as needed
const boardOffsetY = 0; // Adjust as needed
let boatToPlace = null;
let scene;
let camera;
let renderer;
let controls;
let raycaster;
let INTERSECTED = null;


function boatCreate() {
	BoatList = [
	  {
		name: "Carrier",
		x: 0,
		y: 0,
		ArrayX: 0,
		ArrayY: 11,
		size: 5,
		horizontal: true,
	  },
	  {
		name: "BattleShip",
		x: 0,
		y: 0,
		ArrayX: 8,
		ArrayY: 11,
		size: 4,
		horizontal: true,
	  },
	  {
		name: "Destroyer",
		x: 0,
		y: 0,
		ArrayX: 4,
		ArrayY: 13,
		size: 3,
		horizontal: true,
	  },
	  {
		name: "Submarine",
		x: 0,
		y: 0,
		ArrayX: 0,
		ArrayY: 13,
		size: 3,
		horizontal: true,
	  },
	  {
		name: "PatrolBoat",
		x: 0,
		y: 0,
		ArrayX: 8,
		ArrayY: 13,
		size: 2,
		horizontal: true,
	  },
	];
	for (let i = 0; i < BoatList.length; i++) {
	  const geometry = new THREE.BoxGeometry(BoatList[i].size, 1, 1);
	  const material = new THREE.MeshBasicMaterial({ color: 0x550055 });
	  const boat = new THREE.Mesh(geometry, material);
	  boat.self = BoatList[i];
	  Boatm.push(boat);
	  boat.position.x = BoatList[i].ArrayX + 1;
	  boat.position.z = BoatList[i].ArrayY;
	  boat.position.y = 1;
	  boat.width = BoatList[i].size;
	  boat.type = "boat";
	  boat.pos = [-1, -1];
	  boat.orientation = BoatList[i].horizontal;
	  scene.add(boat);
	}
  }

function FP_Init()
{
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.z = 17;
	camera.position.x = 8;
	camera.position.y = 12;
	renderer = new THREE.WebGLRenderer({ antialiasing: true });
	raycaster = new THREE.Raycaster()
	renderer.setSize(WIDTH, HEIGHT);
	controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(5, 0, 5);
	controls.minDistance = 10;
	controls.maxDistance = 42;
	controls.maxPolarAngle = 1.5; // radians
	controls.update();
	controls.enablePan = false;
	controls.enableRotate = true;

	boatCreate();
	for (let y = 0; y < boardSizeY; y++) {
		for (let x = 0; x < boardSizeX; x++) {
		const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
		const material = new THREE.MeshBasicMaterial({ color: 0x6fc2fc });
		const cube = new THREE.Mesh(geometry, material);
		cube.position.set(x + boardOffsetX, 0, y + boardOffsetY);
		cube.type = "cube";
		scene.add(cube);
		const edges = new THREE.EdgesGeometry(geometry);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0x000000,
			linewidth: 2,
		});
		const lines = new THREE.LineSegments(edges, lineMaterial);
		lines.position.set(x + boardOffsetX, 0, y + boardOffsetY);
		boardGroup.add(lines);
		}
	}
	scene.add(boardGroup);

	validated = false
	canvas = document.getElementById("app")
	canvas.appendChild(renderer.domElement);
	canvas = document.getElementById("myCanvas")
	ctx = canvas.getContext("2d")
	canvas.addEventListener('click', FP_mouseClick)
	document.addEventListener('mousedown', FP_mouseDown)
	document.addEventListener('mousemove', FP_mouseMove)
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
	animate()
}

function FP_drawTitle()
{
	ctx.font = "40px Arial"
	ctx.textAlign = "center"
	ctx.fillStyle = "#0095DD"
	let placedBoat = 0
	BoatList.forEach(element => {
		if (element.ArrayY < 10)
			placedBoat++
	})
	if (validated == false)
		ctx.fillText(`Please, Place your navire (` + placedBoat + `/5)`, canvas.width / 2 , 65)
	else
		ctx.fillText(`Please, wait for your opponent`, canvas.width / 2 , 65)
}

function FP_mouseDown(e)
{
	if (e.which == 3) {
		rotateBoat();
	  }
	  if (e.which == 1 && INTERSECTED && INTERSECTED != CURRENT_SELECTION) {
		if (INTERSECTED.type == "cube" && boatToPlace != null) {
		  placeBoat(INTERSECTED.position.x, INTERSECTED.position.z);
		}
		if (INTERSECTED.type == "boat") {
		  boatToPlace = INTERSECTED;
		}
		INTERSECTED.scale.set(1, 1, 1);
		INTERSECTED.material.color.setHex(0xff0000);

		if (CURRENT_SELECTION != null) {
		  CURRENT_SELECTION.material.color.setHex(CURRENT_COLOR);
		}
		CURRENT_COLOR = INTERSECTED.currentHex;
		CURRENT_SELECTION = INTERSECTED;
		INTERSECTED = null;
	}
}

function FP_mouseMove(e) {
	const rect = renderer.domElement.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	mouse.x = (x / WIDTH) * 2 - 1;
	mouse.y = -(y / HEIGHT) * 2 + 1;
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


function FP_SendBoats()
{
	var count = 0
	BoatList.forEach(element => {
		if (element.ArrayY < 10)
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

function placeBoat(x, y) {
	let offset_center = (boatToPlace.width - 1) / 2;
	let offset_other = 0;
	let boat_x;
	let boat_y;
	if (boatToPlace.width % 2 == 1) {
	  offset_center = (boatToPlace.width - 1) / 2;
	}
	boat_x = x + offset_center;
	boat_y = y + offset_other;
	if (!boatToPlace.orientation) {
	  boat_y = y + offset_center;
	  boat_x = x + offset_other;
	}
	if (!boatToPlace.orientation && boatToPlace.width + y > 10) {
	  return;
	} else if (boatToPlace.orientation && boatToPlace.width + x > 10) {
	  return;
	}
	boatToPlace.pos = [x, y];
	// console.log(boatToPlace.pos);
	boatToPlace.position.x = boat_x;
	boatToPlace.position.z = boat_y;
	boatToPlace.self.ArrayX = boat_x;
	boatToPlace.self.ArrayY = boat_y;
  }

  function rotateBoat() {
	if (boatToPlace == null) {
	  return;
	}
	boatToPlace.orientation = !boatToPlace.orientation;
	if (!boatToPlace.orientation && boatToPlace.width + boatToPlace.pos[1] > 10) {
	  boatToPlace.orientation = !boatToPlace.orientation;
	  return;
	} else if (
	  boatToPlace.orientation &&
	  boatToPlace.width + boatToPlace.pos[0] > 10
	) {
	  boatToPlace.orientation = !boatToPlace.orientation;
	  return;
	}
	let offset_center = (boatToPlace.width - 1) / 2;
	if (!boatToPlace.orientation) {
	  boatToPlace.position.x -= offset_center;
	  boatToPlace.position.z += offset_center;
	  boatToPlace.self.ArrayX -= offset_center
	  boatToPlace.self.ArrayY = offset_center;
	} else {
	  boatToPlace.position.x += offset_center;
	  boatToPlace.position.z -= offset_center;
	  boatToPlace.self.ArrayX += offset_center
	  boatToPlace.self.ArrayY -= offset_center;
	}
	boatToPlace.rotation.y += 1.57;
  }

function FP_mouseClick(e)
{
	if (e.which == 3) {
		rotateBoat();
	  }
	  if (e.which == 1 && INTERSECTED && INTERSECTED != CURRENT_SELECTION) {
		if (INTERSECTED.type == "cube" && boatToPlace != null) {
		  placeBoat(INTERSECTED.position.x, INTERSECTED.position.z);
		}
		if (INTERSECTED.type == "boat") {
		  boatToPlace = INTERSECTED;
		}
		INTERSECTED.scale.set(1, 1, 1);
		INTERSECTED.material.color.setHex(0xff0000);

		if (CURRENT_SELECTION != null) {
		  CURRENT_SELECTION.material.color.setHex(CURRENT_COLOR);
		}
		CURRENT_COLOR = INTERSECTED.currentHex;
		CURRENT_SELECTION = INTERSECTED;
		INTERSECTED = null;
	  }
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
	drawTimer()
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
	const rect = renderer.domElement.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	mouse.x = (x / WIDTH) * 2 - 1;
	mouse.y = -(y / HEIGHT) * 2 + 1;
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
		{ name : 'PatrolBoat', x : 700, y : 500, size : 2, status : true},
		// { name : 'Destroyer', x : 700, y : 300, size : 3, status : true},
		// { name : 'Submarine', x : 700, y : 400, size : 3, status : true},
		// { name : 'BattleShip', x : 700, y : 200, size : 4, status : true},
		// { name : 'Carrier', x : 700, y : 100, size : 5, status : true},

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
	if(battleshipSocket.readyState != WebSocket.CLOSED)
		battleshipSocket.close()
	battleshipSocket = null
	if (curInterval != undefined)
		clearInterval(curInterval)
	curInterval = undefined
}

//#endregion

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	FP_drawTitle()
	intersect();
	FP_drawValidateButton()
	renderer.render(scene, camera);
}

  function intersect() {
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children, false);
	if (intersects.length > 0) {
	  if (INTERSECTED != intersects[0].object) {
		if (INTERSECTED) {
		  INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
		  INTERSECTED.scale.set(1, 1, 1);
		}
		INTERSECTED = intersects[0].object;
		INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
		INTERSECTED.currentScale = INTERSECTED.scale.x;
		INTERSECTED.material.color.setHex(0xff0000);
		INTERSECTED.scale.set(1.1, 1.1, 1.1);
	  }
	} else {
	  if (INTERSECTED) {
		INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
		INTERSECTED.scale.set(1, 1, 1);
	  }
	  INTERSECTED = null;
	}
  }
