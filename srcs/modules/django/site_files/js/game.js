const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const gridSizeX = 10
const gridSizeY = 10

const boxSize = 60

const offsetX = 10
const offsetY = 100

const BTN_Validate = 
{
	x : (offsetX + boxSize * gridSizeX + 2) + ((canvas.width - (offsetX + boxSize * gridSizeX + 2)) / 2) - 100,
	y : 600,
	w : 200,
	h : 50,
	label : 'Confirme',
	color : 'blue',
	hoverColor : 'red'
}

let BoatList = [
	{ name : 'Carrier', x : 0, y : 0, startX : 700, startY : 150, ArrayX : -1, ArrayY : -1, size : 5, horizontal : true, isDragging : false },
	{ name : 'BattleShip', x : 0, y : 0, startX : 700, startY : 250, ArrayX : -1, ArrayY : -1, size : 4, horizontal : true, isDragging : false },
	{ name : 'Destroyer', x : 0, y : 0, startX : 700, startY : 350, ArrayX : -1, ArrayY : -1, size : 3, horizontal : true, isDragging : false },
	{ name : 'Submarine', x : 0, y : 0, startX : 700, startY : 450, ArrayX : -1, ArrayY : -1, size : 3, horizontal : true, isDragging : false },
	{ name : 'PatrolBoat', x : 0, y : 0, startX : 700, startY : 550, ArrayX : -1, ArrayY : -1, size : 2, horizontal : true, isDragging : false }
];

let BoardArray = [];

let validated = false;

function initGame()
{
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
	draw();
}

function drawTitle()
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

let tmpBoat = {x : 0, y : 0, horizontal : true};

canvas.addEventListener('mousedown', (e) => 
{
	if (e.button != 0 || validated == true)
		return ;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

	BoatList.forEach(element => {
		if (isHover(element, mouseX, mouseY) == true)
		{
			tmpBoat.x = element.x;
			tmpBoat.y = element.y;
			tmpBoat.horizontal = element.horizontal;
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
});

function drawBoats( dragging )
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

function drawDragged()
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

function drawValidateButton()
{
	let boatCount = 0;
	BoatList.forEach(element =>
		{
			if (element.ArrayX != -1)
				boatCount++;
		});
	if (boatCount == 5)
	{
		const mouseX = event.clientX - canvas.getBoundingClientRect().left;
		const mouseY = event.clientY - canvas.getBoundingClientRect().top;
		if (mouseX > BTN_Validate.x && mouseX < BTN_Validate.x + BTN_Validate.w && mouseY > BTN_Validate.y && mouseY < BTN_Validate.y + BTN_Validate.h)
			ctx.fillStyle = BTN_Validate.hoverColor;
		else
			ctx.fillStyle = BTN_Validate.color; // Button color
		ctx.fillRect(BTN_Validate.x, BTN_Validate.y, BTN_Validate.w, BTN_Validate.h);

		ctx.fillStyle = '#fff'; // Text color
		ctx.font = '16px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(BTN_Validate.label, BTN_Validate.x + BTN_Validate.w / 2, BTN_Validate.y + BTN_Validate.h / 2);
	}
}

function draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBoats(false);
	drawGrid();
	drawTitle();
	drawDragged();
	drawValidateButton();
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

canvas.addEventListener('click', function(e)
{
	if (e.button != 0)
		return ;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
	if (mouseX > BTN_Validate.x && mouseX < BTN_Validate.x + BTN_Validate.w && mouseY > BTN_Validate.y && mouseY < BTN_Validate.y + BTN_Validate.h)
		validated = !validated;
});

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
				if (isValidPos(element) == true)
				{
					
					element.ArrayX = Math.round((element.x - offsetX) / boxSize);
					element.ArrayY = Math.round((element.y - offsetY) / boxSize);
					element.x = element.ArrayX * boxSize + offsetX;
					element.y = element.ArrayY * boxSize + offsetY;
					if (element.horizontal == true) 
					{
						for (let i = 0; i < element.size; i++) 
						{
							if (BoardArray[element.ArrayY][element.ArrayX + i] == 0)
								BoardArray[element.ArrayY][element.ArrayX + i] = 1;
						}
					}
					else 
					{
						for (let i = 0; i < element.size; i++) 
						{
							if (BoardArray[element.ArrayY + i][element.ArrayX] == 0)
								BoardArray[element.ArrayY + i][element.ArrayX] = 1;
						}
					}
				}
				else
				{
					element.x = tmpBoat.x;
					element.y = tmpBoat.y;
					element.horizontal = tmpBoat.horizontal;
				}
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