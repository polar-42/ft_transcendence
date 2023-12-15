import { navto } from "../index.js";

export function initTournaments()
{
	console.log('initTournaments');
	document.getElementsByClassName("joinTournaments_BTN")[0].addEventListener("click", joinTournaments)
	document.getElementsByClassName("createTournaments_BTN")[0].addEventListener("click", creationTournaments)
}

function joinTournaments()
{
	console.log('joinTournaments');
}

function creationTournaments()
{
	console.log('creationTournaments');
	navto('/tournaments/tournamentsCreation');
}
