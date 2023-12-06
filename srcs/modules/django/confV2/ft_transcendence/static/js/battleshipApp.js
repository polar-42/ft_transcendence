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
	console.log(matchmakingSocket)
	document.getElementsByClassName("matchmake_BTN")[0].innerHTML = 'Leave matchmaking'
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", JoinMatchmaking)
	document.getElementsByClassName("matchmake_BTN")[0].addEventListener("click", LeaveMatchmaking)
}

function LeaveMatchmaking()
{
	if (matchmakingSocket == null)
		return
	matchmakingSocket.close()
	document.getElementsByClassName("matchmake_BTN")[0].innerHTML = 'Join matchmaking'
	document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking)
	document.getElementsByClassName("matchmake_BTN")[0].addEventListener("click", JoinMatchmaking)
	matchmakingSocket = null
}