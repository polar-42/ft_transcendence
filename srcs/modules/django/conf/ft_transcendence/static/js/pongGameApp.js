import { navto } from "./index.js";

export function initMatchmakingPong()
{
	document.getElementsByClassName("matchmake_BTN")[0].addEventListener("click", JoinMatchmaking)
	document.getElementsByClassName("launchPongLocal_BTN")[0].addEventListener("click", LaunchPongLocal)
	document.getElementsByClassName("launchPongIA_BTN")[0].addEventListener("click", LaunchPongIA)
}

export function unLoadMatchmakingPong()
{
	if (matchmakingPongGame != null)
	{
		matchmakingPongGame.close();
	}
	matchmakingPongGame = null;
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking);
	document.getElementsByClassName("launchPongLocal_BTN")[0].removeEventListener("click", LaunchPongLocal);
	document.getElementsByClassName("launchPongIA_BTN")[0].removeEventListener("click", LaunchPongIA);
}

var matchmakingPongGame = null

function LaunchPongIA()
{
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking);
	document.getElementsByClassName("launchPongLocal_BTN")[0].removeEventListener("click", LaunchPongLocal);
	document.getElementsByClassName("launchPongIA_BTN")[0].removeEventListener("click", LaunchPongIA);
	LeaveMatchmaking();
	navto("/pongGame/pongGameIA", 'True');
}

function LaunchPongLocal()
{
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking);
	document.getElementsByClassName("launchPongLocal_BTN")[0].removeEventListener("click", LaunchPongLocal);
	document.getElementsByClassName("launchPongIA_BTN")[0].removeEventListener("click", LaunchPongIA);
	LeaveMatchmaking();
	navto("/pongGame/localPongGame");
}

function JoinMatchmaking()
{
	if(matchmakingPongGame != null)
		return
	console.log("ws://" + window.location.host + "/pongGame/matchmaking/")
	matchmakingPongGame = new WebSocket("ws://" + window.location.host + "/pongGame/matchmaking/")
	matchmakingPongGame.onopen = UpdateButtonJoin
	matchmakingPongGame.onclose = UpdateButtonLeave
	matchmakingPongGame.onmessage = e => OnMessage(e)
}

function UpdateButtonJoin()
{
	console.log(matchmakingPongGame)
	document.getElementsByClassName("matchmake_BTN")[0].innerHTML = 'Leave matchmaking'
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", JoinMatchmaking)
	document.getElementsByClassName("matchmake_BTN")[0].addEventListener("click", LeaveMatchmaking)
}

function UpdateButtonLeave()
{
	document.getElementsByClassName("matchmake_BTN")[0].innerHTML = 'Join matchmaking'
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking)
	document.getElementsByClassName("matchmake_BTN")[0].addEventListener("click", JoinMatchmaking)
}

function LeaveMatchmaking()
{
	if (matchmakingPongGame == null)
		return
	matchmakingPongGame.close()

	matchmakingPongGame = null
	console.log('Matchmaking disconnect');
}

function OnMessage(e)
{
	const data = JSON.parse(e.data);
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking);
	document.getElementsByClassName("launchPongLocal_BTN")[0].removeEventListener("click", LaunchPongLocal);
	document.getElementsByClassName("launchPongIA_BTN")[0].removeEventListener("click", LaunchPongIA);
	LeaveMatchmaking();
	navto("/pongGame", data.gameId);
}

