import { chatSocket, cleanMainBox, initChatHomepage } from './CA_General.js'
import { goToConv } from './CA_Private.js'
import { getProfilePicture } from './CA_General.js'


export function AddToFriend(identification, element) {
	chatSocket.send(JSON.stringify({
		'type': 'invit_to_friend',
		'target': identification,
	}))
	if (element.parentElement != undefined) {
		element.parentElement.classList.remove("friend")
		element.parentElement.classList.add("unknown")
	}
}


export function initFriendsPage()
{
	const mainBoxBody = document.querySelector(".main_box_body")
	const mainBoxHeader = document.querySelector(".main_box_header")
	let child = mainBoxBody.children[1].lastElementChild
	while (child) {
		mainBoxBody.children[1].removeChild(child);
		child = mainBoxBody.children[1].lastElementChild;
	}
	if (mainBoxHeader.children.length === 2)
		mainBoxHeader.insertAdjacentHTML("beforeend", '<img src="../static/assets/logo/arrow-back-regular-60.png" alt="return back button" class="back_arrow">')
	if (mainBoxBody.classList.contains('homepage'))
	{
		mainBoxBody.classList.remove('homepage')
		mainBoxHeader.classList.remove('homepage')
	}
	if (mainBoxBody.classList.contains('friendpage') == false)
	{
		mainBoxBody.classList.add('friendpage')
		mainBoxHeader.classList.add('friendpage')
		mainBoxBody.children[0].innerHTML = 'Friends'
		document.querySelector(".main_box_header img.back_arrow").addEventListener("click", () => {
			cleanMainBox()
			initChatHomepage()
		})
	}
	chatSocket.send(JSON.stringify({
		'type' : "MSG_RetrieveFriendInvitation"
	}))
	chatSocket.send(JSON.stringify({
		'type' : 'MSG_RetrieveFriendConversation',
		'limiter' : ''
	}))
}

export function showFriendList(data)
{
	const mainBoxBody = document.querySelector(".main_box_body")
	let child = mainBoxBody.children[1].lastElementChild
	while (child) {
		mainBoxBody.children[1].removeChild(child);
		child = mainBoxBody.children[1].lastElementChild;
	}
	data.forEach(element => {
		mainBoxBody.children[1].appendChild(createInvit(element.senderNick, element.identification))
	});
}

function createInvit(sender, send_id)
{
	let item = document.createElement("li")
	item.classList.add("message_item", "game_invitation")
	item.innerHTML =
		'<p>' + sender + ' send you a frend request</p>' +
		'<div class="acceptation_wrapper">' +
		'<button class="accept_btn">Accept</button>' +
		'<button class="refuse_btn">Refuse</button>' +
		'</div>'

	item.querySelector(".accept_btn").addEventListener("click", HandleFriendInvitation.bind(null, send_id, true, item, sender))
	item.querySelector(".refuse_btn").addEventListener("click", HandleFriendInvitation.bind(null, send_id, false, item, sender))
	return item
}

function HandleFriendInvitation(send_id, result, item, send_nick)
{
	item.lastChild.remove()
	item.appendChild(document.createElement("p"))
	if (result == true)
		item.lastChild.textContent = 'You accepted ' + send_nick + ' invitation'
	else
		item.lastChild.textContent = 'You refused ' + send_nick + ' invitation'
	chatSocket.send(JSON.stringify({
		'type': 'responseFriendInvitation',
		'result': result,
		'sender': send_id 
	}))
}

export function showFriendConversation(data)
{
	const messageList = document.querySelector(".main_box_body").children[1]
	console.log(messageList)
	data.forEach(async element => {
		let item = await createConversation(element)
		if (messageList.children.length > 0)
			messageList.firstChild.insertAdjacentHTML("beforebegin", item)
		else
			messageList.innerHTML = item
		messageList.firstChild.addEventListener("click", goToConv.bind(null, element.id))
	})
}

async function createConversation(conversation)
{
	let lastMsg
	if (conversation.last_msg !== null)
		lastMsg = conversation.last_msg.sender + ': ' + conversation.last_msg.msg
	else
		lastMsg = ''
	let isConnected
	if (conversation.connexionStatus === undefined)
		isConnected = ''
	else if (conversation.connexionStatus === 0)
		isConnected = 'disconnected'
	else
		isConnected = 'connected'
	let profilePicture = await getProfilePicture(conversation)
	let ppUrl
	if (profilePicture.type == 'image/null')
		ppUrl = "../static/assets/logo/user.png"
	else
		ppUrl = URL.createObjectURL(profilePicture)
	let convId;
	if (conversation.id != undefined)
		convId = "conv_" + conversation.id
	else
		convId = "conv_" + conversation.name
	if (conversation.timestamp == undefined)
		conversation.timestamp = ''
	let item =
		'<li class="' + conversation.type + '" ' + 'id="conv_' + conversation.id + '">' +
		'<div class="pop_up_unread" isread_popup="' + conversation.isRead + '"></div>' +
		'<img src=' + ppUrl + ' alt="converstion_picture">' +
		'<div class="conversation_text">' +
		'<div class="conversation_name">' +
		'<p>' + conversation.name + '</p>' +
		'<div class="connection_point ' + isConnected + '"></div>' +
		'</div>' + 
		'<p class="last_msg">' + lastMsg + '</p>' +
		'</div>' +
		'<div class="AddToFriendContainer ' + conversation.friend + '">' +
		'<img class="FriendShip_BTN" src="../static/assets/logo/AddToFriendIcon.svg" alt="Add to friend">' +
		'</div>' +
		'</li>'
	return item
}

export function searchFriend(value)
{
	chatSocket.send(JSON.stringify({
		'type' : "MSG_RetrieveFriendInvitation"
	}))
	chatSocket.send(JSON.stringify({
		'type' : 'MSG_RetrieveFriendConversation',
		'limiter' : value
	}))
}