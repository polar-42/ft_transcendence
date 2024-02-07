import { chatSocket, cleanMainBox, initChatHomepage } from './CA_General.js'

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
}