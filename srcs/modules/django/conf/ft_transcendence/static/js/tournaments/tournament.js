import { navto, tournamentSocket, ModifyTS } from '../index.js'

export function initTournaments()
{
	var arg = undefined
	if (window.location.search != '')
		arg = window.location.search.substring(window.location.search.indexOf('=') + 1)
	if (arg == undefined)
	{
		if (tournamentSocket != undefined && tournamentSocket.readyState != WebSocket.CLOSED && tournamentSocket.url.endsWith(arg) == false)
		{
			console.log("Iici conard 2")
			tournamentSocket.close()
			ModifyTS(undefined)
		}
		navto('/tournaments/Home')
		return
	}
	if (tournamentSocket == undefined || tournamentSocket.url.endsWith(arg) == false)
	{
		if (tournamentSocket != undefined && tournamentSocket.readyState != WebSocket.CLOSED)
		{
			console.log("Ici Connard")
			tournamentSocket.close()
			ModifyTS(undefined)
		}
		ModifyTS(new WebSocket("ws://" + window.location.host + '/tournamentsApp/' + arg))
		//tournamentSocket = new WebSocket("wss://" + window.location.host + '/tournamentsApp/' + arg)
	}
	else
	{
		console.log('reconnect')
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
	console.log(tournamentSocket)	
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
