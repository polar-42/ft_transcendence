import { navto } from "./index.js";
import { Reflector } from "../threejs_addons/Reflector.js";
import { TrailRenderer } from "../threejs_addons/TrailRenderer.js";
import { CSS2DRenderer, CSS2DObject } from "../threejs_addons/CSS2DRenderer.js";
import * as THREE from 'https://threejs.org/build/three.module.js';

//let WIDTH = document.body.clientWidth * 0.75;
let WIDTH = document.body.clientWidth * 0.62;
let HEIGHT = WIDTH * (9. / 16.);
var three_box = null;
var isRendering = false;

var frames_to_shake = 0;
var BcameraShake = false;
let canvas = null;
var scene;
var camera;
var renderer;
var paddle1;
var paddle2;
var ball;
var trail;
var textElement;
var scoreDisplay;
var isCountingDown = false;
let scoreOne;
let scoreTwo;
let isGameRunning;
let isGamePause;
let bSpeed;
let bGravity;
let bPlayerOne;
let bPlayerTwo;
let gameStarted = false;
var isCountingDown = false;

class Element {
	constructor(options) {
		this.x = options.x;
		this.y = options.y;
		this.width = options.width;
		this.height = options.height;
		this.dx = options.dx;
		this.dy = options.dy;
		this.speed = options.speed;
	}
}

const playerOne = new Element({
	x: -5.,
	y: 0,
	width: 0.2,
	height: 2.,
	gravity: 0.1,
});

/*Player two paddle*/
const playerTwo = new Element({
	x: 5.,
	y: 0,
	width: 0.2,
	height: 2.,
	gravity: 0.1,
});

/*Ball*/
const Dball = new Element({
	x: 0,
	y: 0,
	width: 0.15,
	height: 0.15,
	dx: 0,
	dy: 0,
	speed: 0.1,
});

export function countdown()
{
	isCountingDown = true;
	if (isCountingDown == true)
		textElement.textContent = "3";
	setTimeout(function(){
		if (isCountingDown == true)
			textElement.textContent = "2";
	}, 1000);
	setTimeout(function(){
		if (isCountingDown == true)
			textElement.textContent = "1";
	}, 2000);
	setTimeout(function(){
		if (isCountingDown == true)
			textElement.textContent = "GO!";
	}, 3000);
	setTimeout(function(){
		if (isCountingDown == true)
			textElement.textContent = "";
	}, 4000);
	setTimeout(function(){
		Dball.dx = bSpeed;
		Dball.dy = bGravity;
		isCountingDown = false;
	}, 4000);
}

export function exitPongLocal()
{
	gameStarted = false
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
		isRendering = false;
		frames_to_shake = 0;
		BcameraShake = false;
		canvas = null;
		scene = undefined;
		camera = undefined;
		renderer = undefined;
		paddle1 = undefined;
		paddle2 = undefined;
		ball = undefined;
		trail = undefined;
		textElement = undefined;
		scoreDisplay = undefined;
		isCountingDown = false;
		scoreOne = undefined;
		scoreTwo = undefined;
		isGameRunning = undefined;
		isGamePause = undefined;
		bSpeed = undefined;
		bGravity = undefined;
		bPlayerOne = undefined;
		bPlayerTwo = undefined;
		Dball.x = 0
		Dball.y = 0
		Dball.dx = 0
		Dball.dy = 0
		Dball.speed = 0.1
	}
}

export function init_objects()
{
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
	camera.position.z = 6;

	renderer = new THREE.WebGLRenderer( { antialias : false } );
	renderer.setSize(WIDTH, HEIGHT);
	var originalWarning = console.warn; // back up the original method
	console.warn = function(){};
	var loader = new THREE.TextureLoader();
	var texture = loader.load("../../static/js/sounds/corona_bk.png");
	texture.minFilter = THREE.LinearMipmapLinearFilter;
	texture.generateMipmaps = true;
	scene.background = texture;
	console.warn = originalWarning;

	var wallGeometry = new THREE.PlaneGeometry(22, 3);

	var wallUp = new Reflector( wallGeometry, {
		textureWidth: 250 ,
		textureHeight: 50 ,
		color: new THREE.Color(0x7f7f7f)
	} );

	// var wall_m = new THREE.MeshPhysicalMaterial({
	// 	reflectivity : 0.3,
	// 	transmission : 1.0,
	// 	roughness : 0.8,
	// 	clearcoat : 0.3,
	// 	clearcoatRoughness : 0.25,
	// 	ior : 1.2,
	// 	thickness : 10.0,
	// 	side : THREE.BackSide,
	// 	color : new THREE.Color(0x1000000),
	// });

	// var wallUp = new THREE.Mesh(wallGeometry, wall_m)
	wallUp.position.y = 3.8;
	wallUp.rotation.x = Math.PI / 180 * 90 ;
	wallUp.renderOrder = 1
	var wallDown = new Reflector( wallGeometry, {
		textureWidth: 250 ,
		textureHeight: 50 ,
		color: new THREE.Color(0x7f7f7f)
	} );
	// var wallDown = new THREE.Mesh(wallGeometry, wall_m)
	wallDown.renderOrder = 1
	wallDown.position.y = -3.8;
	wallDown.rotation.x = Math.PI / 180 * -90 ;

	scene.add(wallUp);
	scene.add(wallDown);



	var g_paddle1 = new THREE.BoxGeometry(0.2, 2., 2.);
	var g_paddle2 = new THREE.BoxGeometry(0.2, 2., 2.);
	var m_paddle1 = new THREE.MeshPhysicalMaterial({
		reflectivity : 0.3,
		transmission : 1.0,
		roughness : 0.8,
		clearcoat : 0.3,
		clearcoatRoughness : 0.25,
		ior : 1.2,
		thickness : 10.0,
		side : THREE.BackSide,
		color : new THREE.Color(0xff0000),
	});
	paddle1 = new THREE.Mesh(g_paddle1, m_paddle1);
	paddle1.position.x -= 5;
	paddle1.rotation.x = Math.PI / 180 * 90;
	paddle1.renderOrder = 2;
	scene.add(paddle1);

	var m_paddle2 = 	new THREE.MeshPhysicalMaterial({
		reflectivity : 0.3,
		side : THREE.BackSide,
		transmission : 1.0,
		roughness : 0.8,
		clearcoat : 0.3,
		clearcoatRoughness : 0.25,
		color : new THREE.Color(0x0000ff),
		ior : 1.2,
		thickness : 10.0,
	  });
	paddle2 = new THREE.Mesh(g_paddle2, m_paddle2);
	paddle2.position.x += 5;
	paddle2.renderOrder = 2;

	paddle2.rotation.x = Math.PI / 180 * 90;
	scene.add(paddle2);



	var g_ball = new THREE.SphereGeometry(0.15, 32, 16)
	var m_ball = new THREE.MeshPhysicalMaterial({
		// reflectivity : 0.1,
		transmission : 0.5,
		roughness : 0.8,
		clearcoat : 0.5,
		clearcoatRoughness : 0.35,
		ior : 1.2,
		thickness : 10.0,
		side : THREE.BackSide,
		color : new THREE.Color(0xffaaff),
	});
	ball = new THREE.Mesh(g_ball, m_ball);
	ball.layers.enableAll();
	scene.add(ball);



	const light = new THREE.PointLight(0xffffff, 1000)
	light.position.set(10, 10, 10)
	scene.add(light)
	const alight = new THREE.AmbientLight( 0xF0F0F0 ); // soft white light
	scene.add( alight );



	const trailHeadGeometry = [];
	trailHeadGeometry.push(
	new THREE.Vector3( -0.1, -0.1, -0.1 ),
	new THREE.Vector3( 0.0, 0.0, 0.0 ),
	new THREE.Vector3( 0.1, 0.1, 0.1 )
	);
	trail = new TrailRenderer( scene, false );
	trail.setAdvanceFrequency(30);
	const trailMaterial = TrailRenderer.createBaseMaterial();
	const trailLength = 10;
	trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, ball );
	trail.activate();
	// countdown();
}

export function normalize(dx, dy) {
    var length = Math.sqrt(dx ** 2 + dy ** 2);
    return [dx / length, dy / length];
}

export function randomDir() {
    var dx = Math.random() - 0.5;
    var dy = dx * (Math.random() - 0.5);
    return [dx, dy];
}

var animationid = undefined

export function animate() {
	if (isRendering == false)
		return ;
	animationid = requestAnimationFrame(animate);
	if (scoreOne >= 3 || scoreTwo >= 3)
	{
		scoreDisplay.textContent = "";
		if (scoreOne == 3) {
			textElement.textContent = "Blue wins\r\n";
			textElement.textContent += scoreTwo + " - " + scoreOne;
			three_box.style.border = '4px solid #0000ff';
		} else {
			textElement.textContent = "Red wins\r\n";
			textElement.textContent += scoreTwo + " - " + scoreOne;
			three_box.style.border = '4px solid #ff0000';
		}
		finishGame(canvas);
	}
	if (BcameraShake == true)
	{
		frames_to_shake = 5;
		BcameraShake = false;
	}
	if (frames_to_shake > 0)
	{
		if (frames_to_shake % 2 == 0)
			cameraShake();
		else
		{
			camera.position.x = 0;
			camera.position.y = 0;
			camera.position.z = 6;
		}
		frames_to_shake -= 1;
	}
	if (paddle1.position.y + playerOne.gravity > -2.8 && paddle1.position.y + playerOne.gravity < 2.8)
	{
		paddle1.position.y += playerOne.gravity;
	}
	if (paddle2.position.y + playerTwo.gravity > -2.8 && paddle2.position.y + playerTwo.gravity < 2.8)
	{
		paddle2.position.y += playerTwo.gravity;
	}
	if (!(Dball.dx == undefined || Dball.dy == undefined))
	{
		if (( 3.8 - 0.15 < ball.position.y + Dball.dy * Dball.speed || ball.position.y + Dball.dy * Dball.speed <= -3.8 + 0.15))
            Dball.dy *= -1;
		else if (paddle2.position.y + 1.07 >= ball.position.y && ball.position.y >= paddle2.position.y - 1.07 && ball.position.x >= paddle2.position.x - 0.25)
		{
			Dball.dx *= -1;
			Dball.dy = ball.position.y - paddle2.position.y;
			ball.position.x = paddle2.position.x - 0.17;
			Dball.speed *= 1.08;
			BcameraShake = true;
		}
		else if (paddle1.position.y + 1.07 >= ball.position.y && ball.position.y >= paddle1.position.y - 1.07 && ball.position.x <= paddle1.position.x + 0.25)
		{
			Dball.dx *= -1;
			Dball.dy = ball.position.y - paddle1.position.y;
			ball.position.x = paddle1.position.x + 0.17;
			Dball.speed *= 1.08;
			BcameraShake = true;
		}
		else if(ball.position.x >= paddle2.position.x)
		{
			scoreTwo += 1;
			ball.position.x = 0;
			ball.position.y = 0;
			paddle1.position.y = 0;
			paddle2.position.y = 0;
			Dball.speed = 0.1;
			Dball.dx = 0;
			Dball.dy = 0;
			isGameRunning = false;
			textElement.textContent = "Press 'ENTER'";
			scoreDisplay.textContent = scoreTwo + " - " + scoreOne;
		}
		else if(ball.position.x <= paddle1.position.x)
		{
			scoreOne += 1;
			ball.position.x = 0;
			paddle1.position.y = 0;
			paddle2.position.y = 0;
			ball.position.y = 0;
			Dball.speed = 0.1;
			Dball.dx = 0;
			Dball.dy = 0;
			isGameRunning = false;
			textElement.textContent = "Press 'ENTER'";
			scoreDisplay.textContent = scoreTwo + " - " + scoreOne;
		}
		if(Dball.dx != 0 && Dball.dy != 0)
		{
			let normalised_dir = normalize(Dball.dx, Dball.dy);
			ball.position.x += normalised_dir[0] * Dball.speed;
			ball.position.y += normalised_dir[1] * Dball.speed;
		}
	}
	trail.update()
    renderer.render(scene, camera);
}

export function cameraShake() {
	const intensity = 0.3; // Adjust the intensity of the shake

	const originalPosition = camera.position.clone();
	camera.position.x = originalPosition.x + Math.random() * intensity - intensity / 2;
	camera.position.y = originalPosition.y + Math.random() * intensity - intensity / 2;
	camera.position.z = originalPosition.z + Math.random() * intensity - intensity / 2;
}

export function initLocalGamePong()
{
	if (gameStarted == true)
	{
		gameStarted = false
		navto('/games');
		return;
	}
	gameStarted = true
	document.addEventListener('keydown', doKeyDown);
	document.addEventListener('keyup', doKeyUp);
	scoreOne = 0;
	scoreTwo = 0;
	isGameRunning = false;
	isGamePause = false;
	bSpeed = 0;
	bGravity = 0;
	Dball.x = 0;
	Dball.y = 0;
	playerOne.y = 0;
	playerOne.gravity = 0.;
	playerTwo.gravity = 0.;
	playerTwo.y = 0;
	init_objects();
	canvas = document.querySelector(".pongWindow");
	three_box = document.createElement("div");
	three_box.setAttribute("id", 'pongGame')
	three_box.style.width = WIDTH + 8 + "px";
	three_box.style.height = HEIGHT + 8 + "px";
	//three_box.style.border = '4px solid #ccc';
	three_box.style.position = "relative";
	three_box.appendChild(renderer.domElement);
	canvas.appendChild(three_box);
	textElement = document.createElement("div");
	scoreDisplay = document.createElement("div");
	scoreDisplay.textContent = "0 - 0";
	scoreDisplay.style.whiteSpace = "pre";
	scoreDisplay.style.textAlign = "center";
	scoreDisplay.style.fontSize = HEIGHT / 33 + "px";
	scoreDisplay.style.position = "absolute"; // Set position to absolute
	scoreDisplay.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	scoreDisplay.style.top = "10%"; // Center vertically
	scoreDisplay.style.left = "50%"; // Center horizontally
	scoreDisplay.style.transform = "translate(-50%, -50%)"; // Adjust position to center properly
	scoreDisplay.style.zIndex = "1"; // Ensure it's above other content
	scoreDisplay.style.padding = "10px"; // Example padding for better visualization
	three_box.appendChild(scoreDisplay);
	textElement.textContent = "Press 'ENTER'";
	textElement.style.whiteSpace = "pre";
	textElement.style.textAlign = "center";
	textElement.style.fontSize = HEIGHT / 10 + "px";
	textElement.style.position = "absolute"; // Set position to absolute
	textElement.style.textShadow = "1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191, 1px 4px 1px #919191, 1px 3px 1px #919191";
	textElement.style.top = "50%"; // Center vertically
	textElement.style.left = "50%"; // Center horizontally
	textElement.style.transform = "translate(-50%, -50%)"; // Adjust position to center properly
	textElement.style.zIndex = "1"; // Ensure it's above other content
	textElement.style.padding = "10px"; // Example padding for better visualization

	three_box.appendChild(textElement);

	window.onresize = function () {
		//WIDTH = document.body.clientWidth * 0.75;	
		WIDTH = document.body.clientWidth * 0.62;
		HEIGHT = WIDTH * (9. / 16.);
		three_box.style.width = WIDTH + 8 + "px";
		three_box.style.height = HEIGHT + 8 + "px";
		scoreDisplay.style.fontSize = HEIGHT / 33 + "px";
		textElement.style.fontSize = HEIGHT / 10 + "px";
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();

		renderer.setSize( WIDTH, HEIGHT );

	};

	isRendering = true;
	animate();
}


function doKeyUp(e) {
	const key = e.key;
	if (key == "w" || key == "s")
	{
		playerOne.gravity = 0;
	}
	if (key == "ArrowUp" || key == "ArrowDown")
	{
		playerTwo.gravity = 0;
	}
}

function doKeyDown(e) {
	const key = e.key;
	if (key == "Escape" && isGamePause == false && isCountingDown == false) {
		e.preventDefault();
		if (Dball.dx != 0){
			bSpeed = Dball.dx;
		}
		if (Dball.dy != 0){
			bGravity = Dball.dy;
		}
		bPlayerOne = playerOne.gravity;
		bPlayerTwo = playerTwo.gravity;
		Dball.dx = 0;
		Dball.dy = 0;
		Dball.speed = 0.1;
		playerOne.gravity = 0;
		playerTwo.gravity = 0;
		isGamePause = true;
		renderer.domElement.style.filter = "blur(5px)"
		textElement.textContent = "Press 'ENTER'";
	}

	if (key == "Enter" && isGameRunning == false) {
		e.preventDefault();
		var randvec = randomDir();
		var vector_start = normalize(randvec[0], randvec[1]);
		bSpeed = vector_start[0];
		bGravity = vector_start[1];
		countdown();
		isGameRunning = true;
		isGamePause = false;
		renderer.domElement.style.filter = ""

	} else if (key == "Enter" && isGamePause == true) {
		e.preventDefault();
		countdown();
		playerOne.gravity = bPlayerOne;
		playerTwo.gravity = bPlayerTwo;
		renderer.domElement.style.filter = ""
		isGamePause = false;
	}
	if (isCountingDown == true || isGamePause == true || isGameRunning == false)
		return;
	if (key == "w") {
		e.preventDefault();
		playerOne.gravity = 0.1;
	} else if (key == "s") {
		e.preventDefault();
		playerOne.gravity = -0.1;
	}
	if (key == "ArrowUp") {
		e.preventDefault();
		playerTwo.gravity = 0.1;
	} else if (key == "ArrowDown") {
		e.preventDefault();
		playerTwo.gravity = -0.1;
	}
}

function finishGame(c) {
	isRendering = false;
	renderer.domElement.style.filter = "blur(5px)"
	three_box.style
	document.removeEventListener('keydown', doKeyDown);
	document.removeEventListener('keyup', doKeyUp);
	setTimeout(function(){
		renderer.renderLists.dispose();
		renderer.dispose()
	}, 1000);
	isCountingDown = false
}
