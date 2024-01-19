import { checkConnexion } from "./authApp.js";


let chatHeader = document.querySelector(".chatbox_header_wrapper");

export async function initChat()
{
	let logStatus = await checkConnexion();
	if (logStatus == true && chatSocket == undefined)
	{
    chatHeader.classList.add('connected')
    chatHeader.addEventListener("click", openChatbox)
    initChatHomepage()
		startChatConnexion();
	}
}

function openChatbox() {
  document.querySelector(".chatbox_wrapper").classList.add("open")
  chatHeader.removeEventListener("click", openChatbox)
  chatHeader.addEventListener("click", closeChatbox)
}

export function closeChatbox() {
  document.querySelector(".chatbox_wrapper").classList.remove("open")
  chatHeader.removeEventListener("click", closeChatbox)
  chatHeader.addEventListener("click", openChatbox)
}

function initChatHomepage() {
  initHomepageBody()
  initHomepageHeader()
}

function initHomepageHeader() {
  let mainBoxHeader = document.querySelector(".main_box_header")

  mainBoxHeader.classList.add("homepage")
  mainBoxHeader.appendChild(document.createElement("img"))
  mainBoxHeader.children[0].src = "../static/assets/logo/search-regular-24.png";
  mainBoxHeader.children[0].alt = "search icon";
  let searchBar = mainBoxHeader.appendChild(document.createElement("input"))
  searchBar.type = "text"
  searchBar.name = "searchbar"
  searchBar.placeholder = "Search a user or a channel"
}

function initHomepageBody() {
  let mainBoxBody = document.querySelector(".main_box_body")
  mainBoxBody.classList.add("homepage")
  let title = mainBoxBody.appendChild(document.createElement("h2"))
  title.textContent = "Discussions"
  let conversationList = mainBoxBody.appendChild(document.createElement("ul"))
  conversationList.classList.add("conversation_list")
  let navbar = mainBoxBody.appendChild(document.createElement("div"))
  navbar.classList.add("chatbox_homepage_navbar")
  let discussionButton = navbar.appendChild(document.createElement("button"))
  let friendsButton = navbar.appendChild(document.createElement("button"))
  discussionButton.name = "discussions"
  discussionButton.textContent = "Discussions"
  friendsButton.name = "friends"
  friendsButton.textContent = "Friends"

}

export function unsetChatbox() {
  closeChatbox()
  let mainBoxBody = document.querySelector(".main_box_body")
  let mainBoxHeader = document.querySelector(".main_box_header")
  chatHeader.classList.remove("connected")
  mainBoxBody.classList.forEach((className) => {
    if (className !== "main_box_body") {
      mainBoxBody.classList.remove(className)
    }
  })
  mainBoxHeader.classList.forEach((className) => {
    if (className !== "main_box_header") {
      mainBoxHeader.classList.remove(className)
    }
  })
  while (mainBoxBody.children.length > 0) {
    mainBoxBody.children[0].remove()
  }
  while (mainBoxHeader.children.length > 0) {
    mainBoxHeader.children[0].remove()
  }
}

let chatSocket = undefined;

function startChatConnexion()
{
	//chatSocket = new WebSocket("ws://" + window.location.host + '/chat/');

	//document.getElementById('chat_submit').addEventListener("click", sendMessage);
	//document.getElementById('channel_submit').addEventListener("click", channelMessage);
	//document.getElementById('invite_pong').addEventListener("click", invitePong);
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
	// if (data.type == 'invitation_pong')
	// {
	// 	invitationPong(data)
	// }
}

function invitationPong(data)
{
	if (confirm('Your received an invitation to pong game by ' + data.sender))
	{
		console.log('lets go');
		chatSocket.send(JSON.stringify({
			'type': 'accept_invitation',
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

function invitePong()
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