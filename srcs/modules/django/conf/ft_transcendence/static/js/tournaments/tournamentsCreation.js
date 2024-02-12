import { navto } from "../index.js"

export function initTournamentsCreation()
{
  let pongSelector = document.querySelector(".pong_selection_wrapper button")
  let BSSelector = document.querySelector(".battleship_selection_wrapper button")

  pongSelector.addEventListener("click", gameSelectorOnClick.bind(null, pongSelector, BSSelector))
  BSSelector.addEventListener("click",  gameSelectorOnClick.bind(null, BSSelector, pongSelector))
  document.getElementsByClassName("submitButtonCreateTournaments")[0].addEventListener("click", createTournaments)
}

function gameSelectorOnClick(seflEl, otherEl) {
  if (seflEl.classList.contains('selected')) {
    seflEl.classList.remove('selected')
  } else {
    seflEl.classList.add('selected')
    if (otherEl.classList.contains('selected')) 
      otherEl.classList.remove('selected')
  }
}

function createTournaments()
{
  let tournamentsName = document.querySelector('.TournamentsName').value
  let tournamentsDescription = document.querySelector('.TournamentsDescription').value
  let numberOfPlayers = document.querySelector('input[type="range"]').value
  let typeGame
  if (document.querySelector(".pong_selection_wrapper button").classList.contains('selected')) {
    typeGame = 'Pong'
  } else if (document.querySelector(".battleship_selection_wrapper button").classList.contains('selected')) {
    typeGame = 'Battleship'
  } else {
    document.getElementById("messageCreationTournaments").textContent = 'No game type chosen'   
    return
  }
  if (tournamentsName == '') {
    document.getElementById("messageCreationTournaments").textContent = "Tournament's Name needed"   
    return
  }
  if (tournamentsDescription == '') {
    document.getElementById("messageCreationTournaments").textContent = "Tournament's description needed"   
    return
  }

  switch (numberOfPlayers) {
    case '1':
      numberOfPlayers = '4' 
      break;
    case '2':
      numberOfPlayers = '8' 
      break;
    case '3':
      numberOfPlayers = '16' 
      break;
    case '4':
      numberOfPlayers = '32' 
      break;
    case '5':
      numberOfPlayers = '64' 
      break;
    default:
      document.getElementById("messageCreationTournaments").textContent = "Wrong number of players"   
      return

  }

  var tournamentsData = {
    tournamentsName: tournamentsName,
    tournamentsDescription: tournamentsDescription,
    numberOfPlayers: numberOfPlayers,
    typeGame: typeGame
  }

  const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value

  var headers = new Headers()
  headers.append('Content-Type', 'application/json')
  headers.append('X-CSRFToken', crsf_token)

	fetch(document.location.origin + '/tournaments/create_tournaments', {
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
			navto('/tournaments/Play/?id=' + data.id)
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
  document.getElementById('messageCreationTournaments').style.color = 'green'
}
