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
	console.log(data);
	if (data.type == 'queue_tournament_data')
	{
		printPlayersInTournaments(data);
	}
	else if (data.type == 'match_id')
	{
		launchGame(data);
	}
}

function printPlayersInTournaments(data)
{
	document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}

var socketGame = undefined;

function launchGame(data)
{
	socketGame = new WebSocket("ws://" + window.location.host + '/socketApp/tournamentsGame/' + data.match_id);

	socketGame.onopen = launchMatchSocket
	socketGame.onclose = quitMatchSocket
	socketGame.onmessage = e => OnMessageGame(e)
}

function launchMatchSocket()
{
	console.log('launchMatchSocket');
}

function quitMatchSocket()
{
	console.log('quitMatchSocket');
}
