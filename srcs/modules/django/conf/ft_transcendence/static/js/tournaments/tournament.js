import { navto } from '../index.js'

var tournamentSocket = undefined

export function initTournaments()
{
	if (arguments[0] == undefined)
	{
		navto('/tournaments/Home')
		return
	}
	const tournamentId = arguments[0]
	if (tournamentSocket == undefined || tournamentSocket.url.endsWith(tournamentId) == false)
		tournamentSocket = new WebSocket("ws://" + window.location.host + '/tournamentsApp/' + tournamentId)
	else
	{
		console.log("ReconnectToTournament")
		tournamentSocket.send(JSON.stringify({
			'function': 'Reconnect'
		}))
	}
	document.getElementById('BTN_Leave').addEventListener('click', leaveTournament)

	tournamentSocket.onopen = launchTournamentSocket
	tournamentSocket.onclose = quitTournamentSocket
	tournamentSocket.onmessage = e => OnMessageTournament(e)
	document.getElementById('BTN_Ready').addEventListener('click', ReadyBehavior)
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
			PrintMatchs(data)
			break
	}
}

function LoadGame(data)
{
	if (data.gameType == 'ship')
	{
		navto("/battleship", data.gameId)
	}
	else if (data.gameType == 'pong')
	{
		navto("/pongGame/Remote", data.gameId)
	}
}

function PrintPlayers(data)
{
	const PL = document.getElementsByName("PlayerList")[0]
	if (PL == null)
		return
    let child = PL.lastElementChild
    while (child) {
        PL.removeChild(child)
        child = PL.lastElementChild
    }
	const Players = data.usrList
	Players.forEach(element => {
		const txt = document.createElement('li')
		txt.textContent = element
		PL.appendChild(txt)
	})
	// document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}

function PrintMatchs(data)
{
	const PL = document.getElementsByName("MatchList")[0]
	if (PL == null)
		return
    let child = PL.lastElementChild
    while (child) {
        PL.removeChild(child)
        child = PL.lastElementChild
    }
	if (data.matchs == 'None')
	{
		return
	}
	const Matchs = data.matchList
	Matchs.forEach(element => {
		const txt = document.createElement('li')
		const user1 = document.createElement('h1')
		const user2 = document.createElement('h1')
		user1.textContent = element.User1
		user2.textContent = element.User2
		if (element.Winner == 0)
		{
			user1.style.color = "green"
			user2.style.color = "red"
		}
		else if (element.Winner == 1)
		{
			user1.style.color = "red"
			user2.style.color = "green"
		}
		txt.appendChild(user1)
		txt.appendChild(user2)
		PL.appendChild(txt)
	})
	// document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}
