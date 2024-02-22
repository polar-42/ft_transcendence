import { initChat } from "./chatApp/CA_General.js";
import { navto } from "./index.js"

export function initLogin() {
	const submitBtn = document.getElementsByClassName("submit_BTN")[0];
	submitBtn.addEventListener("click", connect)
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
}

export function initRegister() {
	let submitBtn = document.getElementsByClassName("submit_BTN")[0];
	submitBtn.addEventListener("click", register)
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
}

function sleep(ms) {
	let sleepSetTimeout

	clearInterval(sleepSetTimeout)
	return new Promise(resolve => sleepSetTimeout = setTimeout(resolve, ms))
}

export async function logout(event) {
	event.preventDefault()
	const Response = await fetch(document.location.origin + '/authApp/logout',
		{
			method: 'GET'
		})
	if (Response.ok) {
		var vari = await Response.json()
		if (vari.success == false) {
			// location.reload()
			return false
		}
		initProfileButton(false)
		// location.reload()
		return true
	}
	else
		return false
}

export async function checkConnexion() {
	const Response = await fetch(document.location.origin + '/authApp/GET/connexionStatus',
		{
			method: 'GET'
		})
	if (Response.ok) {
		var vari = await Response.json()
		if (vari.connexionStatus == false) {
			return false
		}
		initProfileButton(true)
		return true
	}
	else
		return false
}

async function connect(event) {
	event.preventDefault()
	var email = document.getElementById('Input_mail').value
	var password = document.getElementById('Input_pwd').value
	const data = { email: email, password: password }
	let feedback = document.querySelector('.feedback')

	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value

	var headers = new Headers()
	headers.append('Content-Type', 'application/json')
	headers.append('X-CSRFToken', crsf_token)
	// console.log(crsf_token)
	await fetch(document.location.origin + "/authApp/Connexion",
		{
			method: 'POST',
			headers: headers,
			body: JSON.stringify(data),
			credentials: "same-origin"
		})
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.json()
		})
		.then(data => {
			if (data.message) {
				feedback.style.color = 'green'
				feedback.innerHTML = data.message
				sleep(3000)
				initProfileButton(true)
				initChat()
				navto("/")
			}
			else if (data.TFA) {
				TFALogin()
			}
			else {
				feedback.style.color = 'red'
				feedback.innerHTML = data.error
			}
		})
		.catch(error => {
			console.error('Error:', error)
			feedback.innerHTML = data.message
		})
}

function TFALogin() {
	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	var headers = new Headers()
	headers.append('Content-Type', 'application/json')
	headers.append('X-CSRFToken', crsf_token)
	fetch(document.location.origin + '/authApp/TFA/Login',
	{
		method: 'GET',
	})
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.text()
		})
		.then(text => {
			const container = document.querySelector(".login_container")
			container.querySelector("form").remove()
			container.firstElementChild.insertAdjacentHTML("afterend", text)
      container.querySelector('#Input_code').focus()
			container.querySelector(".submit_BTN").removeEventListener("click", connect)
			container.querySelector(".submit_BTN").addEventListener("click", () => {
				sendTFACode(container)
			})
      container.querySelector("#Input_code").addEventListener('keypress', (e) => {
        if (e.key == 'Enter')
          sendTFACode(container)
      })
		})
}

function sendTFACode(container) {
	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	let feedback = document.querySelector('.feedback')
	var headers = new Headers()
	headers.append('Content-Type', 'application/json')
	headers.append('X-CSRFToken', crsf_token)
	const data = {TFACode: container.querySelector("#Input_code").value }
	fetch(document.location.origin + '/authApp/TFA/LoginCheck',
		{
			method: 'POST',
			headers: headers,
			body: JSON.stringify(data),
		})
		.then(Response => {
			if (!Response.ok) {
				throw new Error('Network response was not okay')
			}
			return Response.json()
		})
		.then(data => {
			if (data.error != undefined)
				throw new Error(data.error)
			feedback.style.color = 'green'
			feedback.innerHTML = data.message
			sleep(3000)
			initProfileButton(false)
			initChat()
			navto("/")
		})
		.catch(error => {
			feedback.style.color = 'red'
			feedback.innerHTML = error
		})
}

function register(event) {
	event.preventDefault()

	let formData = new FormData();
	formData.append('username', document.getElementById('Input_usr').value);
	formData.append('email', document.getElementById('Input_mail').value);
	formData.append('password', document.getElementById('Input_pwd').value);
	formData.append('passwordConfirmation', document.getElementById('Input_confirm_pwd').value);

	var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
	let feedback = document.querySelector('.feedback')
	var headers = new Headers()
	headers.append('X-CSRFToken', crsf_token)

	fetch(document.location.origin + "/authApp/Registration",
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
				sleep(3000)
				navto("/")
			}
			else {
				feedback.style.color = "red"
				feedback.innerHTML = data.error
			}
		})
		.catch(error => {
			console.error('Error:', error)
			feedback.innerHTML = error.message
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

export async function initProfileButton(connected) {
	let profiles = document.querySelectorAll(".profile_button")
	if (connected === true) {
		let profiles = document.querySelectorAll(".profile_button")
		let Response = await fetch(document.location.origin + '/authApp/GET/userName',
			{
				method: 'GET'
			})
		if (!Response.ok) {
			throw new Error('Error when fetching user datas')
		}
		let userData = await Response.json()
		profiles.forEach((button) => {
			button.classList.add('connected')
			button.children[2].textContent = userData.userName
		})


		let param = new URLSearchParams({
			type: 'user',
			userId: 'self'
		})

		let profileImage = document.querySelectorAll('img.user_logo')
		Response = await fetch(document.location.origin + '/authApp/GET/avatarImage/?'
			+ param,
			{
				method: 'GET'

			})
		if (Response.ok) {
			var vari = await Response.blob()
			if (vari.type == "image/png") {
				profileImage.forEach((img) => {
					img.src = URL.createObjectURL(vari)
					img.style.borderRadius = '50%';
				})
			}
		}
	}
	else {
		profiles.forEach((button) => {
			button.classList.remove('connected')
			button.children[2].textContent = 'Log In'
			button.children[0].src = '/static/assets/logo/user.png'
			button.children[1].src = '/static/assets/logo/user.png'
		})
	}
}
