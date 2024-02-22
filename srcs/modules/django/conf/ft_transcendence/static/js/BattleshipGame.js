import { navto } from "./index.js"
import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from "../threejs_addons/OrbitControls.js";
import { getProfilePicture, sleep } from "./chatApp/CA_General.js";

let WIDTH = document.body.clientWidth * 0.75;
let HEIGHT = WIDTH * (9. / 16.);

let canvas = null


const gridSizeX = 10
const gridSizeY = 10
const boxSize = 1;
const offsetX = 10
const offsetY = 100

// properly quit game



let mouse = new THREE.Vector2();


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
let LOOKINGATENNEMY = false;
let TURNPHASE = false;


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
  console.log(data)
	switch (data.function) {
		case 'initGame':
      getPlayersData(data.player_1, data.player_2)
			FP_Init()
			FP_drawTitle()
			TURNPHASE = false;
			break
		case 'StartGame':
			FP_UnLoad()
			TURNPHASE = true;
			document.addEventListener('keydown', SP_boardSwitch)
			if (CURRENT_SELECTION != null) {
				CURRENT_SELECTION.material.color.setHex(CURRENT_COLOR);
			  }
			SP_Load()
			break
		case 'StartTurn':
			SP_drawTitle("Your Turn")
			LOOKINGATENNEMY = true;
			document.addEventListener('mousemove', SP_mouseMove)
			document.addEventListener('mousedown', SP_mouseClick)
			break
		case 'StartEnemyTurn':
			SP_drawTitle(data.playerName + " Turn")
			document.removeEventListener('mousemove', SP_mouseMove)
			document.removeEventListener('mousedown', SP_mouseClick)
			break
		case 'GameStop':
			RP_GameStop(data.message, data.tournamentId)
			document.removeEventListener('keydown', SP_boardSwitch)
			break
		case 'RetrieveBoat':
			FP_SendBoats()
			break
		case 'RetrieveHit':
			SP_SendSelected()
			break
		case 'GotHit':
			hitMarker(data.case.ArrayPosX, data.case.ArrayPosY);
			break
		case 'HitResult':
			SP_HitCase(data.case, data.result, data.destroyedboat)
			break
		case 'Loose':
			RP_Loose(data.other, data.wAliveBoat)
			document.removeEventListener('keydown', SP_boardSwitch)
			break
		case 'Win':
			RP_Win(data.other, data.wAliveBoat, data.lAliveBoat)
			document.removeEventListener('keydown', SP_boardSwitch)
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

function GameEndMessage(message)
{
	counter.textContent = "";
	document.removeEventListener('mousemove', SP_mouseMove)
	window.onresize = (event) => {};
	cool_button.style.display = "none";
	title.textContent = "";
	endingText = document.createElement("div");
	renderer.domElement.style.filter = "blur(5px)"
	endingText.textContent = message;
	endingText.style.whiteSpace = "pre";
	endingText.style.textAlign = "center";
	endingText.style.fontSize = HEIGHT / 10 + "px";
	endingText.style.position = "absolute"; // Set position to absolute
	endingText.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	endingText.style.top = "50%"; // Center vertically
	endingText.style.left = "50%"; // Center horizontally
	endingText.style.transform = "translate(-50%, -50%)"; // Adjust position to center properly
	endingText.style.zIndex = "1"; // Ensure it's above other content
	endingText.style.padding = "10px"; // Example padding for better visualization
	three_box.appendChild(endingText)
	document.removeEventListener('keydown', SP_boardSwitch)


}

function RP_GameStop(message, id)
{
	document.removeEventListener('mousemove', FP_mouseMove)
	if (curInterval != undefined)
		clearInterval(curInterval)
	curInterval = undefined
	if (id == -1)
	{
		GameEndMessage(message)
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
	GameEndMessage("You loose! you destroyed only " + otherBoat + " " + other + " boats.")
	battleshipSocket = null
}

function RP_Win(other, userBoat, otherBoat)
{
	if (curInterval != undefined)
		clearInterval(curInterval)
	curInterval = undefined
	GameEndMessage("You win! you destroyed the " + otherBoat + " " + other + " boats when he detroyed only " + userBoat + " of yours")
	battleshipSocket = null
}

//#endregion

//#region FirstPart

function FP_UnLoad()
{
	document.removeEventListener('click', FP_mouseClick)
	document.removeEventListener('mousedown', FP_mouseDown)
	document.removeEventListener('mousemove', FP_mouseMove)
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
let title;
let counter;
let three_box;
let cool_button;
let endingText = null;

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
	  const material = new THREE.MeshLambertMaterial({ color: 0x550055 });
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
	  boat.castShadow = true;
	  boat.receiveShadow = true;
	  scene.add(boat);
	}
  }

function FP_Init()
{
	mouse = new THREE.Vector2();
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
	renderer.shadowMap.enabled = true
	controls = new OrbitControls(camera, renderer.domElement);


	controls.target.set(5, 0, 5);
	controls.minDistance = 10;
	controls.maxDistance = 42;
	controls.maxPolarAngle = 1.5; // radians
	controls.update();
	controls.enablePan = false;
	controls.enableRotate = true;
	window.onresize = function () {
		WIDTH = document.body.clientWidth * 0.75;
		HEIGHT = WIDTH * (9. / 16.);
		if (HEIGHT > document.body.clientHeight * 0.75)
		{
			HEIGHT = document.body.clientHeight * 0.75
			WIDTH = HEIGHT * (16. / 9.)
		}
		if (endingText)
			endingText.style.fontSize = HEIGHT / 10 + "px";
		three_box.style.width = WIDTH + 8 + "px";
		three_box.style.height = HEIGHT + 8 + "px";
		counter.style.fontSize = HEIGHT / 33 + "px";
		title.style.fontSize = HEIGHT / 20 + "px";
		cool_button.style.height = HEIGHT / 13 + "px";
		cool_button.style.fontSize = HEIGHT / 33 + "px";
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	
		renderer.setSize( WIDTH, HEIGHT );
	
	};
	boatCreate();
	for (let y = 0; y < boardSizeY; y++) {
		for (let x = 0; x < boardSizeX; x++) {
		const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
		const material = new THREE.MeshLambertMaterial({ color: 0xfcc26f });
		const cube = new THREE.Mesh(geometry, material);
		cube.position.set(x + boardOffsetX, 0, y + boardOffsetY + 20);
		cube.type = "ennemy_cube";
		cube.receiveShadow = true;
		cube.castShadow = true;
		scene.add(cube);
		const edges = new THREE.EdgesGeometry(geometry);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0x000000,
			linewidth: 2,
		});
		const lines = new THREE.LineSegments(edges, lineMaterial);
		lines.position.set(x + boardOffsetX, 0, y + boardOffsetY + 20);
		cube.line = lines
		boardGroup.add(lines);
		BoardCases.push(CreateABox(x, y, cube))
		}
	}
	for (let y = 0; y < boardSizeY; y++) {
		for (let x = 0; x < boardSizeX; x++) {
		const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
		const material = new THREE.MeshLambertMaterial({ color: 0x6fc2fc });
		const cube = new THREE.Mesh(geometry, material);
		cube.position.set(x + boardOffsetX, 0, y + boardOffsetY);
		cube.type = "cube";
		cube.receiveShadow = true;
		cube.castShadow = true;
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
	const dlight = new THREE.DirectionalLight(0xffffff, 5);
	dlight.position.set(20, 20, 20);
	dlight.castShadow = true;
	dlight.shadow.mapSize.width = 1024; // Shadow map width\
	const d = 30;
	const lightTarget = new THREE.Object3D(); 
	scene.add(lightTarget);
	dlight.shadow.camera.left = - d;
	dlight.shadow.camera.right = d;
	dlight.shadow.camera.top = d;
	dlight.shadow.camera.bottom = - d;
	dlight.target = lightTarget
	dlight.shadow.mapSize.height = 2048; // Shadow map height
	dlight.shadow.camera.near = 0.5; // Near shadow camera distance
	dlight.shadow.camera.far = 50; // Far shadow camera distance
	scene.add(dlight);
	const alight = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( alight );
	validated = false
	canvas = document.querySelector(".canvas_wrapper")
	initText()
	canvas.appendChild(three_box);
	three_box.appendChild(renderer.domElement);
	three_box.appendChild(counter);
	three_box.appendChild(title);
	three_box.appendChild(cool_button);
	document.addEventListener('click', FP_mouseClick)
	document.addEventListener('mousedown', FP_mouseDown)
	document.addEventListener('mousemove', FP_mouseMove)
	for ( let x = 0; x < gridSizeY; x++)
	{
		BoardArray[x]= []
		for ( let y = 0; y < gridSizeX; y++)
			BoardArray[x][y] = 0
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
	if (!title)
		return
	let placedBoat = 0
	BoatList.forEach(element => {
		if (element.ArrayY < 10)
			placedBoat++
	})
	if (validated == false)
		title.textContent = `Please, Place your navire (` + placedBoat + `/5)`
	else
		title.textContent = `Please, wait for your opponent` 
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
	FP_drawTitle()
}

function FP_mouseMove(e) {
	if (!renderer)
		return;
	const rect = renderer.domElement.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	mouse.x = (x / WIDTH) * 2 - 1;
	mouse.y = -(y / HEIGHT) * 2 + 1;
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
	BoatList.forEach(element => {
			element.ArrayX = Math.floor(element.ArrayX)
			element.ArrayY = Math.floor(element.ArrayY)
			element.x = Math.floor(element.x)
			element.y = Math.floor(element.y)
		})
	
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
	if (!boatToPlace.orientation && boatToPlace.pos[0] != -1)
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			BoardArray[boatToPlace.pos[0]][boatToPlace.pos[1] + i] = 0
		}
	}
	else if (boatToPlace.pos[0] != -1)
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			BoardArray[boatToPlace.pos[0] + i][boatToPlace.pos[1]] = 0
		}
	}
	if (!boatToPlace.orientation)
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			if (BoardArray[x][y + i] == 1)
			{
				if (boatToPlace.pos[0] == -1)
					return
				for (let i = 0; i < boatToPlace.width; i++)
				{
					BoardArray[boatToPlace.pos[0]][boatToPlace.pos[1] + i] = 1
				}
				return ;
			}
		}
	}
	else
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			if (BoardArray[x + i][y] == 1)
			{
				if (boatToPlace.pos[0] == -1)
					return
				for (let j = 0; j < boatToPlace.width; j++)
				{
					BoardArray[boatToPlace.pos[0] + j][boatToPlace.pos[1]] = 1
				}
				return ;
			}
		}
	}
	boatToPlace.pos = [x, y];
	boatToPlace.position.x = boat_x;
	boatToPlace.position.z = boat_y;
	boatToPlace.self.ArrayX = x;
	boatToPlace.self.ArrayY = y;
	boatToPlace.self.x = x;
	boatToPlace.self.y = y;
	if (!boatToPlace.orientation)
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			BoardArray[x][y + i] = 1
		}
	}
	else
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			BoardArray[x + i][y] = 1
		}
	}
  }

  function rotateBoat() {
	if (boatToPlace == null) {
	  return;
	}
	if (boatToPlace.pos[0] == -1)
	{
		return ;
	}
	if (boatToPlace.orientation && boatToPlace.width + boatToPlace.pos[1] > 10) {
		return;
	  } else if (
		!boatToPlace.orientation &&
		boatToPlace.width + boatToPlace.pos[0] > 10
	  ) {
		return;
	  }
	if (!boatToPlace.orientation && boatToPlace.pos[0] != -1)
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			BoardArray[boatToPlace.pos[0]][boatToPlace.pos[1] + i] = 0
		}
	}
	else if (boatToPlace.pos[0] != -1)
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			BoardArray[boatToPlace.pos[0] + i][boatToPlace.pos[1]] = 0
		}
	}
	if (!boatToPlace.orientation)
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			if (BoardArray[boatToPlace.pos[0] + i][boatToPlace.pos[1]] == 1)
			{
				if (boatToPlace.pos[0] != -1)
				{
					return
				}
				for (let j = 0; j < boatToPlace.width; j++)
				{
					BoardArray[boatToPlace.pos[0]][boatToPlace.pos[1] + j] = 1
				}
				return ;
			}
		}
	}
	else
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			if (BoardArray[boatToPlace.pos[0]][boatToPlace.pos[1] + i] == 1)
			{
				if (boatToPlace.pos[0] != -1)
				{
					return
				}
				for (let j = 0; j < boatToPlace.width; j++)
				{
					BoardArray[boatToPlace.pos[0] + j][boatToPlace.pos[1]] = 1
				}
				return ;
			}
		}
	}
	boatToPlace.orientation = !boatToPlace.orientation;
	boatToPlace.self.horizontal = !boatToPlace.self.horizontal;
	let offset_center = (boatToPlace.width - 1) / 2;
	if (!boatToPlace.orientation) {
	  boatToPlace.position.x -= offset_center;
	  boatToPlace.position.z += offset_center;

	} else {
	  boatToPlace.position.x += offset_center;
	  boatToPlace.position.z -= offset_center;
	}
	boatToPlace.rotation.y += 1.57;
	if (!boatToPlace.orientation)
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			BoardArray[boatToPlace.pos[0]][boatToPlace.pos[1] + i] = 1
		}
	}
	else
	{
		for (let i = 0; i < boatToPlace.width; i++)
		{
			BoardArray[boatToPlace.pos[0] + i][boatToPlace.pos[1]] = 1
		}
	}
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
	if (buttonState)
	{
		if (FP_SendBoats() == false)
		{
			buttonState = !buttonState
			return
		}
		validated = !validated
		buttonState = !buttonState
		FP_draw()
	}
}

function FP_draw()
{
	drawTimer()
}

//#endregion

//#region SecondPart

var SP_selected = undefined

function SP_HitCase(Tcase, result, boat)
{

	BoardCases.forEach(element => {
		if (element.ArrayPosX == Tcase.ArrayPosX && element.ArrayPosY == Tcase.ArrayPosY)
		{
			element.status = result == false ? -1 : 1
			if (element.status == -1)
			{
				element.object.material.color.setHex(0xffffff)
				element.object.scale.set(1, 0.8, 1);
				element.object.position.y -= 0.1

				boardGroup.remove(element.object.line)

				const tedges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.,0.8,1.));
				const tlineMaterial = new THREE.LineBasicMaterial({
					color: 0x000000,
					linewidth: 2,
				});
				const alines = new THREE.LineSegments(tedges, tlineMaterial);
				alines.position.set(element.object.position.x, element.object.position.y, element.object.position.z );
				element.object.line = alines
				boardGroup.add(alines)

				element.object.type = "miss_cube"
				CURRENT_COLOR = 0xffffff;
			}
			else if (element.status == 1)
			{
				element.object.material.color.setHex(0xffaaaa)
				element.object.scale.set(1, 2., 1);
				element.object.position.y += 0.5
				element.object.type = "hit_cube"
				boardGroup.remove(element.object.line)

				const tedges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.,2.,1.));
				const tlineMaterial = new THREE.LineBasicMaterial({
					color: 0x000000,
					linewidth: 2,
				});
				const alines = new THREE.LineSegments(tedges, tlineMaterial);
				alines.position.set(element.object.position.x, element.object.position.y, element.object.position.z );
				element.object.line = alines
				boardGroup.add(alines)
				
				CURRENT_COLOR = 0xffaaaa;
			}
		}
	})
	CURRENT_SELECTION = null;
	if (boat != "None")
	{
		BoatList.forEach(element => {
			if (element.name == boat)
				element.status = false
		})
	}
	SP_selected = undefined;
}


function SP_boardSwitch(event)
{
	if (event.key == " ")
	{
		if (LOOKINGATENNEMY == true)
		{
			LOOKINGATENNEMY = !LOOKINGATENNEMY;
			controls.target.set( 5, 0, 5 );
			camera.position.z = 17;
			camera.position.x = 8;
			camera.position.y = 12;
		}
		else
		{
			LOOKINGATENNEMY = !LOOKINGATENNEMY;
			controls.target.set( 5, 0 , 5 + 20 );
			camera.position.z = 37;
			camera.position.x = 8;
			camera.position.y = 12;
		}
	}
}

function SP_mouseMove(event)
{
	if (!renderer)
		return
	const rect = renderer.domElement.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	mouse.x = (x / WIDTH) * 2 - 1;
	mouse.y = -(y / HEIGHT) * 2 + 1;
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
	if (event.which == 3) {
		rotateBoat();
	  }
	  if (event.which == 1 && INTERSECTED && INTERSECTED != CURRENT_SELECTION) {
		if (INTERSECTED.type == "ennemy_cube") {
			INTERSECTED.scale.set(1, 1, 1);
			INTERSECTED.material.color.setHex(0xff0000);
		}
		if (CURRENT_SELECTION != null && CURRENT_SELECTION.type == "ennemy_cube") {
			CURRENT_SELECTION.material.color.setHex(CURRENT_COLOR);
		}
		if (INTERSECTED.type == "ennemy_cube") {
			CURRENT_COLOR = INTERSECTED.currentHex;
			CURRENT_SELECTION = INTERSECTED;
		}
		INTERSECTED = null;
	}

	const ArrayPos = getPos()



	if (buttonState == true)
	{
		buttonState = false;
		if (SP_selected == undefined)
			return 
		SP_SendSelected()

	}
	if (ArrayPos.x == -1)
		return;
	BoardCases.forEach( element => {
		if (element.ArrayPosX == ArrayPos.x && element.ArrayPosY == ArrayPos.y)
		{
			if (SP_selected != element)
			{
				if (element.status == 0)
				{
					SP_selected = element
				}
			}
		}
		return
	})
}

function getPos()
{
	if (!CURRENT_SELECTION)
	{
		return {x: -1, y: -1}
	}
	return{x : CURRENT_SELECTION.position.x, y : CURRENT_SELECTION.position.z - 20}
}

function SP_Load()
{
	curInterval = setInterval(SP_Timer, 1000)
	controls.target.set( 5, 0 , 5 + 20);
	camera.position.z = 37;
	camera.position.x = 8;
	camera.position.y = 12;
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
}

function SP_Timer()
{
	if (currentTimer != -1 )
		currentTimer -= 1
	drawTimer()
}

function SP_drawTitle(message)
{
	title.textContent = message
}


//#endregion

//#region CommonPart


var currentTimer = -1

function drawTimer()
{
	if (currentTimer == -1)
		return

	counter.textContent = currentTimer.toString()

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
		mouse = undefined;
		BoardCases = []
		BoatList = []
		Boatm = []
		BoardArray = []
		validated = false
		battleshipSocket = null
		gameId = null
		curInterval = undefined
		CURRENT_SELECTION = null;
		CURRENT_COLOR = null;
		LOOKINGATENNEMY = false;
		TURNPHASE = false;
		boatToPlace = null;
		scene = undefined;
		camera = undefined;
		renderer = undefined;
		controls = undefined;
		raycaster = undefined
		INTERSECTED = null;
		title = null
		counter = null
		cool_button = null;
		endingText = null
		SP_selected = undefined
	}
}

//#endregion
let animationid = undefined

function animate() {
	animationid = requestAnimationFrame(animate);
	controls.update();
	intersect();
	renderer.render(scene, camera);
}

function intersect() {
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children, false);
	if (TURNPHASE == true)
	{
		if (intersects.length > 0) {
			if (INTERSECTED != intersects[0].object) {
			  if (INTERSECTED) {
				INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
				INTERSECTED.scale.set(1, 1, 1);
			  }
			  if (intersects[0].object.type != "ennemy_cube")
			  	return ;
			  INTERSECTED = intersects[0].object;
			  INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
			  INTERSECTED.currentScale = INTERSECTED.scale.x;
			  if (INTERSECTED.type == "ennemy_cube")
			  {
			  	INTERSECTED.material.color.setHex(0xff0000);
			  	INTERSECTED.scale.set(1.1, 1.1, 1.1);
			  }
			}
		  } else {
			if (INTERSECTED) {
			  INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
			  INTERSECTED.scale.set(1, 1, 1);
			}
			INTERSECTED = null;
		  }
	}
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


function CreateABox(x, y, hello)
{
	let Box = {
		ArrayPosX : x,
		ArrayPosY : y,
		status: 0,
		object: hello
	}
	return Box
}

function hitMarker(x, y)
{
	const geometry = new THREE.BoxGeometry( 0.1, 2, 0.1 );
	const material = new THREE.MeshBasicMaterial( {color: 0xff0000} ); 
	const cube = new THREE.Mesh( geometry, material ); 
	cube.position.y++;
	cube.position.x = x
	cube.position.z = y
	scene.add( cube );	
		
}

let buttonState = false;

function initText()
{
	three_box = document.createElement("div");
  three_box.setAttribute('id', 'battleshipGame')
	three_box.style.width = WIDTH + 8 + "px";
	three_box.style.height = HEIGHT + 8 + "px";
	three_box.style.border = '4px solid #ccc';
	three_box.style.position = "relative";


	counter = document.createElement("div");
	counter.textContent = "";
	counter.style.whiteSpace = "pre";
	counter.style.textAlign = "center";
	counter.style.fontSize = HEIGHT / 28 + "px";
	counter.style.position = "absolute"; // Set position to absolute
	counter.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	counter.style.top = "10%"; // Center vertically
	counter.style.left = "50%"; // Center horizontally
	counter.style.transform = "translate(-50%, -50%)"; // Adjust position to center properly
	counter.style.zIndex = "1"; // Ensure it's above other content
	counter.style.padding = "10px"; // Example padding for better visualization

	title = document.createElement("div");
	title.textContent = "";
	title.style.whiteSpace = "pre";
	title.style.textAlign = "center";
	title.style.fontSize = HEIGHT / 20 + "px";
	title.style.position = "absolute"; // Set position to absolute
	title.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	title.style.top = "90%"; // Center vertically
	title.style.left = "50%"; // Center horizontally
	title.style.transform = "translate(-50%, -50%)"; // Adjust position to center properly
	title.style.zIndex = "1"; // Ensure it's above other content
	title.style.padding = "10px"; // Example padding for better visualization


	cool_button = document.createElement("button");
	const button_css = "outline: none;cursor: pointer;line-height: 1;border-radius: 500px;transition-property: background-color,border-color,color,box-shadow,filter;transition-duration: .3s;border: 1px solid transparent;letter-spacing: 2px;min-width: 80px;text-transform: uppercase;white-space: normal;font-weight: 700;text-align: center;padding: 17px 48px 17px 48px;color: #fff;background-color: #1EC760;"
	cool_button.setAttribute("style", button_css);
	cool_button.textContent = "Confirm";
	cool_button.style.height = HEIGHT / 13 + "px";
	cool_button.style.fontSize = HEIGHT / 33 + "px";
	cool_button.style.position = "absolute"; // Set position to absolute
	cool_button.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	cool_button.style.top = "90%"; // Center vertically
	cool_button.style.left = "80%"; // Center horizontally
	cool_button.style.transform = "translate(-50%, -50%)"; // Adjust position to center properly
	cool_button.style.zIndex = "1"; // Ensure it's above other content
	cool_button.style.padding = "10px"; // Example padding for better visualization
	cool_button.addEventListener('mouseover', () => {
		// Change the button's background color
		cool_button.style.transform = "translate(-50%, -50%) scale(1.04)"
		cool_button.style.backgroundColor = "#21F055";
	  });
	cool_button.addEventListener('mouseout', () => {
		cool_button.style.transform = "translate(-50%, -50%) scale(1.0)"
		cool_button.style.backgroundColor = "#1EC760"
	  });
	  
	cool_button.addEventListener('click', e => {
		cool_button.style.transform = "translate(-50%, -50%) scale(0.9)"
		cool_button.style.backgroundColor = "#1EA760"
		setTimeout(() => {
			cool_button.style.backgroundColor = "#1EC760";
			cool_button.style.transform = "translate(-50%, -50%) scale(1.0)";
		}, 100);
		buttonState = true;
		if (TURNPHASE == false)
		{
			FP_mouseClick(e)
			FP_drawTitle()
		}
		else
			SP_mouseClick(e)
	}) 
}

async function getPlayersData(player1, player2) {
  console.log(battleshipSocket)
  console.log(battleshipSocket.readyState)
  console.log(player1)
  console.log(player2)
  if (battleshipSocket == undefined || battleshipSocket.readyState !== WebSocket.OPEN || player1 == undefined || player2 == undefined)
  {
    console.log('pardon!!!!')
    return
  }

  let profilePicture = await getProfilePicture({ 'type': 'user', 'id': player1.id })
  let ppUrl
  if (profilePicture.type == 'image/null')
    ppUrl = "../static/assets/logo/user.png"
  else
    ppUrl = URL.createObjectURL(profilePicture)
  if (document.getElementById('ppPlayer1') == undefined)
    return
  document.getElementById('ppPlayer1').src = ppUrl;

  profilePicture = await getProfilePicture({ 'type': 'user', 'id': player2.id })
  if (profilePicture.type == 'image/null')
    ppUrl = "../static/assets/logo/user.png"
  else
    ppUrl = URL.createObjectURL(profilePicture)
  if (document.getElementById('ppPlayer2') == undefined)
    return
  document.getElementById('ppPlayer2').src = ppUrl;

  document.getElementById('gamePlayer1').textContent = player1.name;
  document.getElementById('gamePlayer2').textContent = player2.name;
}
