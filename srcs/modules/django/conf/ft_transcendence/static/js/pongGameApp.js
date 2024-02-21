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

export function LaunchPongIA()
{
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking);
	document.getElementsByClassName("launchPongLocal_BTN")[0].removeEventListener("click", LaunchPongLocal);
	document.getElementsByClassName("launchPongIA_BTN")[0].removeEventListener("click", LaunchPongIA);
	LeaveMatchmaking();
	navto("/pongGame/IA");
}

export function LaunchPongLocal()
{
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking);
	document.getElementsByClassName("launchPongLocal_BTN")[0].removeEventListener("click", LaunchPongLocal);
	document.getElementsByClassName("launchPongIA_BTN")[0].removeEventListener("click", LaunchPongIA);
	LeaveMatchmaking();
	navto("/pongGame/Local");
}

export function JoinMatchmaking()
{
	if(matchmakingPongGame != null)
		return
	matchmakingPongGame = new WebSocket("wss://" + window.location.host + "/pongGame/matchmaking/")
		// matchmakingPongGame = new WebSocket("ws://" + window.location.host + "/pongGame/matchmaking/")
	matchmakingPongGame.onmessage = e => OnMessage(e)
	matchmakingPongGame.onclose = e => OnCloseSocket(e)
}

function OnCloseSocket(event)
{
	console.log(event)
	if (event.code == 1006)
	{
		matchmakingPongGame = null
		return
	}

}

export function LeaveMatchmaking()
{
	if (matchmakingPongGame == null)
		return
	matchmakingPongGame.close()

matchmakingPongGame = null
	// console.log('Matchmaking disconnect');
}

function OnMessage(e)
{
	const data = JSON.parse(e.data);
	LeaveMatchmaking();
	navto("/pongGame/Remote/?id=" + data.gameId);
}

