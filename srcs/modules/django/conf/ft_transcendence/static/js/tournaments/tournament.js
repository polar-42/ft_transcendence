import { getProfilePicture } from '../chatApp/CA_General.js'
import { navto } from '../index.js'

let tournamentSocket = undefined
var tournamentId = undefined

export function initTournaments()
{
	if (window.location.search != '')
		tournamentId = window.location.search.substring(window.location.search.indexOf('=') + 1)
	if (tournamentId == undefined)
	{
		navto('/games')
		return
	}
	tournamentSocket = new WebSocket("ws://" + window.location.host + '/tournamentsApp/' + tournamentId)
	//tournamentSocket = new WebSocket("wss://" + window.location.host + '/tournamentsApp/' + arg)
	document.querySelector('.BTN_Leave').addEventListener('click', leaveTournament)
	tournamentSocket.onopen = launchTournamentSocket
	tournamentSocket.onclose = e => quitTournamentSocket(e)
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
    tournamentTypeEl.src = "/static/assets/logo/ping-pong.png"
    tournamentTypeEl.alt = "Pong Tournament"
  } else {
    tournamentTypeEl.src = "/static/assets/logo/battleship.png"
    tournamentTypeEl.alt = "Battleship Tournament"
  }
  initBracket(data.numberPlayers)
}

async function initBracket(numberOfPlayers) {
  // console.log(numberOfPlayers)
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
	// console.log(tournamentSocket)	
	if (tournamentSocket == undefined)
		return
	if (tournamentSocket.readyState == WebSocket.CLOSED)
		return
	tournamentSocket.send(JSON.stringify({
		'function': 'GoingAway'
	}))
}

function ReadyBehavior()
{
	if (tournamentSocket == undefined)
		return
  document.querySelector('.BTN_Ready').classList.add("ready")
	tournamentSocket.send(JSON.stringify({
		'function': 'ReadyPressed'
	}))
}

function launchTournamentSocket()
{
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
}

function quitTournamentSocket(event)
{
	// console.log('Socket disconnected')
	// navto('/games')
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
      // console.log('coucou')
			PrintMatchs(data)
			break
	}
}

function LoadGame(data)
{
	if (data.gameType == 'ship')
	{
		navto("/battleship/?gameid=" + data.gameId)
	}
	else if (data.gameType == 'pong')
	{
		navto("/pongGame/Remote/?gameid=" + data.gameId)
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
	console.log(element)
    let avatar = await getProfilePicture({'type': 'user', 'id': element.userId})
    if (avatar.type == 'image/null')
      avatar = '/static/assets/logo/user.png'
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
  const nbPlayer = {
    1: 4,
    2: 8,
    3: 16,
    4: 32,
    5: 64
  }

  // console.log(data)
  if (data.matchList == 'None')
  {
    return
  }
  const bracket = document.querySelector('.bracket')
  if (bracket === undefined || bracket.children.length < nbPlayer[data.matchList.slice(-1)[0].X]) {
    await initBracket(data.matchList.slice(-1)[0].X)
  }
  const Matchs = data.matchList
  Matchs.forEach(async (element) => {
    if (element.User1.id === -1 || element.User1.id === 'Undefined')
      return
    const matchupEl = bracket.children[element.X].children[element.Y + 1]
    // console.log(matchupEl)
    if (matchupEl === undefined)
      return
    if (matchupEl.querySelector('.player_profile').children.length == 0) {
      let user1 = matchupEl.children[0].children[0]
      let user1PP = await getProfilePicture({type: 'user', id: element.User1.id})
      if (user1PP === 'image/null')
        user1PP = "/static/assets/logo/user.png"
      else
        user1PP = URL.createObjectURL(user1PP)
      user1.appendChild(document.createElement('img'))
      user1.querySelector('img').src = user1PP
      user1.querySelector('img').alt = 'Player profile picture'
      user1.appendChild(document.createElement('p'))
      user1.querySelector('p').textContent = element.User1.nickname
      user1.setAttribute('id', element.User1.id)
      let user2 = matchupEl.children[1].children[0]
      let user2PP = await getProfilePicture({type: 'user', id: element.User2.id})
      if (user2PP === 'image/null')
        user2PP = "/static/assets/logo/user.png"
      else
        user2PP = URL.createObjectURL(user2PP)
      user2.appendChild(document.createElement('img'))
      user2.firstChild.src = user2PP
      user2.firstChild.alt = 'Player profile picture'
      user2.appendChild(document.createElement('p'))
      user2.lastChild.textContent = element.User2.nickname
      user2.setAttribute('id', element.User2.id)
    }

    if (element.Winner === 0) {
      matchupEl.firstChild.classList.add("winner")
      matchupEl.lastChild.user2.classList.add("loser")
    } else if (element.Winner === 1) {
      matchupEl.firstChild.classList.add("loser")
      matchupEl.lastChild.user2.classList.add("winner")
    }
  })
  document.querySelector(".waiting_screen").style.display = 'none'
  document.querySelector('.next_match_wrapper').style.display = 'flex' 
}

function waitForElm(selector) {

  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve(document.querySelector(selector))
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}
