import { initChatHomepage, getProfilePicture, cleanMainBox, sleep, chatSocket } from "./CA_General.js"
import { navto } from "../index.js"

export function clickJoinChan(event) {
	let item = event.target.parentElement
	let channelName = item.querySelector(".conversation_name p").textContent
	let privacyStatus = item.getAttribute("privacyStatus")

	if (privacyStatus === '0') {
		joinChannel(channelName, false, '')
		return
	}
	let previousHtml = item.innerHTML
	let html =
		'<div class="join_channel_box">' +
		'<div class="join_pwd_wrapper">' +
		'<label for="channel_password">Enter Channel Password</label>' +
		'<div class="join_input_wrapper">' +
		'<input name="channel_password" type="password" placeholder="Enter channel password">' +
		'<img src="/static/assets/logo/send-solid-60.png" name="send arrow">' +
		'</div>' +
		'<p class="feedback"></p>' +
		'</div>' +
		'<img src="/static/assets/logo/arrow-back-regular-60.png" name="back arrow">' +
		'</div>'

	item.innerHTML = html
	item.querySelector("input").addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			joinChannel(channelName, true, item.querySelector("input").value)
		}
	})
	item.querySelector("img[name='send arrow']").addEventListener("click", () => {
		joinChannel(channelName, true, item.querySelector("input").value)
	})
	item.querySelector("img[name='back arrow']").addEventListener("click", () => {
		item.innerHTML = previousHtml
		item.querySelector(".join_btn").addEventListener("click", clickJoinChan)
	})
}

export function displayChannel(data) {
	initChanHeader(data)
	initChanBody(data)

	async function initChanHeader(data) {
		let general
		if (data.name === 'General')
			general = 'general'
		else
			general = ''
		let profilePicture = await getProfilePicture({ 'type': 'channel', 'name': data.name })
		let ppUrl
		if (profilePicture.type === 'image/null')
			ppUrl = "/static/assets/logo/user.png"
		else
			ppUrl = URL.createObjectURL(profilePicture)
		let html =
			'<div class="contact_wrapper ' + general + ' ">' +
			'<img src=' + ppUrl + ' alt="channel picture">' +
			'<div class="contact_name_wrapper">' +
			'<p class="channel_name">' + data.name + '</p>' +
			'<div class="description_wrapper">' +
			'<p class="channel_description">' + data.description + '</p>' +
			'<img class="edit_description" src="/static/assets/logo/edit-regular-36.png" alt="leave channel button">' +
			'</div>' +
			'</div>' +
			'<img class="leave_channel" src="/static/assets/logo/red_cross.png" alt="leave channel button">' +
			'</div>' +
			'<img src="/static/assets/logo/arrow-back-regular-60.png" alt="return arrow button">'


		document.querySelector(".main_box_header").innerHTML = html
		document.querySelector(".main_box_header").children[1].addEventListener("click", () => {
			document.querySelector(".main_box_header").classList.remove("channel")
			document.querySelector(".main_box_body").classList.remove("channel")
			cleanMainBox()
			initChatHomepage()
		})
		document.querySelector(".leave_channel").addEventListener("click", () => {
			leaveChannel(data.name)
		})
		document.querySelector(".edit_description").addEventListener("click", initEditDescription)
		if (data.admin === false)
			document.querySelector(".edit_description").style.display = 'none'

		function initEditDescription() {
			let box =
				'<div class="edit_description_box">' +
				'<div class="edit_main_wrapper">' +
				'<label for="description">New description</label>' +
				'<div class="input_wrapper">' +
				'<input name="description" type="text" placeholder="Enter new description">' +
				'<img src="/static/assets/logo/send-solid-60.png" alt="send arrow">' +
				'</div>' +
				'</div>' +
				'<img class="back_arrow" src="/static/assets/logo/arrow-back-regular-60.png" alt="return arrow button">'
			'</div>'
			document.querySelector(".main_box_header.channel").insertAdjacentHTML("afterend", box)
			document.querySelector(".back_arrow").addEventListener("click", () => {
				document.querySelector(".edit_description_box").remove()
			})

			document.querySelector(".edit_description_box .input_wrapper input").addEventListener("keypress", (e) => {
				if (e.key === "Enter")
					editChanDescription()
			})
			document.querySelector(".edit_description_box .input_wrapper img").addEventListener("click", editChanDescription())
			document.querySelector(".edit_description_box .input_wrapper input").focus()
		}

		function editChanDescription() {
			let description = document.querySelector(".edit_description_box .input_wrapper input").value
			if (description === '')
				return
			let channelName = document.querySelector(".main_box_header.channel .channel_name").textContent

			chatSocket.send(JSON.stringify({
				'type': 'edit_description',
				'channel_name': channelName,
				'description': description
			})
			)
		}
	}



	function initChanBody(data) {
		let html =
			'<div class="conversation_body">' +
			'<div class="sidebar"></div>' +
			'<div class="conversation"></div>' +
			'</div>' +
			'<div class="sendbox">' +
			'<input type="text" placeholder="Enter your message">' +
			'<img src="/static/assets/logo/send-solid-60.png" alt="send arrow">' +
			'</div>'

		document.querySelector(".main_box_body").innerHTML = html
		let conversation = document.querySelector(".conversation")
		let sendbox = document.querySelector(".sendbox")
		sendbox.children[0].addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				channelMessage(sendbox.children[0].value, data.name)
				sendbox.children[0].value = ""
			}
		})
		sendbox.children[1].addEventListener("click", () => {
			channelMessage(sendbox.children[0].value, data.name)
			sendbox.children[0].value = ""
		})

		var lastScrollTop = 0
		conversation.addEventListener("scroll", () => {
			let st = conversation.scrollTop

			if (st <= (lastScrollTop * 0.1)) {
				chanOnTopScroll(data.name)
			}
			lastScrollTop = st
		})


		loadChanUser(data)

		chatSocket.send(JSON.stringify({
			'type': 'get_history_channel',
			'target': data.name,
			'msgId': -1
		}))

		async function loadChanUser(data) {
			let users = data['users']
			let sidebar = document.querySelector(".sidebar")
			for (let i = 0; i < users.length; i++) {
				let isConnected
				if (users[i].connexion_status === 2) {
					isConnected = 'connected'
				} else if (users[i].connexion_status === 0) {
					isConnected = 'disconnected'
				} else {
					isConnected = ''
				}
				let profilePicture = await getProfilePicture({ 'type': 'user', 'id': users[i].id })
				let ppUrl
				if (profilePicture.type == 'image/null')
					ppUrl = "/static/assets/logo/user.png"
				else
					ppUrl = URL.createObjectURL(profilePicture)
				if (users[i] !== self.username) {
					let item =
						'<div class="user_wrapper">' +
						'<div class="connection_point ' + isConnected + '"></div>' +
						'<img src=' + ppUrl + ' alt="channel member profile picture" id="profile_id_' + users[i].id + '">' +
						'<p class="username">' + users[i].name + '</p>' +
						'<img class="kick_cross" src="/static/assets/logo/red_cross.png" alt="kick user button">' +
						'</div>'

					if (sidebar.children.length > 0) {
						sidebar.lastChild.insertAdjacentHTML("afterend", item)
					} else {
						sidebar.innerHTML = item
					}
					let kick = sidebar.lastChild.querySelector(".kick_cross")
					if (data.admin === false)
						kick.style.display = 'none'
					else
						kick.addEventListener("click", () => {
							kickUser(data.name, users[i].id)
						})
					document.getElementById('profile_id_' + users[i].id).addEventListener("click", () => {
						navto("/profile/?id=" + users[i].id)
					  })
				}
			}
		}
	}
}

export async function displayChannelHistory(data, isStillUnreadMessage) {
	let conversation = document.querySelector(".conversation")
	let Response = await fetch(document.location.origin + '/authApp/GET/userID',
		{
			method: 'GET'
		})
	if (!Response.ok) {
		throw new Error('Error when fetching user datas')
	}
	let userData = await Response.json()
	let html = ''
	for (let i = data.length - 1; i >= 0; i--) {
		let sender
		let received
		if (data[i].senderID === userData.userID) {
			received = "own"
			sender = ''
		} else {
			received = ""
			sender = data[i].sender
		}
		let profilePicture = await getProfilePicture({ 'type': 'user', 'id': data[i].senderID })
		let ppUrl
		if (profilePicture.type == 'image/null')
			ppUrl = "/static/assets/logo/user.png"
		else
			ppUrl = URL.createObjectURL(profilePicture)

		let item =
			'<li class="message_item ' + received + '" msgId="' + data[i].id + '">' +
			'<div class="sender">' +
			'<img src=' + ppUrl + ' alt="sender profile picture" class="profile_id_chan_' + data[i].senderID + '">' +
			'<p>' + sender + '</p>' +
			'</div>' +
			'<div class="message_wrapper">' +
			'<p class="message">' + data[i].message + '</p>' +
			'<p class="timestamp">' + data[i].time.substring(0, 19) + '</p>' +
			'</div>' +
			'</li>'

		html += item
	}
	conversation.innerHTML = html
	conversation.scrollTo(0, conversation.scrollHeight)
	let tabIdentification = [];

	for (let i = data.length - 1; i >= 0; i--) {
		if (tabIdentification.includes(data[i].senderID) == false)
			document.querySelectorAll('.profile_id_chan_' + data[i].senderID).forEach((div) => {
				div.addEventListener("click", () => {
					navto("/profile/?id=" + data[i].senderID)
				})
			})
		tabIdentification.push(data[i].senderID)
	}
	console.log(isStillUnreadMessage)
	if (isStillUnreadMessage == true) {
		document.getElementById('pop_up_unread_chatbox').style.display = 'block'
	} else {
		document.getElementById('pop_up_unread_chatbox').style.display = 'none'
	}
}

export function goToChan(name) {
	let mainBoxBody = document.querySelector(".main_box_body")
	let mainBoxHeader = document.querySelector(".main_box_header")
	cleanMainBox()
	mainBoxBody.classList.add("channel")
	mainBoxHeader.classList.add("channel")
	chatSocket.send(JSON.stringify({
		'type': 'get_channel',
		'target': name,
		'msgId': -1
	}))
}

function channelMessage(message, targetChannel) {
	if (message.length <= 0)
		return
	chatSocket.send(JSON.stringify({
		'type': 'channel_message',
		'target': targetChannel,
		'message': message
	}))
}

function joinChannel(channelName, privacyStatus, password) {
	console.log('channelName:', channelName, ' privacyStatus:', privacyStatus, ' password:', password)
	if (privacyStatus === false) {
		chatSocket.send(JSON.stringify({
			'type': 'channel_join',
			'target': channelName,
			'privacy_status': privacyStatus
		}))
	} else {
		chatSocket.send(JSON.stringify({
			'type': 'channel_join',
			'target': channelName,
			'privacy_status': privacyStatus,
			'password': password
		}))
	}
}

function leaveChannel(channelName) {
	chatSocket.send(JSON.stringify({
		'type': 'channel_leave',
		'target': channelName
	}))
	initChatHomepage()
}

function getHistoryChannel(channelName, msgId) {
	chatSocket.send(JSON.stringify({
		'type': 'get_history_channel',
		'target': channelName,
		'msgId': msgId
	}))
}

export async function receiveChanMsg(data) {
	let conversation = document.querySelector(".conversation")

	if (conversation == undefined || conversation.parentElement == undefined || conversation.parentElement.parentElement == undefined) {
		let divConv = document.getElementById('conv_' + data.channel)
		divConv.querySelector('.pop_up_unread').style.display = 'block'
		divConv.querySelector('.conversation_text').querySelector('.last_msg').innerHTML = data.sender + ': ' + data.message
		document.getElementById('pop_up_unread_chatbox').style.display = 'block'
		return
	}

	if (conversation.parentElement.parentElement.classList[1] == 'private_message') {
		document.getElementById('pop_up_unread_chatbox').style.display = 'block'
		return
	}

	let Response = await fetch(document.location.origin + '/authApp/GET/userID',
		{
			method: 'GET'
		})
	if (!Response.ok) {
		throw new Error('Error when fetching user datas')
	}
	let userData = await Response.json()
	let sender, received
	if (data.senderID === userData.userID) {
		received = "own"
		sender = ''
	} else {
		received = ""
		sender = data.sender
	}
	let profilePicture = await getProfilePicture({ 'type': 'user', 'id': data.senderID })
	let ppUrl
	if (profilePicture.type == 'image/null')
		ppUrl = "/static/assets/logo/user.png"
	else
		ppUrl = URL.createObjectURL(profilePicture)

	let item =
		'<li class="message_item ' + received + '" msgid="' + '">' +
		'<div class="sender">' +
		'<img src="' + ppUrl + '" alt="sender profile picture" id="new_message_from_' + data.senderID + '">' +
		'<p>' + sender + '<p>' +
		'</div>' +
		'<div class="messGage_wrapper">' +
		'<p class="message">' + data.message + '</p>' +
		'<p class="timestamp">' + data.time.substring(0, 19) + '</p>' +
		'</div>' +
		'</li>'
	if (conversation != undefined)
	{
	  if (conversation.children.length > 0) {
		conversation.lastChild.insertAdjacentHTML("afterend", item)
	  } else {
		conversation.innerHTML = item
	  }
	  conversation.scrollTo(0, conversation.scrollHeight)

	  document.getElementById('new_message_from_' + data.senderID).addEventListener('click', () => {
		navto("/profile/?id=" + data.senderID)
	  })

	  console.log(data)
	  chatSocket.send(JSON.stringify({
		'type': 'msg_read',
		'sender': data.senderID,
		'receiver': data.channel
	  }))
	}
}

async function chanOnTopScroll(channelName) {
	let lastMsgId = parseInt(document.querySelector(".conversation > li").getAttribute('msgId'))
	getHistoryChannel(channelName, lastMsgId)
}

export async function actualizeChannelHistory(data) {
	let conversation = document.querySelector(".conversation")
	if (data.length === 0) {
		if (conversation.firstChild.classList[0] !== 'top_point') {
			conversation.prepend(document.createElement("div"))
			conversation.children[0].classList.add("top_point")
		}
	} else {
		let loadingHtml = "<img src='/static/assets/logo/loader-circle-regular-36.png' class='loading'>"
		conversation.firstChild.insertAdjacentHTML("beforebegin", loadingHtml)
		await sleep(300)
		let html = ''
		for (let i = data.length - 1; i >= 0; i--) {
			let Response = await fetch(document.location.origin + '/authApp/GET/userID',
				{
					method: 'GET'
				})
			if (!Response.ok) {
				throw new Error('Error when fetching user datas')
			}
			let userData = await Response.json()
			let received
			let sender

			let profilePicture = await getProfilePicture({ 'type': 'user', 'id': data[i].senderID })
			let ppUrl
			if (profilePicture.type == 'image/null')
				ppUrl = "/static/assets/logo/user.png"
			else
				ppUrl = URL.createObjectURL(profilePicture)

			if (data[i].senderID !== userData.userID) {
				received = 'own'
				sender = ''
			} else {
				received = ''
				sender = data[i].sender
			}
			let item =
				'<li class="message_item ' + received + '" msgid="' + data[i].id + '">' +
				'<div class="sender">' +
				'<img src="' + ppUrl +'" alt="sender profile picture">' +
				'<p>' + sender + '<p>' +
				'</div>' +
				'<div class="messGage_wrapper">' +
				'<p class="message">' + data[i].message + '</p>' +
				'<p class="timestamp">' + data[i].time.substring(0, 19) + '</p>' +
				'</div>' +
				'</li>'
			html += item
		}
		conversation.firstChild.insertAdjacentHTML("afterend", html)
		conversation.firstChild.remove()
	}
}

export function initCreateChannel() {
	let navbar = document.querySelector(".chatbox_homepage_navbar")
	let navbarBTN = document.querySelector("button[name='create_channel']")

	let html =
		'<div class="channel_creation_box">' +
		'<h2>Create a new channel</h2>' +
		'<div class="channel_name_wrapper">' +
		'<p>Channel name:</p>' +
		'<input type="text" name="channel_name" placeholder="Enter channel name" required>' +
		'</div>' +
		'<div class="channel_description_wrapper">' +
		'<p>Channel description:</p>' +
		'<input type="text" name="channel_description" placeholder="Enter channel description" required>' +
		'</div>' +
		'<div class="privacy_setting">' +
		'<p class="privacy_label">Privacy settings</p>' +
		'<div class="privacy_checkbox_wrapper">' +
		'<div class="checkbox_wrapper">' +
		'<input type="checkbox" name="Public"/>' +
		'<label for="Public">Public</label>' +
		'</div>' +
		'<div class="checkbox_wrapper">' +
		'<input type="checkbox" name="Private"/>' +
		'<label for="Private">Private</label>' +
		'</div>' +
		'</div>' +
		'<div class="channel_password_wrapper">' +
		'<label for="password">Channel password</label>' +
		'<input name="password" type="password" placeholder="Enter channel password" disabled="" required>' +
		'<label for="confirm_password">Confirm channel password</label>' +
		'<input name="confirm_password" type="password" placeholder="Confirm channel password" disabled="" required>' +
		'</div>' +
		'</div>' +
		'<div class="submit_wrapper">' +
		'<button class="creation_BTN">Create</button>' +
		'<p class="feedback"></p>' +
		'</div>'

	navbar.insertAdjacentHTML("afterend", html)
	navbarBTN.removeEventListener("click", initCreateChannel)
	navbarBTN.addEventListener("click", closeChannelCreationBox)
	document.querySelector(".channel_creation_box button").addEventListener("click", createChannel)
	document.querySelectorAll(".channel_creation_box input").forEach((inputBox) => {
		inputBox.addEventListener("keypress", (e) => {
			if (e.key === "Enter")
				createChannel()
		})
	})
	let publicCheckbox = document.querySelector("input[name='Public']")
	let privateCheckbox = document.querySelector("input[name='Private']")
	publicCheckbox.addEventListener("change", () => {
		if (privateCheckbox.checked === true)
			privateCheckbox.checked = false
		document.querySelectorAll(".channel_password_wrapper input").forEach((input) => {
			if (input.hasAttribute("disabled") === false)
				input.setAttribute("disabled", "")
		})
	})
	privateCheckbox.addEventListener("change", () => {
		if (publicCheckbox.checked === true)
			publicCheckbox.checked = false
		if (privateCheckbox.checked === true) {
			document.querySelectorAll(".channel_password_wrapper input").forEach((checkbox) => {
				checkbox.removeAttribute("disabled")
			})
		} else {
			document.querySelectorAll(".channel_password_wrapper input").forEach((checkbox) => {
				checkbox.setAttribute("disabled", "")
				checkbox.value = ""
			})
		}
	})

	document.querySelector(".channel_creation_box input").focus()

	function closeChannelCreationBox() {
		document.querySelector(".channel_creation_box").remove()
		let navbarBTN = document.querySelector("button[name='create_channel']")
		navbarBTN.removeEventListener("click", closeChannelCreationBox)
		navbarBTN.addEventListener("click", initCreateChannel)
	}
}

async function createChannel() {
	let channelName = document.querySelector(".channel_creation_box input[name='channel_name']").value
	let channelDescription = document.querySelector(".channel_creation_box input[name='channel_description']").value
	let checkboxes = document.querySelectorAll(".privacy_setting input[type='checkbox']")
	if (checkboxes[0].checked === false && checkboxes[1].checked === false) {
		document.querySelector(".feedback").textContent = "No privacy setting selected"
		return
	}
	if (checkChannelPassword() === false) {
		document.querySelector(".feedback").textContent = "Passwords do not match"
		return
	}
	let pwd = document.querySelector(".channel_password_wrapper input[name='password']").value

	let Response = await fetch(document.location.origin + '/authApp/GET/userID',
		{
			method: 'GET'
		})
	if (!Response.ok) {
		throw new Error('Error when fetching user datas')
	}
	let adminData = await Response.json()
	let privacyStatus
	if (checkboxes[0].checked === true)
		privacyStatus = 0
	else
		privacyStatus = 1
	if (channelName.length === 0 || channelDescription.length === 0) {
		let html = '<p class="feedback">Empty field</p>'
		document.querySelector(".channel_creation_box button").insertAdjacentHTML("afterend", html)
		return
	}

	console.log(pwd)
	chatSocket.send(JSON.stringify({
		'type': 'create_channel',
		'channel_name': channelName,
		'channel_description': channelDescription,
		'privacy_status': privacyStatus,
		'password': pwd,
		'adminId': adminData.userID
	}))

	function checkChannelPassword() {
		let pwd = document.querySelector(".channel_password_wrapper input[name='password']").value
		let confirmPwd = document.querySelector(".channel_password_wrapper input[name='confirm_password']").value

		if (pwd === confirmPwd)
			return true
		else
			return false
	}
}

export function receiveChanCreation(data) {
	if (data.state === 'failed') {
		document.querySelector(".feedback").textContent = data.reason
		return
	}
	cleanMainBox()
	goToChan(data.channel_name)
}

export function receiveJoinChanResponse(data) {
	if (data.state === 'success')
		goToChan(data.channel_name)
	else {
		document.querySelector(".join_channel_box .feedback").textContent = data.reason
	}
}

export function receiveDescriptionEdit(data) {
	if (data['state'] === 'failed')
		return
	document.querySelector(".edit_description_box").remove()
	goToChan(data['channel_name'])
}

function kickUser(channelName, username) {
	chatSocket.send(JSON.stringify({
		'type': 'kick_user',
		'channel': channelName,
		'user': username
	}))
	goToChan(channelName)
}
