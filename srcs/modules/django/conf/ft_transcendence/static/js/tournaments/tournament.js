import { getProfilePicture } from '../chatApp/CA_General.js'
import { navto, tournamentSocket, ModifyTS } from '../index.js'

export function initTournaments()
{
	var tournamentId = undefined
	if (window.location.search != '')
		tournamentId = window.location.search.substring(window.location.search.indexOf('=') + 1)
	if (tournamentId == undefined)
	{
		if (tournamentSocket != undefined && tournamentSocket.readyState != WebSocket.CLOSED && tournamentSocket.url.endsWith(tournamentId) == false)
		{
			// console.log("Iici conard 2")
			tournamentSocket.close()
			ModifyTS(undefined)
		}
		navto('/tournaments/Home')
		return
	}
	if (tournamentSocket == undefined || tournamentSocket.url.endsWith(tournamentId) == false)
	{
		if (tournamentSocket != undefined && tournamentSocket.readyState != WebSocket.CLOSED)
		{
			// console.log("Ici Connard")
			tournamentSocket.close()
			ModifyTS(undefined)
		}
		ModifyTS(new WebSocket("ws://" + window.location.host + '/tournamentsApp/' + tournamentId))
		//tournamentSocket = new WebSocket("wss://" + window.location.host + '/tournamentsApp/' + arg)
	}
	else
	{
		// console.log('reconnect')
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
	// console.log('Socket connected')
}

function quitTournamentSocket()
{
	// console.log('Socket disconnected')
	// navto('/games')
}

function leaveTournament()
{
	if (tournamentSocket == undefined)
		return
	tournamentSocket.close()
	ModifyTS(undefined)
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
  console.log(bracket)
  const Matchs = data.matchList
  Matchs.forEach(async (element) => {
    console.log(element) 
    const matchupEl = bracket.children[element.X].children[element.Y + 1]
    if (matchupEl === undefined)
      return
    if (matchupEl.querySelector('.player_profile').children.length == 0) {
      if (element.User1.id != -1 && element.User1.id != 'Undefined')
        displayMatchPlayerHTML(0, element.User1, matchupEl)
      if (element.User2.id != -1 && element.User2.id != 'Undefined')
        displayMatchPlayerHTML(1, element.User2, matchupEl)
    }
    if (element.Winner === 0) {
      matchupEl.children[0].classList.add("winner")
      matchupEl.children[1].user2.classList.add("loser")
    } else if (element.Winner === 1) {
      matchupEl.children[0].classList.add("loser")
      matchupEl.children[1].classList.add("winner")
    }
  })
  document.querySelector(".waiting_screen").style.display = 'none'
  document.querySelector('.next_match_wrapper').style.display = 'flex' 
}

async function displayMatchPlayerHTML(userNb, userData, matchupEl) {
  let user = matchupEl.children[userNb].children[0]
  let userPP = await getProfilePicture({type: 'user', id: userData.id})
  if (userPP === 'image/null')
    userPP = "/static/assets/logo/user.png"
  else
    userPP = URL.createObjectURL(userPP)
  user.appendChild(document.createElement('img'))
  user.querySelector('img').src = userPP
  user.querySelector('img').alt = 'Player profile picture'
  user.appendChild(document.createElement('p'))
  user.querySelector('p').textContent = userData.nickname
  user.setAttribute('id', userData.id)
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
