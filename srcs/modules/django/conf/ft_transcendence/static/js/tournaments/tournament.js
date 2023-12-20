import { navto } from '../index.js'

var tournamentSocket = undefined

export function initTournaments()
{
	if (arguments[0] == undefined)
	{
		navto('/tournaments/tournamentsHome');
		return;
	}
	const tournamentId = arguments[0];
	tournamentSocket = new WebSocket("ws://" + window.location.host + '/socketApp/tournamentsApp/' + tournamentId);

	document.getElementById('BTN_Leave').addEventListener('click', leaveTournament);

	tournamentSocket.onopen = launchTournamentSocket
	tournamentSocket.onclose = quitTournamentSocket
	tournamentSocket.onmessage = e => OnMessageTournament(e)
}

function launchTournamentSocket()
{
	console.log('Socket connected');
}

function quitTournamentSocket()
{
	console.log('Socket disconnected');
}

function leaveTournament()
{
	if (tournamentSocket == null)
		return;
	tournamentSocket.close();

	tournamentSocket = null;
	console.log('Socket disconnected');
	navto('/tournaments/tournamentsHome');
	return;
}

function OnMessageTournament(e)
{
	const data = JSON.parse(e.data);
	switch (data.type) {
		case 'SendPlayersList':
			printPlayersInTournaments(data);
			break;
		case 'SendMatchList':
			printMatchs(data);
			break
		case 'LaunchMatch':
			LoadGame(data)
			break
		case 'match_id':
			break
		default:
			break;
	}
}

function LoadGame(data) 
{
	console.log(data)
	console.log(data.gameId)
	navto("/battleship", data.gameId)
}

function printMatchs(data)
{
	const PL = document.getElementsByName("MatchList")[0]
	if (PL == null)
		return
	const matchs = data.matchList
	var pos = 0
	matchs.forEach(element => {
		const txt = document.createElement('li')
		const player1 = document.createElement('p')
		const player2 = document.createElement('p')
		player1.textContent = element['User1']
		player2.textContent = element['User2']
		txt.appendChild(player1)
		txt.appendChild(player2)
		PL.appendChild(txt)
	})
}

function printPlayersInTournaments(data)
{
	const PL = document.getElementsByName("PlayerList")[0]
	if (PL == null)
		return
    let child = PL.lastElementChild;
    while (child) {
        PL.removeChild(child);
        child = PL.lastElementChild;
    }
	const Players = data.players
	Players.forEach(element => {
		const txt = document.createElement('li')
		txt.textContent = element
		PL.appendChild(txt)
	});
	// document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}

