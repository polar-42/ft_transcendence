import { navto } from "./index.js"

export function initMatchmaking()
{
	document.getElementsByClassName("matchmake_BTN")[0].addEventListener("click", JoinMatchmaking)
}

var matchmakingSocket = null

export function JoinMatchmaking()
{
	if(matchmakingSocket != null && matchmakingSocket.readyState != WebSocket.CLOSED)
		return
		matchmakingSocket = new WebSocket("wss://" + window.location.host + "/battleshipApp/Matchmaking/")
		// matchmakingSocket = new WebSocket("ws://" + window.location.host + "/battleshipApp/Matchmaking/")
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
	const btn = document.getElementsByClassName("matchmake_BTN")[0]
	if (btn != null)
	{
		btn.innerHTML = 'Join matchmaking'
		btn.removeEventListener("click", LeaveMatchmaking)
		btn.addEventListener("click", JoinMatchmaking)
	}
	LeaveMatchmaking()
}

export function LeaveMatchmaking()
{
	if (matchmakingSocket == null)
		return
	if(matchmakingSocket.readyState != 3)
		matchmakingSocket.close()
	matchmakingSocket = null
}

function OnMessage(e)
{
	const data = JSON.parse(e.data)
	// document.getElementsByClassName("matchmake_BTN")[0].removeEventListener("click", LeaveMatchmaking)
	// matchmakingSocket.onclose = null
	navto("/battleship/?gameId=" + data.gameId)
}

