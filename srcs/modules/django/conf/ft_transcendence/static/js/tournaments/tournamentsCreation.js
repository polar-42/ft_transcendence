import { navto } from "../index.js"

export function initTournamentsCreation()
{
	document.getElementsByClassName("submitButtonCreateTournaments")[0].addEventListener("click", createTournaments)
}

function createTournaments()
{
	let tournamentsName = document.getElementsByClassName('TournamentsName')[0].value
	let numberOfPlayers = document.getElementsByClassName('NumberOfPlayer')[0].value
	let typeGame = document.querySelector('input[name="TypeGame"]:checked').value

	var tournamentsData = {
		tournamentsName: tournamentsName,
		numberOfPlayers: numberOfPlayers,
		typeGame: typeGame
	}

	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value

	var headers = new Headers()
    headers.append('Content-Type', 'application/json')
	headers.append('X-CSRFToken', crsf_token)

	fetch(document.location.origin + '/tournaments/create_tournaments/', {
		method: 'POST',
		headers: headers,
		body: JSON.stringify(tournamentsData),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not okay')
		}
		return response.json()
	})
	.then(data => {
		if (data.isCreated == true)
		{
			creationTournamentsValidate(data.message)
			navto('/tournaments/Play', data.id)
		}
		else
		{
			throw new Error(data.message)
		}
	})
	.catch(error => {
		document.getElementById('messageCreationTournaments').innerHTML = error
		console.log('Error:', error)
	})
}

function creationTournamentsValidate(message)
{
	document.getElementById('messageCreationTournaments').innerHTML = message

}
