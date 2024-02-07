import { initChatHomepage, getProfilePicture, cleanMainBox, sleep, chatSocket } from "./CA_General.js"
import { AddToFriend } from "./CA_Friends.js"

export function displayChatHistory(data) {
	let conversation = document.querySelector(".conversation")
	for (let i = 0; i < data.length; i++) {
		let sender
		if (data[i].received === true) {
			sender = ''
		} else {
			sender = 'own'
		}
		let item =
			'<li class="message_item ' + sender + '" msgid=' + data[i].id + '>' +
			'<p class="message">' + data[i].message + '</p>' +
			'<p class="timestamp">' + data[i].time.substring(0, 19) + '</p>' +
			'</li>'
		if (conversation.children.length === 0) {
			conversation.innerHTML = item
		} else {
			conversation.firstChild.insertAdjacentHTML("beforebegin", item)
		}
	}
	conversation.scrollTo(0, conversation.scrollHeight)
}

export function goToConv(id) {
	let mainBoxBody = document.querySelector(".main_box_body")
	let mainBoxHeader = document.querySelector(".main_box_header")
	cleanMainBox()
	mainBoxBody.classList.add("private_message")
	mainBoxHeader.classList.add("private_message")
	chatSocket.send(JSON.stringify({
		'type': 'get_user',
		'target': id
	}))
}

function getHistoryChat(target, msgId) {
	chatSocket.send(JSON.stringify({
		'type': 'get_history_chat',
		'target': target,
		'msgId': msgId
	}))
}

export function displayPrivMsg(data) {
	let mainBoxHeader = document.querySelector(".main_box_header")
	let mainBoxBody = document.querySelector(".main_box_body")

	initPrvMsgHeader(data)
	initPrvMsgBody(data.identification)

	async function initPrvMsgHeader(data) {
		let isConnected
		if (data.connexion_status === 2) {
			isConnected = 'connected'
		} else {
			isConnected = 'disconnected'
		}
		let profilePicture = await getProfilePicture({ 'type': 'user', 'id': data.identification })
		let ppUrl
		if (profilePicture.type == 'image/null')
			ppUrl = "../static/assets/logo/user.png"
		else
			ppUrl = URL.createObjectURL(profilePicture)
		let html =
			'<div class="contact_wrapper" userID="' + data.identification + '">' +
			'<img src=' + ppUrl + ' alt="contact profile picture">' +
			'<div class="contact_name_wrapper">' +
			'<p>' + data.name + '</p>' +
			'<div class="connection_point ' + isConnected + '"></div>' +
			'</div>' +
			'</div>' +
			'<div class="AddToFriendContainer ' + data.friend + '">' +
			'<img class="FriendShip_BTN" src="../static/assets/logo/AddToFriendIcon.svg" alt="Add to friend">' +
			'</div>' +
			'<img src="../static/assets/logo/arrow-back-regular-60.png" alt="return arrow button">'

		document.querySelector(".main_box_header").innerHTML = html
		mainBoxHeader.children[2].addEventListener("click", () => {
			mainBoxHeader.classList.remove("private_message")
			mainBoxBody.classList.remove("private_message")
			cleanMainBox()
			initChatHomepage()
		})
		const element = mainBoxHeader.children[1].children[0]
		element.addEventListener("click", () => {
			AddToFriend(data.identification, element)
		})
	}

	function initPrvMsgBody(id) {
		let html =
			'<div class="conversation_wrapper">' +
			'<ul class="conversation"></ul>' +
			'</div>' +
			'<div class="sendbox">' +
			'<input type="text" placeholder="Enter your message">' +
			'<img src="../static/assets/logo/send-solid-60.png" alt="send arrow">' +
			'</div>'
		document.querySelector(".main_box_body").innerHTML = html
		let sendbox = document.querySelector(".sendbox")
		let conversation = document.querySelector(".conversation")
		sendbox.children[0].addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				sendMessage(sendbox.children[0].value, id)
				sendbox.children[0].value = ""
			}
		})
		sendbox.children[1].addEventListener("click", () => {
			sendMessage(sendbox.children[0].textContent, id)
			sendbox.children[0].value = ""
		})

		var lastScrollTop = 0
		conversation.addEventListener("scroll", () => {
			let st = conversation.scrollTop

			if (st <= (lastScrollTop * 0.1)) {
				prvMsgOnTopScroll(id)
			}
			lastScrollTop = st
		})
		getHistoryChat(id, -1)
	}
}

export function receiveMsg(data) {
	if (document.querySelector(".contact_wrapper") == null) {
		console.log('NOTFICATIONS')
		console.log(data)
		//document.getElementById('conv_' + data.sender).style.background = 'red'
	}
	else {
		console.log('page contact:', document.querySelector(".contact_wrapper").getAttribute('userID'), 'data sender:', data.sender)
		if (document.querySelector(".contact_wrapper").getAttribute('userID') === data.sender) {
			let conversation = document.querySelector(".conversation")
			let msgItem =
				"<li class='message_item' msgid='" + data.id + "'>" +
				"<p class='message'>" + data.message + "</p>" +
				"<p class='timestamp'>" + data.time + "</p>" +
				"</li>"
			conversation.lastChild.insertAdjacentHTML('afterend', msgItem)
			conversation.scrollTo(0, conversation.scrollHeight)
		}
	}
}

async function prvMsgOnTopScroll(contactId) {
	let lastMsgId = parseInt(document.querySelector(".conversation > li").getAttribute('msgId'))
	getHistoryChat(contactId, lastMsgId)
}

export async function actualizeChatHistory(data) {
	let conversation = document.querySelector(".conversation")
	if (data.length === 0) {
		if (conversation.firstChild.classList[0] !== 'top_point') {
			conversation.prepend(document.createElement("div"))
			conversation.children[0].classList.add("top_point")
		}
	} else {
		let loadingHtml = "<img src ='../static/assets/logo/loader-circle-regular-36.png' class='loading'>"
		conversation.firstChild.insertAdjacentHTML("beforebegin", loadingHtml)
		await sleep(300)

		for (let i = 0; i < data.length; i++) {
			let received

			if (data[i].received === true) {
				received = 'own'
			} else {
				received = ''
			}
			let item =
				'<li class="message_item ' + received + '" msgId="' + data[i].id + '">' +
				'<p class="message">' + data[i].message + '</p>' +
				'<p class="timestamp">' + data[i].time.substring(0, 19) + '"</p>' +
				'</li>'

			conversation.firstChild.insertAdjacentHTML("afterend", item)
		}
		conversation.firstChild.remove()
	}
}

function sendMessage(message, targetUser) {
	console.log('message is', message, 'and tagetUser is', targetUser);

	let conversation = document.querySelector(".conversation")
	let date = new Date()
	let datevalues = [
		date.getFullYear(),
		date.getMonth() + 1,
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds()
	]
	let timestamp = `${datevalues[0]}-${datevalues[1]}-${datevalues[2]} ${datevalues[3]}:${datevalues[4]}:${datevalues[5]}`
	let html =
		'<li class="message_item own">' +
		'<p class="message">' + message + '</p>' +
		'<p class="timestamp">' + timestamp + '</p>' +
		'</li>'
	if (conversation.children.length > 0) {
		conversation.lastChild.insertAdjacentHTML('afterend', html)
	} else {
		conversation.innerHTML = html
	}
	conversation.scrollTo(0, conversation.scrollHeight)
	chatSocket.send(JSON.stringify({
		'type': 'chat_message',
		'message': message,
		'target': targetUser
	}))
}