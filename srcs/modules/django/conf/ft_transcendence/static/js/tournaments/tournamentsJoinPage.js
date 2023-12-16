

export function initTournamentsJoinPage()
{
	//Print tournaments
	console.log(document.location.origin + "/tournaments/get_tournaments/")
	fetch(document.location.origin + "/tournaments/get_tournaments_html/",
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
		document.getElementById("listOfTournaments").innerHTML = data
	})
	.catch(error =>
	{
		console.error('Error:', error);
	})

	//Add event listeners of tournaments join button
	console.log(document.location.origin + "/tournaments/get_tournaments/")
	fetch(document.location.origin + "/tournaments/get_tournaments/",
	{
		method: 'GET',
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
		if (data.games.length > 0) {
			putEventListener(data.games);
		}
	})
	.catch(error =>
	{
		console.error('Error:', error);
	})
}

function putEventListener(games)
{
	for (let i = 0; i < games.length; i++)
	{
		let id ='Tournaments' + i;
		document.getElementById(id).addEventListener('click', function() {joinTournaments(id, games[i].name);} );
	}
}

function joinTournaments(tournamentsId, name)
{
	console.log('Ca lance avec', tournamentsId);

	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
	headers.append('X-CSRFToken', crsf_token);

	var data = {
		'name': name,
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
		console.log(data);
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
