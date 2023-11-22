const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const gridSizeX = 10
const gridSizeY = 10

const boxSize = 60

const offsetX = 10
const offsetY = 100

let BoatList = [
	{ name : 'Carrier', x : 0, y : 0, startX : 700, startY : 150, ArrayX : -1, ArrayY : -1, size : 5, horizontal : true, isDragging : false },
	{ name : 'BattleShip', x : 0, y : 0, startX : 700, startY : 250, ArrayX : -1, ArrayY : -1, size : 4, horizontal : true, isDragging : false },
	{ name : 'Destroyer', x : 0, y : 0, startX : 700, startY : 350, ArrayX : -1, ArrayY : -1, size : 3, horizontal : true, isDragging : false },
	{ name : 'Submarine', x : 0, y : 0, startX : 700, startY : 450, ArrayX : -1, ArrayY : -1, size : 3, horizontal : true, isDragging : false },
	{ name : 'PatrolBoat', x : 0, y : 0, startX : 700, startY : 550, ArrayX : -1, ArrayY : -1, size : 2, horizontal : true, isDragging : false }
];

function initGame()
{
	BoatList.forEach(element => {
		element.x = element.startX;
		element.y = element.startY;
	});
	draw();
}

function drawTitle()
{
	ctx.font = "40px Arial";
	ctx.textAlign = "center"
	ctx.fillStyle = "#0095DD";
	ctx.fillText(`Please, Place your navire`, canvas.width / 2 , 65);
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

function isHover(element, mouseX, mouseY)
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


canvas.addEventListener('mousedown', (e) => 
{
	if (e.button != 0)
		return ;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

	BoatList.forEach(element => {
		if (isHover(element, mouseX, mouseY) == true)
		{
			// Start dragging
			element.isDragging = true;
	
			// Save the offset to adjust the position while dragging
			element.offsetX = mouseX - element.x;
			element.offsetY = mouseY - element.y;
	
			// Change cursor style while dragging
			canvas.style.cursor = 'grabbing';
		}
	});
});

function drawBoats()
{
	BoatList.forEach(element => 
	{
		ctx.beginPath();
		if (element.horizontal == true)
			ctx.rect(element.x, element.y, element.size * boxSize, boxSize);	
		else
			ctx.rect(element.x, element.y, boxSize, element.size * boxSize);
		ctx.fillStyle = "blue";
		ctx.fill();
		ctx.closePath();
	});
}

function draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid();
	drawTitle();
	drawBoats();
}

canvas.addEventListener('contextmenu', function(event) {
    // Prevent the default context menu behavior
    event.preventDefault();
	const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
	BoatList.forEach(element => 
	{
		if (element.isDragging)
		{
			element.x =  mouseX;
			element.y =  mouseY;
			element.offsetX = mouseX - element.x;
			element.offsetY = mouseY - element.y;
			element.horizontal = !element.horizontal;
			draw();
		}
	});
});

canvas.addEventListener('mousemove', (e) => 
{
	BoatList.forEach(element => 
	{
    	if (element.isDragging) 
		{
    	    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    	    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    	    // Update the position of the draggable item
    	    element.x = mouseX - element.offsetX;
    	    element.y = mouseY - element.offsetY;

    	    // Clear the canvas and redraw the draggable item
    	    ctx.clearRect(0, 0, canvas.width, canvas.height);
    	    draw();

    	    // Change cursor style while dragging
    	    canvas.style.cursor = 'grabbing';
    	}
	});
});

function isValidPos(element)
{
	let X = Math.round((element.x - offsetX) / boxSize);
	let Y = Math.round((element.y - offsetY) / boxSize);
}

canvas.addEventListener('mouseup', (e) =>
{
	if (e.button != 0)
		return ;
	BoatList.forEach(element => 
	{
		if (element.isDragging == true)
		{
    		element.isDragging = false;
			if ( element.x > offsetX - boxSize / 2 && element.x < (offsetX + gridSizeX * boxSize) - boxSize / 2 && element.y > offsetY - boxSize / 2  && element.y < (offsetY + gridSizeY * boxSize) -boxSize / 2 )
			{
				element.ArrayX = Math.round((element.x - offsetX) / boxSize);
				element.ArrayY = Math.round((element.y - offsetY) / boxSize);
				element.x = element.ArrayX * boxSize + offsetX;
				element.y = element.ArrayY * boxSize + offsetY;
			}
			else
			{
				element.horizontal = true;
				element.x = element.startX;
				element.y = element.startY;
				element.ArrayX = -1;
				element.ArrayY = -1;
			}
			draw();
		}
    	// Change cursor style back to default
    	canvas.style.cursor = 'grab';
	});
});


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

canvas.onload = initGame();
//setInterval(draw, 10)