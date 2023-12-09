import { navto } from "./index.js";

export function initMatchmakingPong()
{
	document.getElementsByClassName("matchmake_BTN")[0].addEventListener("click", JoinMatchmaking)
}

var matchmakingPongGame = null

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
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking)
	matchmakingPongGame.onclose = null
	navto("/pongGame", data.gameId)
}

