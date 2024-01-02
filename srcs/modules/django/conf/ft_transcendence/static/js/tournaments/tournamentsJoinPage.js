
import { navto } from '../index.js'

export async function initTournamentsJoinPage()
{
	//Print tournaments
	await fetch(document.location.origin + "/tournaments/get_tournaments_html/",
	{
		method: 'GET',
	})
	.then(Response =>
	{
		if (!Response.ok)
		{
			throw new Error('Network response was not okay');
		}
		return Response.text();
	})
	.then(data =>
	{
		document.getElementById("listOfTournaments").innerHTML = data;
		console.log(data);
	})
	.catch(error =>
	{
		console.error('Error:', error);
	})

	var buttons = document.querySelectorAll('.joinGame_BTN');
	buttons.forEach(element => {
		element.addEventListener('click', function() {joinTournaments(element.id);})
	});
}

function joinTournaments(tournamentsId)
{
	console.log('Ca lance avec', tournamentsId);

	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
	headers.append('X-CSRFToken', crsf_token);

	var data = {
		'tournamentsId': tournamentsId,
	}

	fetch(document.location.origin + "/tournaments/join_tournaments/",
	{
		method: 'POST',
		headers: headers,
		body: JSON.stringify(data),
	})
	.then(Response =>
	{
		if (!Response.ok)
		{
			throw new Error('Network response was not okay');
		}
		return Response.json();
	})
	.then(data =>
	{
		if (data.error != undefined)
		{
			console.log('Error:', data.error);
			if (data.canJoin == true)
			{
				console.log("Join tournament " + tournamentsId)
				navto("Play", tournamentsId);
				return;
			}
			else
			{
				navto("");
				return;
			}
		}
		console.log("Join tournament " + tournamentsId)
		navto("Play", tournamentsId)
		return;

	})
	.catch(error =>
	{
		console.error('Error:', error);
	})
}

function printNoTournaments()
{
	console.log('Sorry no tournaments');
}
