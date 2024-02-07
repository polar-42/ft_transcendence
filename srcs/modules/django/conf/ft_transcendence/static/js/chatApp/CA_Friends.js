import { chatSocket } from './CA_General.js'

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
	mainBoxBody.children[1].innerHTML = ''
	mainBoxBody.children[0].innerHTML = 'Friends'
	mainBoxHeader.style.display = 'none'
}