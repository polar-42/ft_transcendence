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