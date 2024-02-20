import { getProfilePicture } from '../chatApp/CA_General.js'
import { navto } from '../index.js'

let tournamentSocket = undefined
var tournamentId = undefined
let isBracketInit = false
let roundCounter

export function initTournaments()
{
	if (window.location.search != '')
		tournamentId = window.location.search.substring(window.location.search.indexOf('=') + 1)
	if (tournamentId == undefined)
	{
		navto('/games')
		return
	}
	if (document.querySelector('.tournament_page') == undefined)
		return
	isBracketInit = false
	roundCounter = 0
	// tournamentSocket = new WebSocket("ws://" + window.location.host + '/tournamentsApp/' + tournamentId)
	tournamentSocket = new WebSocket("wss://" + window.location.host + '/tournamentsApp/' + tournamentId)
	document.querySelector('.BTN_Leave').addEventListener('click', leaveTournament)
	tournamentSocket.onopen = launchTournamentSocket
	tournamentSocket.onclose = e => quitTournamentSocket(e)
	tournamentSocket.onmessage = e => OnMessageTournament(e)
	document.querySelector('.BTN_Ready').addEventListener('click', ReadyBehavior)
  document.querySelector('.BTN_Ready').disabled = true
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
  isBracketInit = true  
  queryMatchList()
}

async function queryMatchList() {
	const csrf_token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
	let headers = new Headers()
	headers.append('Content-Type', 'application/json')
	headers.append('X-CSRFToken', csrf_token)
  let matchList = await fetch(document.location.origin + '/tournaments/GetMatchList',
    {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({'tourId': tournamentId})
    })
  .then(Response => {
    if (!Response.ok) 
      throw new Error("Network response was not okay")
    return Response.json()
  })
  .catch(error => {
    console.error('Error:', error)
    return undefined 
  })
  if (matchList == undefined)
    return
  PrintMatchs(matchList.matchs)
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
	if (event.code == 3005)
	{
		tournamentSocket = undefined
		navto('/tournaments/Join')
	}
		// console.log('Socket disconnected')
	// navto('/games')
}

function leaveTournament()
{
	if (tournamentSocket == undefined)
		return
	// tournamentSocket.close()
	tournamentSocket.send(JSON.stringify({
		'function': 'LeavingTournament'
	}))
	navto('/tournaments/Join')
	return
}

function OnMessageTournament(e)
{
	const data = JSON.parse(e.data)
  console.log(data)
	switch (data.type) {
		case 'MSG_UpdateUserList':
			PrintPlayers(data)
			break
		case 'MSG_LoadGame':
			LoadGame(data);
			break
		case 'MSG_UpdateMatchList':
			PrintMatchs(data.matchList)
			break
    case 'MSG_RoundChange':
      roundCounter = data.newRound
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

  const Players = data.usrList
  Players.forEach(async element =>  {
		if (isAlreadyInList(element.userId) == true)
			return
    let avatar = await getProfilePicture({'type': 'user', 'id': element.userId})
    if (avatar.type == 'image/null')
      avatar = '/static/assets/logo/user.png'
    else
      avatar = URL.createObjectURL(avatar)
    const item = document.createElement('li')
		item.setAttribute('id', element.userId)
    const itemDiv = item.appendChild(document.createElement('div'))
    const avatarEl = document.createElement('img')
    avatarEl.src = avatar 
    avatarEl.alt = "User avatar"
    const txt = document.createElement('p')
    txt.textContent = element.userName
    itemDiv.appendChild(avatarEl)
    itemDiv.appendChild(txt)
    PL.appendChild(item)
  })
}

function isAlreadyInList(id) {
	let list = document.querySelector('.player_list').children

	for (const child of list) {
		if (child.getAttribute('id') == id)
			return true
	}
	return false
}

async function PrintMatchs(matchList)
{
  let roundsDict = {
    '0': 'Final',
    '-1': '1/2 Final',
    '-2': '1/4 Final',
    '-3': 'Round of 16',
    '-4': 'Round of 32',
    '-5': 'Round of 64'
  }
  let lostStage = '' 
  let selfId
  if (matchList == 'None' || isBracketInit == false)
    return
  console.log(matchList)
  let lastRound = matchList[matchList.length - 1].X
  console.log(lastRound)
  const bracket = document.querySelector('.bracket')
  if (bracket === undefined || bracket.children.length < matchList.slice(-1)[0].X + 1)
    return
  let Response = await fetch(document.location.origin + '/authApp/GET/userID',
    {
      method: 'GET'
    })
  if (Response.ok)
    selfId = await Response.json()
  else 
    throw new Error('Error when fetching user datas')
  matchList.forEach(async (element) => {
    console.log(element) 
    const matchupEl = bracket.children[element.X].children[element.Y + 1]
    if (matchupEl === undefined)
      return
    if (element.User1.id != -1 && element.User1.id != 'Undefined') {
      displayMatchPlayerHTML(0, element.User1, matchupEl, selfId.userID)
    }
    if (element.User2.id != -1 && element.User2.id != 'Undefined') {
      displayMatchPlayerHTML(1, element.User2, matchupEl, selfId.userID)
    }
    if (element.Winner === 0) {
      matchupEl.children[0].classList.add("winner")
      matchupEl.children[1].classList.add("loser")
      if (element.User1.id != selfId.userID && element.User2.id == selfId.userID) {
        lostStage = roundsDict[element.X - lastRound] 
      }
    } else if (element.Winner === 1) {
      matchupEl.children[0].classList.add("loser")
      matchupEl.children[1].classList.add("winner")
      if (element.User2.id != selfId.userID && element.User1.id == selfId.userID) {
        lostStage =  roundsDict[element.X - lastRound]
      }
    }
  })
  document.querySelector(".waiting_screen").style.display = 'none'
  console.log(lostStage)
  if (lostStage != '') 
    lostTournament(lostStage)
  else if (matchList[matchList.length - 1].Winner == -1) {
    if (isRoundFull(matchList) == true) {
      if (document.querySelector('.BTN_Ready').classList.contains('disable')) {
        document.querySelector('.BTN_Ready').classList.remove('disable') 
        document.querySelector('.BTN_Ready').disabled = false 
      }
    }
  }
  else
    displayTournamentResult(matchList[matchList.length - 1])
}

function isRoundFull(matchList) {
  for (let i in matchList) {
    if (matchList[i].User1.id == 'Undefined' || matchList[i].User2.id == 'Undefined') {
      let round = matchList[i].X
      let j = i
      while (j < matchList.length && matchList[j].X == round) {
        if (matchList[j].User1.id != 'Undefined' || matchList[j].User2.id != 'Undefined') 
          return false
        j++;
      }
    }
  }
  return true
}

async function displayMatchPlayerHTML(userNb, userData, matchupEl, selfId) {
  let user = matchupEl.children[userNb].children[0]
  if (user.children.length != 0)
    return
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
  if (userData.id == selfId) 
    matchupEl.children[userNb].classList.add('own')
}

function lostTournament(lostRound) {
  console.log('fsdfdsdfas')
  let lostElm  = document.querySelector(".next_match_wrapper")
  lostElm.style.display = 'flex'
  lostElm.querySelector('p').textContent = "You lost in " + lostRound
  document.querySelector('.BTN_Ready').classList.add('disable')
  document.querySelector('.BTN_Ready').disabled = true
}

async function displayTournamentResult(lastMatch) {
  document.querySelector('.next_match_wrapper').style.display = 'none'
  document.querySelector('.BTN_Ready').classList.add('disable')
  document.querySelector('.BTN_Ready').disabled = true
  let winner
  if (lastMatch.Winner == 0)
    winner = lastMatch.User1
  else
    winner = lastMatch.User2
  let resultElm = document.querySelector('.tournament_result')
  let winnerElm = resultElm.children[1]
  winnerElm.querySelector('p').textContent = winner.nickname
  let winnerPP = await getProfilePicture({'type': 'user', 'id': winner.id})
    if (winnerPP.type == 'image/null')
      winnerPP = '/static/assets/logo/user.png'
    else
      winnerPP = URL.createObjectURL(winnerPP)
  winnerElm.querySelector('img').src = winnerPP
  console.log(winnerElm)
  resultElm.style.display = 'flex'
}
