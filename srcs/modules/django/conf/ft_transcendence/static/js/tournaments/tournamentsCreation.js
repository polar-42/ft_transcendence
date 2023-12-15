import { navto } from "../index.js";

export function initTournamentsCreation()
{
	console.log('initTournamentsCreation');
	document.getElementsByClassName("submitButtonCreateTournaments")[0].addEventListener("click", createTournaments)
	//submitButtonCreateTournaments
}

function createTournaments()
{
	console.log('createTournaments');
	let tournamentsName = document.getElementsByClassName('TournamentsName')[0].value;
	let numberOfPlayers = document.getElementsByClassName('NumberOfPlayer')[0].value;
	console.log('Lets create ' + tournamentsName + ' with ' + numberOfPlayers);

	var tournamentsData = {
		tournamentsName: tournamentsName,
		numberOfPlayers: numberOfPlayers
	}

	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
	headers.append('X-CSRFToken', crsf_token);

	fetch(document.location.origin + '/tournaments/create_tournaments/', {
		method: 'POST',
		headers: headers,
		body: JSON.stringify(tournamentsData),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not okay');
		}
		return response.json();
	})
	.then(data => {
		console.log(data);
	})
	.catch(error => {
		console.log('Error:', error);
	})
}
