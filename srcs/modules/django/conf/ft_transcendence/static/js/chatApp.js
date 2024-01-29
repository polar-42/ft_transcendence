import { checkConnexion } from "./authApp.js";
import { navto } from "./index.js";

export async function initChat()
{
	let logStatus = await checkConnexion();
	if (logStatus == true && chatSocket == undefined)
	{
		startChatConnexion();
	}
}

let chatSocket = undefined;

export function closeChat()
{
	if (chatSocket != undefined)
	{
		if (chatSocket.readyState === chatSocket.OPEN)
		{
			console.log('close')
			chatSocket.close();
			chatSocket = undefined
		}
	}
}

function startChatConnexion()
{
	chatSocket = new WebSocket("ws://" + window.location.host + '/chat/');
	//chatSocket = new WebSocket("wss://" + window.location.host + '/chat/');

	//document.getElementById('chat_submit').addEventListener("click", sendMessage);
	//document.getElementById('channel_submit').addEventListener("click", channelMessage);
	//document.getElementById('invite_pong').addEventListener("click", inviteToPongGame);
	//document.getElementById('invite_battleship').addEventListener("click", inviteToBattleshipGame);
	//document.getElementById('channel_join').addEventListener("click", joinChannel);
	//document.getElementById('channel_leave').addEventListener("click", leaveChannel);
	//document.getElementById('user_block').addEventListener("click", blockUser);
	//document.getElementById('user_unblock').addEventListener("click", unblockUser);
	//document.getElementById('get_last_chat').addEventListener("click", getLastChat);
	//document.getElementById('get_all_users').addEventListener("click", getAllUsers);
	//document.getElementById('get_history_chat').addEventListener("click", getHistoryChat);
	//document.getElementById('get_history_channel').addEventListener("click", getHistoryChannel);

	//chatSocket.onclose = closeChatSocket;
	//chatSocket.onmessage = e => onMessageChat(e);
}

function closeChatSocket()
{
	chatSocket = undefined;
}

function onMessageChat(e)
{
	const data = JSON.parse(e.data)

	console.log(data);
	if (data.type == 'receive_invitation_pong')
	{
		receivePongInvitation(data)
	}
	if (data.type == 'receive_invitation_battleship')
	{
		receiveBattleshipInvitation(data)
	}
	else if (data.type == 'start_pong_game')
	{
		startPongGame(data)
	}
	else if (data.type == 'start_battleship_game')
	{
		startBattleshipGame(data)
	}
}

function startPongGame(data)
{
	navto("/pongGame/Remote", data.gameId);
}

function startBattleshipGame(data)
{
	navto("/battleship", data.gameId)
}

function receivePongInvitation(data)
{
	if (confirm('Your received an invitation to pong game by ' + data.sender))
	{
		console.log('lets go');
		chatSocket.send(JSON.stringify({
			'type': 'accept_invitation_pong',
			'target': data.sender
		}))
	}
	else
	{
		console.log('pas go');
	}
}

function receiveBattleshipInvitation(data)
{
	if (confirm('Your received an invitation to battleship game by ' + data.sender))
	{
		console.log('lets go');
		chatSocket.send(JSON.stringify({
			'type': 'accept_invitation_battleship',
			'target': data.sender
		}))
	}
	else
	{
		console.log('pas go');
	}
}

function sendMessage()
{
    let message = document.getElementById('message_chat');
    let targetUser = document.getElementById('target_user');

	if (message.value.length <= 0 || targetUser.value.length <= 3)
	{
		console.log('Error: One field too small');
		return;
	}

	console.log('message is', message.value, 'and tagetUser is', targetUser.value);

    chatSocket.send(JSON.stringify({
		'type': 'chat_message',
        'message': message.value,
        'target': targetUser.value
    }))
	message.value = "";
	targetUser.value = "";
}

function channelMessage()
{
    let message = document.getElementById('message_chat');
    let channelName = document.getElementById('target_user');

	if (channelName.value.length <= 3)
	{
		console.log('Error: One field too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'channel_message',
        'target': channelName.value,
		'message': message.value
    }))
	channelName.value = "";
	message.value = "";
}

function inviteToPongGame()
{
    let channelName = document.getElementById('target_user');

	if (channelName.value.length <= 3)
	{
		console.log('Error: One field too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'invite_pong',
        'target': channelName.value
    }))
	channelName.value = "";
}

function inviteToBattleshipGame()
{
    let channelName = document.getElementById('target_user');

	if (channelName.value.length <= 3)
	{
		console.log('Error: One field too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'invite_battleship',
        'target': channelName.value
    }))
	channelName.value = "";
}

function joinChannel()
{
    let channelName = document.getElementById('target_user');

	if (channelName.value.length <= 3)
	{
		console.log('Error: channel name too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'channel_join',
        'target': channelName.value
    }))
	channelName.value = "";
}


function leaveChannel()
{
    let channelName = document.getElementById('target_user');

	if (channelName.value.length <= 3)
	{
		console.log('Error: channel name too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'channel_leave',
        'target': channelName.value
    }))
	channelName.value = "";
}

function blockUser()
{
    let target = document.getElementById('target_user');

	if (target.value.length <= 3)
	{
		console.log('Error: channel name too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'block_user',
        'target': target.value
    }))
	target.value = "";
}

function unblockUser()
{
    let target = document.getElementById('target_user');

	if (target.value.length <= 3)
	{
		console.log('Error: channel name too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'unblock_user',
        'target': target.value
    }))
	target.value = "";
}

function getLastChat()
{
	chatSocket.send(JSON.stringify({
		'type': 'get_last_chat'
    }))
}


function getAllUsers()
{
	chatSocket.send(JSON.stringify({
		'type': 'get_all_users'
    }))
}


function getHistoryChat()
{
    let target = document.getElementById('target_user');

	if (target.value.length <= 3)
	{
		console.log('Error: channel name too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'get_history_chat',
        'target': target.value
    }))
	target.value = "";
}

function getHistoryChannel()
{
    let target = document.getElementById('target_user');

	if (target.value.length <= 3)
	{
		console.log('Error: channel name too small');
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'get_history_channel',
        'target': target.value
    }))
	target.value = "";
}
