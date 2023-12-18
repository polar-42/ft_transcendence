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
	tournamentSocket.onmessage = e => OnMessage(e)
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
