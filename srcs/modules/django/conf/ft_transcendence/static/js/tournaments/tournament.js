import { getProfilePicture } from '../chatApp.js'
import { navto } from '../index.js'

var tournamentSocket = undefined

export function initTournaments()
{
	if (arguments[0] == undefined)
	{
		navto('/tournaments/Home')
		return
	}
	const tournamentId = arguments[0][0]
	if (tournamentSocket == undefined || tournamentSocket.url.endsWith(tournamentId) == false)
	{
		tournamentSocket = new WebSocket("ws://" + window.location.host + '/tournamentsApp/' + tournamentId)
		//tournamentSocket = new WebSocket("wss://" + window.location.host + '/tournamentsApp/' + tournamentId)
	}
	else
	{
		console.log("ReconnectToTournament")
		tournamentSocket.send(JSON.stringify({
			'function': 'Reconnect'
		}))
	}
  const csrf_token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
	let headers = new Headers()
	headers.append('Content-Type', 'application/json')
	headers.append('X-CSRFToken', csrf_token)
	fetch(document.location.origin + "/tournaments/GetTournamentData",
		{
			method: 'POST',
			headers: headers,
			body: JSON.stringify({'tourID' : tournamentId})
		})
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.json()
		})
		.then(data => {
			initTournamentsStatus(data)
		})
	document.querySelector('.BTN_Leave').addEventListener('click', leaveTournament)
	tournamentSocket.onopen = launchTournamentSocket
	tournamentSocket.onclose = quitTournamentSocket
	tournamentSocket.onmessage = e => OnMessageTournament(e)
	document.querySelector('.BTN_Ready').addEventListener('click', ReadyBehavior)
}

function initTournamentsStatus(data) {
  let tournamentNameEl= document.querySelector(".tournament_name")
  let tournamentDescriptionEl = document.querySelector(".tournament_description")
  let tournamentTypeEl = document.querySelector(".tournament_type")

  tournamentNameEl.textContent = data.tournamentName
  tournamentDescriptionEl.textContent = data.tournamentDescription
  if (data.tournamentType == 0) {
    tournamentTypeEl.src = "../static/assets/logo/ping-pong.png"
    tournamentTypeEl.alt = "Pong Tournament"
  } else {
    tournamentTypeEl.src = "../static/assets/logo/battleship.png"
    tournamentTypeEl.alt = "Battleship Tournament"
  }
  initBracket(data.numberPlayers)
}

async function initBracket(numberOfPlayers) {
  let nbOfGame = 1
  let rounds = {1: 'Final', 2: '1/2 Final', 4: '1/4 Final', 8: 'Round of 8', 16: 'Round of 16',  32: 'Round of 32'}
  let bracketClass = {4: 'four', 8: 'eight', 16: 'sixteen', 32: 'thirtytwo', 64: 'sixtyfour'}
  let matchClass = {1: 'final', 2: 'semi', 4: 'quarter', 8: 'eigth', 16: 'sixteen',  32: 'thirtytwo'}
  let matchHtml = await fetch(document.location.origin + "/tournaments/get_match_html",
    {
      method: 'GET'
    })
    .then(Response => {
      if (!Response.ok) {
        throw new Error('Network response was not okay')
      }
      return Response.text()
    })
    .catch(error => {
      console.error('Error:', error)
      return
    })
  let bracket = document.querySelector(".bracket")
  bracket.classList.add(bracketClass[numberOfPlayers])
  
  while (numberOfPlayers / nbOfGame > 1) {
    let roundElem = document.createElement("div")
    roundElem.classList.add("round", matchClass[nbOfGame])
    roundElem.appendChild(document.createElement("h4"))
    roundElem.firstChild.textContent = rounds[nbOfGame]
    bracket.insertBefore(roundElem, bracket.firstChild)
    for (let i = 0; i < nbOfGame; i++) {
      roundElem.insertAdjacentHTML("beforeend", matchHtml)
    }
    nbOfGame *= 2
  }
}

export function GoingAway()
{
	if (tournamentSocket == undefined)
		return
	console.log("GoingAway")
	tournamentSocket.send(JSON.stringify({
		'function': 'GoingAway'
	}))
}

function ReadyBehavior()
{
	if (tournamentSocket == undefined)
		return
	tournamentSocket.send(JSON.stringify({
		'function': 'ReadyPressed'
	}))
}

function launchTournamentSocket()
{
	console.log('Socket connected')
}

function quitTournamentSocket()
{
	console.log('Socket disconnected')
}

function leaveTournament()
{
	if (tournamentSocket == undefined)
		return
	tournamentSocket.close()
	tournamentSocket = undefined
	navto('/tournaments/Home')
	return
}

function OnMessageTournament(e)
{
	const data = JSON.parse(e.data)
	switch (data.type) {
		case 'MSG_UpdateUserList':
			PrintPlayers(data)
			break
		case 'MSG_LoadGame':
			LoadGame(data);
			break
		case 'MSG_UpdateMatchList':
      console.log('coucou')
			PrintMatchs(data)
			break
	}
}

function LoadGame(data)
{
	if (data.gameType == 'ship')
	{
		navto("/battleship	", data.gameId)
	}
	else if (data.gameType == 'pong')
	{
		navto("/pongGame/Remote", data.gameId)
	}
}

async function PrintPlayers(data)
{
	const PL = document.querySelector(".player_list")
	if (PL == null)
		return
	let child = PL.lastElementChild
	while (child) {
		PL.removeChild(child)
		child = PL.lastElementChild
	}

  const Players = data.usrList
  Players.forEach(async element =>  {
    let avatar = await getProfilePicture({'type': 'user', 'id': element.userId})
    if (avatar.type == 'image/null')
      avatar = '../static/assets/logo/user.png'
    else
      avatar = URL.createObjectURL(avatar)
    const item = document.createElement('li')
    const avatarEl = document.createElement('img')
    avatarEl.src = avatar 
    avatarEl.alt = "User avatar"
    const txt = document.createElement('p')
    txt.textContent = element.userName
    item.appendChild(avatarEl)
    item.appendChild(txt)
    PL.appendChild(item)
  })
  // document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}

async function PrintMatchs(data)
{
  console.log(data)
  if (data.matchList == 'None')
  {
    return
  }
  const Matchs = data.matchList
  Matchs.forEach(element => {
    const matchupEl = document.querySelector(".bracket").children[element['Y']].children[element['X']]
    let user1 = matchupEl.children[0]
    let user2 = matchupEl.children[1]
    let user1PP = await getProfilePicture({type: 'user', userId: }) 
  //   if (element.Winner == 0)
  //   {
  //     user1.style.color = "green"
  //     user2.style.color = "red"
  //   }
  //   else if (element.Winner == 1)
  //   {
  //     user1.style.color = "red"
  //     user2.style.color = "green"
  //   }
  //   txt.appendChild(user1)
  //   txt.appendChild(user2)
  //   PL.appendChild(txt)
  })
  // document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}
