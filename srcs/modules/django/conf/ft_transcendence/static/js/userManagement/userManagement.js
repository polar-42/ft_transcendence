import { navto } from "../index.js"
import { initChat  } from "../chatApp/CA_General.js";
import { initProfileButton } from "../authApp.js";
import { unsetChatbox } from "../chatApp/CA_General.js";

export function initUpdateAccount() {
	avatarButtonFunction() //TO CHANGE

	let submitBtn = document.getElementsByClassName("submit_BTN")[0];
	submitBtn.addEventListener("click", updateAccount)
	let inputArray = document.querySelectorAll("input");
	inputArray.forEach((input) => {
		input.addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				submitBtn.click();
			}
		})
	})
	inputArray[1].focus()
	fetch(window.location.origin + "/authApp/GET/2FaStatus")
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.json()
		})
		.then(data => {
			if (data.error != undefined)
				throw new Error(data.error)
			if (data.status == true)
				document.querySelector('input[type="checkbox"]').checked = true
		})
		.catch(error => {
			console.error('Error:', error)
			feedback.innerHTML = data.message
		})
	let checkbox = document.querySelector('input[type="checkbox"]')
	checkbox.addEventListener('change', function () {
		Handle2FaToggle(checkbox)
	})
}

function Handle2FaToggle(checkbox) {
	const TFARequestType = 1 ? checkbox.checked == true : 2
	fetch(window.location.origin + "/authApp/TFA/ShowPopUp")
	.then(Response => {
		if (!Response.ok) {
			throw new Error('Network response was not okay')
		}
		return Response.text()
	})
	.then(texted => {
		if (document.querySelector('.TFA_PopUp_Container') != undefined)
		{
			document.querySelector('.TFA_PopUp_Container').remove()
		}
		document.querySelector("#app").lastElementChild.insertAdjacentHTML("afterend", texted)
		const doc = document.querySelector("#app").lastElementChild
		return doc
	})
	.then(doc => {
		Effective2Fa(doc, TFARequestType)
	})
	.catch(error => {
		console.log(error)
	})
}

function ClosePopUp()
{
	document.querySelector(".TFA_PopUp_Container").remove()
	fetch(window.location.origin + "/authApp/TFA/Disable")
	document.querySelector('input[type="checkbox"]').checked = false
}

function Effective2Fa(doc, TFARequestType) {
	let content = doc.querySelector('.TFA_Content')
	fetch(window.location.origin + "/authApp/TFA/ConfirmPass")
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.text()
		})
		.then(texted => {
			content.innerHTML = texted
			content.querySelector('.submit_BTN').addEventListener('click', () => {
				VerifyPass(content, TFARequestType)
			})
			content.querySelector('.cancel_BTN').addEventListener('click', () => {
				ClosePopUp()
			})
		})
		.catch(error => {
			console.error(error)
		})
}

function VerifyPass(content, TFARequestType) {

	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	var header = new Headers()
	header.append('Content-Type', 'application/json')
	header.append('X-CSRFToken', crsf_token)
	const data = { password: content.querySelector('#Input_pwd').value }
	content.querySelector('#messageError').text = ""
	fetch(document.location.origin + "/authApp/TFA/CheckPass",
		{
			method: 'POST',
			headers: header,
			body: JSON.stringify(data)
		})
		.then(Response => {
			if (!Response.ok)
			{
				throw new Error('Network response was not okay')
			}
			return Response.json()
		})
		.then (data => {
			if (data.error != undefined)
			{
				content.querySelector('#messageError').textContent = "Invalid password"
				content.querySelector('#Input_pwd').style.background =  "#fa6969"
			}
			else
			{
				if (TFARequestType == 1)
					Select2FA(content)
				else
					Disable2FARequest(content)
			}
		})
		.catch(error => {
			console.error(error)
		})
}

var selected = undefined

function Disable2FARequest(content, text)
{
	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	var header = new Headers()
	header.append('Content-Type', 'application/json')
	header.append('X-CSRFToken', crsf_token)
	content.querySelector('#messageError').text = ""
	fetch(document.location.origin + "/authApp/TFA/Disable",
		{
			method: 'GET',
			headers: header,
		})
		.then(Response => {
			if (!Response.ok)
			{
				throw new Error('Network response was not okay')
			}
			if (document.querySelector('.TFA_PopUp_Container') != undefined)
			{
				document.querySelector('.TFA_PopUp_Container').remove()
			}
		})
		.catch(error => {
			console.error(error)
		})
}

function Select2FA(content)
{
	content.querySelector('.submit_BTN').removeEventListener('click', VerifyPass)
	fetch(window.location.origin + "/authApp/TFA/ChooseType")
	.then(Response => {
		if (!Response.ok) {
			throw new Error('Network response was not okay')
		}
		return Response.text()
	})
	.then(texted => {
		content.innerHTML = texted
		selected = undefined
		const list = content.querySelectorAll(".selector_button")
		list.forEach(Element =>{
			Element.addEventListener("click", () => {
				SelectorButtonBehavior(list, Element, content)
			})
		})
		content.querySelector('.submit_BTN').addEventListener('click', () => {
			ChooseAuth(content)
		})
		content.querySelector('.cancel_BTN').addEventListener('click', () => {
			ClosePopUp()
		})
	})
	.catch(error => {
		console.error(error)
	})
}

function SelectorButtonBehavior(list, self, content)
{
	if (self.classList.contains("selected_BTN") == false)
	{
		selected = self.id
		self.classList.add("selected_BTN")
		list.forEach(Element => {
			if (Element != self && Element.classList.contains("selected_BTN") == true)
			{
				Element.classList.remove("selected_BTN")
			}
		})
	}
	if (selected != undefined)
		content.querySelector('.submit_BTN').removeAttribute("disabled")
	else
		content.querySelector('.submit_BTN').addAttribute("disabled")
}

function ChooseAuth(content)
{
	if (selected == undefined)
		return
	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	var header = new Headers()
	header.append('Content-Type', 'application/json')
	header.append('X-CSRFToken', crsf_token)
	const data = { selectedAuth: selected }
	fetch(document.location.origin + "/authApp/TFA/Selected",
	{
		method: 'POST',
		headers: header,
		body: JSON.stringify(data)
	})
	.then(Response => {
		if (!Response.ok)
		{
			throw new Error('Network response was not okay')
		}
		return Response.text()
	})
	.then(data => {
		content.innerHTML = data
		if (selected == 0)
		{
			QrAuth(content)
		}
	})
}

function QrAuth(content)
{
	document.querySelector(".TFA_PopUp_Container .TFA_PopUp").classList.add("TFA_qrContent")
	fetch(window.location.origin + "/authApp/TFA/RequestQR")
	.then(Response => {
		if (!Response.ok) {
			throw new Error('Network response was not okay')
		}
		return Response.json()
	})
	.then(data => {
		content.querySelector(".qrDisplayer").src = data.qr
		content.querySelector(".submit_BTN").addEventListener("click", () => {
			SendQrAnswer(content, content.querySelector("#Input_code"))
		})
		content.querySelector('.cancel_BTN').addEventListener('click', () => {
			ClosePopUp()
		})
	})
}

function SendQrAnswer(content, codeInput)
{
	if (selected == undefined)
		return
	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	var header = new Headers()
	header.append('Content-Type', 'application/json')
	header.append('X-CSRFToken', crsf_token)
	const data = { TFACode : codeInput.value }
	fetch(document.location.origin + "/authApp/TFA/SendCode",
	{
		method: 'POST',
		headers: header,
		body: JSON.stringify(data)
	})
	.then(Response => {
		if (!Response.ok)
		{
			throw new Error('Network response was not okay')
		}
		return Response.json()
	})
	.then(data => {
		if (data.error != undefined)
			throw new Error(data.error)
		content.querySelector('#messageError').textContent = data.success

		initProfileButton(false)
		initChat()
		navto('/')
	})
	.catch(error => {
		content.querySelector('#messageError').textContent = error
	})
}

let imgFile = undefined

function avatarButtonFunction() {
	const input = document.getElementById("newAvatar");
	input.addEventListener("change", function () {

		const file = input.files[0]

		if (file) {
			const reader = new FileReader()

			reader.onload = function (e) {
				const img = new Image()
				img.src = e.target.result;

				img.onload = function () {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');

					let targetSize = 150

					const scaleFactor = Math.min(targetSize / img.width, targetSize / img.height);

					canvas.width = targetSize
					canvas.height = targetSize

					const scaledWidth = img.width * scaleFactor;
					const scaledHeight = img.height * scaleFactor;

					const offsetX = img.width > img.height ? (img.width - img.height) / 2 : 0;
					const offsetY = img.height > img.width ? (img.height - img.width) / 2 : 0;

					ctx.drawImage(img, offsetX, offsetY, Math.min(img.width, img.height), Math.min(img.width, img.height), 0, 0, targetSize, targetSize);

					const croppedDataURL = canvas.toDataURL('image/png');
					imgFile = croppedDataURL;
					document.getElementById('avatar_preview').src = croppedDataURL;
				}
			}
			reader.readAsDataURL(file);
		}
	});
}


function updateAccount(event) {
	event.preventDefault()

	let formData = new FormData();
	formData.append('newUsername', document.getElementById('Input_new_usr').value);
	formData.append('newEmail', document.getElementById('Input_new_mail').value);
	formData.append('newPassword', document.getElementById('Input_new_pwd').value);
	formData.append('newPasswordConfirmation', document.getElementById('Input_new_confirm_pwd').value);
	formData.append('password', document.getElementById('Input_pwd').value);

	if (imgFile != undefined) {
		formData.append('newAvatar', dataURItoBlob(imgFile));
	}

	var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	let feedback = document.querySelector('.feedback')
	var headers = new Headers()
	headers.append('X-CSRFToken', crsf_token)

  	unsetChatbox()
	fetch(document.location.origin + "/userManagement/updateAccount",
		{
			method: 'POST',
			headers: headers,
			body: formData,
		})
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.json()
		})
		.then(data => {
			if (data.message) {
				feedback.style.color = "green"
				feedback.innerHTML = data.message
				navto("/")
			}
			else {
				feedback.style.color = "red"
				feedback.innerHTML = data.error
			}
		})
		.catch(error => {
			console.error('Error:', error)
			feedback.innerHTML = data.message
			return
		})
}

function dataURItoBlob(dataURI) {
	const byteString = atob(dataURI.split(',')[1]);
	const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	const ab = new ArrayBuffer(byteString.length);
	const ia = new Uint8Array(ab);
	for (let i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ab], { type: mimeString });
}
