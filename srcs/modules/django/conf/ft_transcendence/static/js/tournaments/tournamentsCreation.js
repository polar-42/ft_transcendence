import { navto } from "../index.js";

export function initTournamentsCreation()
{
	console.log('initTournamentsCreation');
	document.getElementsByClassName("submitButtonCreateTournaments")[0].addEventListener("click", createTournaments)
	//submitButtonCreateTournaments
}

function createTournaments()
{
	console.log('createTournaments');
	let tournamentsName = document.getElementsByClassName('TournamentsName')[0].value;
	let numberOfPlayers = document.getElementsByClassName('NumberOfPlayer')[0].value;
	console.log('Lets create ' + tournamentsName + ' with ' + numberOfPlayers);


}
