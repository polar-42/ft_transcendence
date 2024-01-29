import { navto } from "../index.js"

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
	fetch(window.location.origin + "/authApp/Get2FaStatus")
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
	if (checkbox.checked == true) {
		fetch(window.location.origin + "/authApp/Start2FaActivation")
			.then(Response => {
				if (!Response.ok) {
					throw new Error('Network response was not okay')
				}
				return Response.text()
			})
			.then(texted => {
				document.querySelector("#app").lastElementChild.insertAdjacentHTML("afterend", texted)
				const doc = document.querySelector("#app").lastElementChild
				return doc
			})
			.then(doc => {
				Effective2Fa(doc)
			})
			.catch(error => {
				console.log(error)
			})
	}
	else {

	}
}

function Effective2Fa(doc) {
	let content = doc.querySelector('.TFA_Content')
	fetch(window.location.origin + "/authApp/TFAConfirmPass")
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.text()
		})
		.then(texted => {
			content.innerHTML = texted
			content.querySelector('.submit_BTN').addEventListener('click', () => {
				VerifyPass(content)
			})
		})
		.catch(error => {
			console.error(error)
		})
}

function VerifyPass(content) {

	console.log ("Toto")
	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	var header = new Headers()
	header.append('Content-Type', 'application/json')
	header.append('X-CSRFToken', crsf_token)
	const data = { password: content.querySelector('#Input_pwd').value }
	content.querySelector('#messageError').text = ""
	fetch(document.location.origin + "/authApp/TFACheckPass",
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
		.then (texted => {
			if (texted.length === 0)
			{
				content.querySelector('#messageError').text = "Invalid password"
				content.querySelector('#Input_pwd').style.background =  "#fa6969"
			}
			else
			{
				Select2FA(content, texted)
			}
		})
		.catch(error => {
			console.error(error)
		})
}

var selected = undefined

function Select2FA(content, text)
{
	content.querySelector('.submit_BTN').removeEventListener('click', VerifyPass)
	content.innerHTML = text
	selected = undefined
	const list = content.querySelectorAll(".selector_button")
	list.forEach(Element =>{
		Element.addEventListener("click", () => {
			console.log(Element)
			SelectorButtonBehavior(list, Element, content)
		})
	})
	content.querySelector('.submit_BTN').addEventListener('click', () => {
		ChooseAuth(content)
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
	fetch(document.location.origin + "/authApp/TFASelected",
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
		fetch(window.location.origin + "/authApp/TFARequestQR")
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.json()
		})
		.then(data => {
			console.log(data.qr)
			content.querySelector(".qrDisplayer").src = data.qr
		})
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
				navto("authApp/login")
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
