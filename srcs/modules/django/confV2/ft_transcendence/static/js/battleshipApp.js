import { navto } from "./index.js";

export function initMatchmaking()
{
	document.getElementsByClassName("matchmake_BTN")[0].addEventListener("click", JoinMatchmaking)
}

var matchmakingSocket = null

function JoinMatchmaking()
{
	if(matchmakingSocket != null)
		return
	matchmakingSocket = new WebSocket("ws://" + window.location.host + "/socketApp/matchmaking/")
	matchmakingSocket.onopen = UpdateButtonJoin
	matchmakingSocket.onclose = UpdateButtonLeave
	matchmakingSocket.onmessage = e => OnMessage(e)
}

function UpdateButtonJoin()
{
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
	if (matchmakingSocket == null)
		return
	matchmakingSocket.close()

	matchmakingSocket = null
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking)
	matchmakingSocket.onclose = null
	navto("/battleship", data.gameId)
}

