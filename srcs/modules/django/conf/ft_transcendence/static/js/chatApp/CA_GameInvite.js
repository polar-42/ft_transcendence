import { navto } from "../index.js"
import { chatSocket, closeChatbox, openChatbox, sleep, getProfilePicture } from "./CA_General.js"
import { goToConv } from "./CA_Private.js"
import { initCreateChannel } from './CA_Channels.js'
import { initFriendsPage } from './CA_Friends.js'

export async function initGameInvitiation() {
	Response = await fetch(document.location.origin + '/chatApp/getAllUsers', {
		method: 'GET'
	})
	if (!Response.ok) {
		return
	}

	document.querySelector("button[name='create_channel']").removeEventListener("click", initCreateChannel)
	document.querySelector("button[name='friends']").removeEventListener("click", initFriendsPage)

	let usrListJson = await Response.json()
	let html =
		'<div class="invitation_box">' +
		'<h2>Games Invitation</h2>' +
		'<div class="opponent_selection_box">' +
		'<label for="opponent_selection">Choose your opponent</label>' +
		'<input name="opponent_selection" type="text">' +
		'<ul class="autocomplete-list">' +
		'</ul>' +
		'</div>' +
		'<h3>Choose the game</h3>' +
		'<div class="game_choice_box">' +
		'<div class="input_box">' +
		'<label for="pong">Pong</label>' +
		'<input name="pong" type="checkbox">' +
		'</div>' +
		'<div class="input_box">' +
		'<label for="battleship">Battleship</label>' +
		'<input name="battleship" type="checkbox">' +
		'</div>' +
		'</div>' +
		'<button class="submit_BTN">Submit</button>' +
		'<p class="feedback"></p>' +
		'</div>'

	document.querySelector(".chatbox_homepage_navbar").lastChild.insertAdjacentHTML("afterend", html)
	let invitationButton = document.querySelector("button[name='invitations']")
	let inputBox = document.querySelector(".opponent_selection_box input")
	let pongCheckbox = document.querySelector("input[name='pong']")
	let battleshipCheckbox = document.querySelector("input[name='battleship']")
	battleshipCheckbox.addEventListener("change", () => {
		if (pongCheckbox.checked === true)
			pongCheckbox.checked = false
	})
	pongCheckbox.addEventListener("change", () => {
		if (battleshipCheckbox.checked === true)
			battleshipCheckbox.checked = false
	})
	invitationButton.removeEventListener("click", initGameInvitiation)
	invitationButton.addEventListener("click", closeInvitationBox)
	inputBox.addEventListener("input", onInputChange)
	inputBox.addEventListener("keypress", (e) => {
		if (e.key === 'Enter') {
			sendGameInvitation(usrListJson)
		}
	})
	document.querySelector(".invitation_box .submit_BTN").addEventListener("click", sendGameInvitation.bind(null, usrListJson))

	async function onInputChange() {
		let autocompleteList = document.querySelector(".autocomplete-list")
		let inputBox = document.querySelector(".opponent_selection_box input")
		let input = inputBox.value.toLowerCase()
		let filterUsers = []

		autocompleteList.innerHTML = ''
		usrListJson.forEach((usr) => {
			if (usr.name.substr(0, input.length).toLowerCase() === input)
				filterUsers.push(usr)
		})
		if (input == '') {
			return
		}
		for (let i = 0; i < filterUsers.length; i++) {

			let profilePicture = await getProfilePicture(filterUsers[i])
			let ppUrl
			if (profilePicture.type == 'image/null')
				ppUrl = "/static/assets/logo/user.png"
			else
				ppUrl = URL.createObjectURL(profilePicture)

			let item = document.createElement("li")
			item.setAttribute('class', 'game_invite_opponent')

			item.appendChild(document.createElement('img'))
			item.children[0].setAttribute("id", 'image_auto_complete')
			item.children[0].setAttribute('src', ppUrl)

			item.appendChild(document.createElement('button'))
			item.children[1].textContent = filterUsers[i].name
			item.children[1].setAttribute("id", filterUsers[i].id)

			item.addEventListener("click", onButtonClick)
			autocompleteList.appendChild(item)
		}
	}

	function onButtonClick(e) {
		e.preventDefault()

		const btn = e.target
		let inputBox = document.querySelector(".opponent_selection_box input")
		inputBox.value = btn.innerHTML
		document.querySelector(".autocomplete-list").innerHTML = ''
	}

	function closeInvitationBox() {
		// console.log('dsadsa')
		document.querySelector(".invitation_box").remove()
		invitationButton.addEventListener("click", initGameInvitiation)
		invitationButton.removeEventListener("click", closeInvitationBox)

		document.querySelector("button[name='create_channel']").addEventListener("click", initCreateChannel)
		document.querySelector("button[name='friends']").addEventListener("click", initFriendsPage)
	}
}

function sendGameInvitation(usrList) {
	let userName = document.querySelector("input[name='opponent_selection']").value
	let checkboxes = document.querySelectorAll(".game_choice_box input")
	let feedback = document.querySelector(".invitation_box .feedback")
	feedback.innerHTML = ''

	if (userName.value === '') {
		feedback.innerHTML = "No user selected"
		return
	}
	let user = usrList.find((usr) => usr.name === userName)
	if (checkboxes[0].checked === false && checkboxes[1].checked === false) {
		feedback.innerHTML = "No game selected"
		return
	} else if (checkboxes[0].checked === true) {
		chatSocket.send(JSON.stringify({
			'type': 'invite_pong',
			'target': user.id
		}))
	} else {
		chatSocket.send(JSON.stringify({
			'type': 'invite_battleship',
			'target': user.id
		}))
	}
	goToConv(user.id)
}

export async function receivePongInvitation(data) {
	if (document.querySelector(".main_box_header .contact_wrapper") == undefined || data.sender_id !== parseInt(document.querySelector(".main_box_header .contact_wrapper").getAttribute("userid")))
	{
		openChatbox()
		console.log(data)
		goToConv(data.sender_id)
		await sleep(100)
	}
	if (document.querySelector(".game_invitation") != undefined)
	{
		return
	}
	let conversation = document.querySelector(".conversation")
	let item = document.createElement("li")
	item.classList.add("message_item", "game_invitation")
	item.innerHTML =
		'<p>' + data.sender + ' invite you to a Pong game</p>' +
		'<div class="acceptation_wrapper">' +
		'<button class="accept_btn">Accept</button>' +
		'<button class="refuse_btn">Refuse</button>' +
		'</div>'

	item.querySelector(".accept_btn").addEventListener("click", acceptPongInvitation.bind(null, data.sender, data.sender_id))
	item.querySelector(".refuse_btn").addEventListener("click", refusePongInvitation.bind(null, data.sender, data.sender_id))
	conversation.appendChild(item)
}

function acceptPongInvitation(senderName, senderId) {
	let inviteElm = document.querySelector(".game_invitation")

	inviteElm.lastChild.remove()
	inviteElm.appendChild(document.createElement("p"))
	inviteElm.lastChild.textContent = 'You accepted ' + senderName + ' invitation'
	chatSocket.send(JSON.stringify({
		'type': 'accept_invitation_pong',
		'target': senderId
	}))
}

async function refusePongInvitation(senderName, senderId) {
	let inviteElm = document.querySelector(".game_invitation")
	let userData
	let Response = await fetch(document.location.origin + '/authApp/GET/userID',
		{
			method: 'GET'
		})
	if (Response.ok) {
		userData = await Response.json()
	}
	else
		throw new Error('Error when fetching user datas')
	inviteElm.lastChild.remove()
	inviteElm.appendChild(document.createElement("p"))
	inviteElm.lastChild.textContent = 'You refused ' + senderName + ' invitation'
	chatSocket.send(JSON.stringify({
		'type': 'refuse_invitation',
		'target': senderId,
		'sender': userData.userID
	}))
}

export async function receiveBattleshipInvitation(data) {
	if (document.querySelector(".main_box_header .contact_wrapper") == undefined || data.sender_id !== parseInt(document.querySelector(".main_box_header .contact_wrapper").getAttribute("userid")))
	{
		openChatbox()
		console.log(data)
		goToConv(data.sender_id)
		await sleep(100)
	}
	if (document.querySelector(".game_invitation") != undefined)
	{
		return
	}

	let conversation = document.querySelector(".conversation")
	let item = document.createElement("li")
	item.classList.add("message_item", "game_invitation")
	item.innerHTML =
		'<p>' + data.sender + ' invite you to a Battleship game</p>' +
		'<div class="acceptation_wrapper">' +
		'<button class="accept_btn">Accept</button>' +
		'<button class="refuse_btn">Refuse</button>' +
		'</div>'

	item.querySelector(".accept_btn").addEventListener("click", acceptBattleshipInvitation.bind(null, data.sender, data.sender_id))
	item.querySelector(".refuse_btn").addEventListener("click", refuseBattleshipInvitation.bind(null, data.sender, data.sender_id))
	conversation.appendChild(item)
}

function acceptBattleshipInvitation(senderName, senderId) {
	let inviteElm = document.querySelector(".game_invitation")

	inviteElm.lastChild.remove()
	inviteElm.appendChild(document.createElement("p"))
	inviteElm.lastChild.textContent = 'You accepted ' + senderName + ' invitation'
	chatSocket.send(JSON.stringify({
		'type': 'accept_invitation_battleship',
		'target': senderId
	}))
}

async function refuseBattleshipInvitation(senderName, senderId) {
	let inviteElm = document.querySelector(".game_invitation")
	let userData
	let Response = await fetch(document.location.origin + '/authApp/GET/userID',
		{
			method: 'GET'
		})
	if (Response.ok) {
		userData = await Response.json()
	}
	else
		throw new Error('Error when fetching user datas')
	inviteElm.lastChild.remove()
	inviteElm.appendChild(document.createElement("p"))
	inviteElm.lastChild.textContent = 'You refused ' + senderName + ' invitation'
	chatSocket.send(JSON.stringify({
		'type': 'refuse_invitation',
		'target': senderId,
		'sender': userData.userID
	}))
}

export function receiveRefusedInvitation(data) {
	if (parseInt(document.querySelector(".private_message .contact_wrapper").getAttribute("userid")) !== data.sender_id)
		return

	let item = document.createElement("li")
	item.classList.add("message_item", "game_invitation")
	item.innerHTML =
		'<p>' + data.sender + ' refused your invitation</p>'
	item.firstChild.style.fontStyle = "italic"
	// console.log(item)
	document.querySelector(".conversation").appendChild(item)
}

export function showTMatchRequest(tId)
{
	openChatbox()
	let conversation = document.querySelector(".conversation_list")
	conversation.querySelectorAll('.TournamentInvit').forEach(element => {
		element.parentElement.removeChild(element)
	})
	let item = document.createElement("li")
	item.classList.add('TournamentInvit')
	item.innerHTML =
		'<p>Your next tournament match is ready</p>' +
		'<div>' +
		'<button class="BTN_GoToTournament">Go to tournament</button>' +
		'</div>'
	item.querySelector('.BTN_GoToTournament').addEventListener("click", event => {
		item.parentElement.removeChild(item)
		closeChatbox()
		navto('/tournaments/Play/?id=' + tId)
	})
	conversation.insertBefore(item, conversation.firstChild)
}
