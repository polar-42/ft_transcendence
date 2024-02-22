import { checkConnexion } from "../authApp.js";
import { navto } from "../index.js";
import { AddToFriend, initFriendsPage, showFriendList, showFriendConversation, searchFriend } from "./CA_Friends.js";
import { goToChan, clickJoinChan, displayChannel, displayChannelHistory, receiveChanMsg, actualizeChannelHistory, initCreateChannel, receiveChanCreation, receiveJoinChanResponse, receiveDescriptionEdit } from "./CA_Channels.js";
import { goToConv, displayChatHistory, displayPrivMsg, receiveMsg, actualizeChatHistory } from "./CA_Private.js";
import { initGameInvitiation, receivePongInvitation, receiveBattleshipInvitation, receiveRefusedInvitation, showTMatchRequest } from "./CA_GameInvite.js";

const chatHeader = document.querySelector(".chatbox_header_wrapper");
export let chatSocket = undefined;

export async function initChat() {
	let logStatus = await checkConnexion();
	if (logStatus == true && chatSocket == undefined) {
		chatHeader.classList.add('connected')
		chatHeader.addEventListener("click", openChatbox)
		startChatConnexion();
	}
	else if (logStatus == false) {
		if (chatHeader.classList.contains('connected'))
			chatHeader.classList.remove('connected')
		chatSocket = undefined
	}
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

export function openChatbox() {
	if (document.querySelector(".chatbox_wrapper").classList.contains('open') == false)
	{
		document.querySelector(".chatbox_wrapper").classList.add("open")
		chatHeader.removeEventListener("click", openChatbox)
		chatHeader.addEventListener("click", closeChatbox)
	}
}

export function closeChatbox() {
	if (document.querySelector(".chatbox_wrapper").classList.contains('open') == true)
	{
		document.querySelector(".chatbox_wrapper").classList.remove("open")
		chatHeader.removeEventListener("click", closeChatbox)
		chatHeader.addEventListener("click", openChatbox)
	}
}

export function initChatHomepage() {
	initHomepageHeader()
	initHomepageBody()
}

function initHomepageHeader() {
	let mainBoxHeader = document.querySelector(".main_box_header")
	mainBoxHeader.classList.add("homepage")
	let html =
		'<img src="/static/assets/logo/search-regular-24.png" alt="search icon">' +
		'<input type="text" name="searchbar">'
	mainBoxHeader.innerHTML = html
	mainBoxHeader.children[1].addEventListener("keypress", (event) => {
		if (event.key === 'Enter') {
			if (mainBoxHeader.classList.contains('friendpage'))
				searchFriend(mainBoxHeader.children[1].value)
			else
				searchConv()
		}
	})
}

function searchConv() {
	let search = document.querySelector(".main_box_header input").value
	chatSocket.send(JSON.stringify({
		'type': 'search_conv',
		'input': search
	}))
}

function initHomepageBody() {
	let mainBoxBody = document.querySelector(".main_box_body")
	mainBoxBody.classList.add("homepage")

	let html = '<h2>Discussions</h2>' +
		'<ul class="conversation_list"></ul>' +
		'<div class="chatbox_homepage_navbar">' +
		'<button name="invitations">Game Invitation</button>' +
		'<button name="friends">Friends</button>' +
		'<button name="create_channel">Create a channel</button>' +
		'</div>'
	mainBoxBody.innerHTML = html

	document.querySelector("button[name='create_channel']").addEventListener("click", initCreateChannel)
	document.querySelector("button[name='invitations']").addEventListener("click", initGameInvitiation)
	document.querySelector("button[name='friends']").addEventListener("click", initFriendsPage)
	getLastChats()
}

function startChatConnexion() {
	// chatSocket = new WebSocket("ws://" + window.location.host + '/chat/');
	chatSocket = new WebSocket("wss://" + window.location.host + '/chat/');

	chatSocket.onopen = initChatHomepage
	chatSocket.onclose = closeChatSocket;
	chatSocket.onmessage = e => onMessageChat(e);
}

function closeChatSocket() {
	chatSocket = undefined;
}

function onMessageChat(e) {
	const data = JSON.parse(e.data)
	switch (data['type']) {
		case 'search_conv':
			displaySearchResult(data.data)
			break
		case 'last_chats':
			displayLastChats(data.data)
			break
		case 'get_user_data':
			displayPrivMsg(data)
			break
		case 'get_channel_data':
			displayChannel(data)
			break
		case 'chat_history':
			displayChatHistory(data.data, data.isStillUnreadMessage)
			break
		case 'actualize_chat_history':
			actualizeChatHistory(data.data)
			break
		case 'actualize_channel_history':
			actualizeChannelHistory(data.data)
			break
		case 'channel_history':
			displayChannelHistory(data.data, data.isStillUnreadMessage)
			break
		case 'channel_creation':
			receiveChanCreation(data)
			break
		case 'chat_private_message':
			receiveMsg(data)
			break
		case 'chat_channel_message':
			receiveChanMsg(data)
			break
		case 'join_channel_response':
			receiveJoinChanResponse(data)
			break
		case 'edit_description':
			receiveDescriptionEdit(data)
			break
		case 'receive_invitation_pong':
			receivePongInvitation(data)
			break
		case 'receive_invitation_battleship':
			receiveBattleshipInvitation(data)
			break
		case 'refused_invitation':
			receiveRefusedInvitation(data)
			break
		case 'start_pong_game':
			navto("/pongGame/Remote/?gameid=" + data.gameId);
			break
		case 'start_battleship_game':
			navto("/battleship/?gameid=" + data.gameId)
			break
		case 'ReceiveFriendshipPendingInvit':
			showFriendList(data.pendingInvit)
			break
		case 'ReceiveFriendsConversation':
			showFriendConversation(data.data)
			break
		case 'update_connexion_status':
			updateConnexionStatus(data)
			break
		case 'MSG_GameWaiting':
			showTMatchRequest(data.tournamentId)
			break
	}
}

function updateConnexionStatus(data) {
	let liDiv = document.getElementById('conv_' + data.user_id)
	if (liDiv != undefined)
	{
		if (data.new_status == 0)
			liDiv.querySelectorAll('.connection_point')[0].style.background = 'red'
		else
			liDiv.querySelectorAll('.connection_point')[0].style.background = 'green'
	}
}

export async function getProfilePicture(data) {
	let param = undefined
	if (data.type === 'channel')
	{
		param = new URLSearchParams({
			'type': 'channel',
			'name': data.name
		})
	}
	else
	{
		param = new URLSearchParams({
			type: 'user',
			userId: data.id
		})
	}
	Response = await fetch(document.location.origin + '/authApp/GET/avatarImage/?'
		+ param,
		{
			method: 'GET'
		})
	if (Response.ok) {
		let picture = await Response.blob()
		return picture
	}
}

async function displayLastChats(data, isStillUnreadMessage) {
	let conversation_list = document.querySelector(".conversation_list")

	for (let i = data.length - 1; i >= 0; i--) {
		let lastMsg
		if (data[i].last_msg.msg !== '')
			lastMsg = data[i].last_msg.sender + ': ' + data[i].last_msg.msg
		else
			lastMsg = ''
		let isConnected
		if (data[i].connexionStatus === undefined)
			isConnected = ''
		else if (data[i].connexionStatus === 0)
			isConnected = 'disconnected'
		else if (data[i].connexionStatus === 2)
			isConnected = 'connected'
		else
			isConnected = 'busy'
		let profilePicture = await getProfilePicture(data[i])
		let ppUrl
		if (profilePicture.type == 'image/null')
			ppUrl = "/static/assets/logo/user.png"
		else
			ppUrl = URL.createObjectURL(profilePicture)
		let convId;
		if (data[i].id != undefined)
			convId = "conv_" + data[i].id
		else
			convId = "conv_" + data[i].name

		let item =
			'<li class="' + data[i].type + '" ' + 'id="' + convId + '">' +
			'<div class="pop_up_unread" isread_popup="' + data[i].isRead + '"></div>' +
			'<img src=' + ppUrl + ' alt="converstion_picture">' +
			'<div class="conversation_text">' +
			'<div class="conversation_name">' +
			'<p>' + data[i].name + '</p>' +
			'<div class="connection_point ' + isConnected + '"></div>' +
			'</div>' +
			'<p class="last_msg">' + lastMsg + '</p>' +
			'</div>' +
			'<div class="AddToFriendContainer ' + data[i].friend + '">' +
			'<img class="FriendShip_BTN" src="/static/assets/logo/AddToFriendIcon.svg" alt="Add to friend">' +
			'</div>' +
			'</li>'
		if (conversation_list.children.length > 0)
			conversation_list.firstChild.insertAdjacentHTML("beforebegin", item)
		else
			conversation_list.innerHTML = item
		conversation_list.firstChild.addEventListener("click", () => {
			if (data[i].type === 'private')
				goToConv(data[i].id)
			else
				goToChan(data[i].name)
		})
		let divConv = document.querySelectorAll('.pop_up_unread')
		divConv.forEach((e) => {
		  if (e.getAttribute('isread_popup') == 'false')
		  {
			e.style.display = 'block'
			document.getElementById('pop_up_unread_chatbox').style.display = 'block'
		  }
		})
		const element = conversation_list.firstChild.querySelector('.FriendShip_BTN')
		element.addEventListener("click", () => {
			AddToFriend(data[i].id, element)
		})
	}
}

async function displaySearchResult(data) {
	let resultWrapper = document.querySelector(".conversation_list")

	if (document.querySelector(".main_box_header").children.length === 2)
	{
		document.querySelector(".main_box_header").insertAdjacentHTML("beforeend", '<img src="/static/assets/logo/arrow-back-regular-60.png" alt="return back button" class="back_arrow">')

		document.querySelector(".main_box_header img.back_arrow").addEventListener("click", () => {
			cleanMainBox()
			initChatHomepage()
		})
	}

	while (resultWrapper.children.length > 0) {
		resultWrapper.removeChild(resultWrapper.children[0])
	}

	let isConnected
	let member

	for (let i = 0; i < data.length; i++) {
		if (data[i].connexion_status == 2) {
			isConnected = 'connected'
		} else if (data[i].connexion_status === 0) {
			isConnected = 'disconnected'
		} else if (data[i].connexion_status === 1) {
			isConnected = 'busy'
		}
		if (data[i].member === false) {
			member = 'not_member'
		} else {
			member = ''
		}
		let privacyStatus = ''
		if (data[i].privacy_status !== undefined)
			privacyStatus = 'privacyStatus="' + data[i].privacy_status + '"'
		let isNoticationActive = ''
		let lastMsg
		if (data[i].type === 'channel')
			lastMsg = data[i].description
		else if (data[i].last_msg.message === undefined)
			lastMsg = ''
		else
			lastMsg = data[i].last_msg.sender + ': ' + data[i].last_msg.message
		let profilePicture = await getProfilePicture(data[i])
		let ppUrl
		if (profilePicture.type == 'image/null')
			ppUrl = "/static/assets/logo/user.png"
		else
			ppUrl = URL.createObjectURL(profilePicture)
		let item =
			'<li class="' + data[i].type + ' ' + member + '" ' + privacyStatus + '>' +
			'<img src=' + ppUrl + ' alt="converstion_picture">' +
			'<div class="conversation_text">' +
			'<div class="conversation_name">' +
			'<p>' + data[i].name + '</p>' +
			'<div class="connection_point ' + isConnected + '"></div>' +
			'</div>' +
			'<p class="last_msg">' + lastMsg + '</p>' +
			'</div>' +
			'<div class="notification_wrapper ' + isNoticationActive + '"></div>' +
			'<img class="join_btn" src="/static/assets/logo/user-plus-regular-36.png" alt="join channel button">' +
			'<div class="AddToFriendContainer ' + data[i].friend + '">' +
			'<img class="FriendShip_BTN" src="/static/assets/logo/AddToFriendIcon.svg" alt="Add to friend">' +
			'</div>' +
			'</li>'
		if (resultWrapper.children.length > 0) {
			resultWrapper.lastChild.insertAdjacentHTML("afterend", item)
		} else {
			resultWrapper.innerHTML = item
		}
		resultWrapper.lastChild.addEventListener("click", () => {
			if (data[i].type === 'private_message') {
				goToConv(data[i].id)
			} else if (data[i].type === 'channel' && data[i].member === true) {
				goToChan(data[i].name)
			}
		})
		const element = resultWrapper.lastChild.querySelector('.FriendShip_BTN')
		element.addEventListener("click", () => {
			AddToFriend(data[i].id, element)
		})
		resultWrapper.lastChild.querySelector(".join_btn").addEventListener("click", clickJoinChan)
	}
}

export function cleanMainBox() {
	let mainBoxBody = document.querySelector(".main_box_body")
	let mainBoxHeader = document.querySelector(".main_box_header")

	while (mainBoxBody.children.length > 0) {
		mainBoxBody.removeChild(mainBoxBody.children[0])
	}
	while (mainBoxHeader.children.length > 0) {
		mainBoxHeader.removeChild(mainBoxHeader.children[0])
	}
	if (mainBoxBody.classList.contains('homepage'))
	{
		mainBoxBody.classList.remove("homepage")
		mainBoxHeader.classList.remove("homepage")
	}
	if (mainBoxBody.classList.contains('friendpage'))
	{
		mainBoxBody.classList.remove('friendpage')
		mainBoxHeader.classList.remove('friendpage')
	}
}


function blockUser() {
	let target = document.getElementById('target_user');

	if (target.value.length <= 3) {
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'block_user',
		'target': target.value
	}))
	target.value = "";
}

function unblockUser() {
	let target = document.getElementById('target_user');

	if (target.value.length <= 3) {
		return;
	}

	chatSocket.send(JSON.stringify({
		'type': 'unblock_user',
		'target': target.value
	}))
	target.value = "";
}

function getLastChats() {
	chatSocket.send(JSON.stringify({
		'type': 'get_last_chats'
	}))
}

export function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
