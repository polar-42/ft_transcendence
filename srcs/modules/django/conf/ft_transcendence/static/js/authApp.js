import { navto } from "./index.js";

export function initLoggin()
{
	document.getElementsByClassName("submit_BTN")[0].addEventListener("click", connect)
}

export function initRegister()
{
	document.getElementsByClassName("submit_BTN")[0].addEventListener("click", register)
}

export async function logout(event)
{
	event.preventDefault()
	const Response = await fetch(document.location.origin + '/authApp/logout/',
	{
		method: 'GET'
	})
	if (Response.ok)
	{
		var vari = await Response.json();
		if(vari.success == false)
			return false
		return true
	}
	else
		return false
}

export async function checkConnexion()
{
	const Response = await fetch(document.location.origin + '/authApp/check_connexion/',
	{
		method: 'GET'
	})
	if (Response.ok)
	{
		var vari = await Response.json();
		if(vari.connexionStatus == false)
			return false
		return true
	}
	else
		return false
}

function connect(event)
{
	event.preventDefault();
	var username = document.getElementById('Input_usr').value;
	var password = document.getElementById('Input_pwd').value;
	const data = { username: username, password: password };

	const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

	var headers = new Headers();
    headers.append('Content-Type', 'application/json');
	headers.append('X-CSRFToken', crsf_token);
	fetch(document.location.origin + "/authApp/login/",
	{
		method: 'POST',
		headers: headers,
		body: JSON.stringify(data),
	})
	.then(Response =>
	{
		if (!Response.ok)
		{
			throw new Error('Network response was not okay');
		}
		return Response.json();
	})
	.then(data =>
	{
		if (data.message)
		{
			document.getElementById('messageConnexion').innerHTML = data.message;
		}
		else
		{
			document.getElementById('messageConnexion').innerHTML = data.error;
		}
	})
	.catch(error =>
	{
		console.error('Error:', error);
		document.getElementById('messageConnexion').innerHTML = data.message;
	})
}

function register(event)
{
	event.preventDefault();
	const data = 
	{ 
		username: document.getElementById('Input_usr').value,
		email: document.getElementById('Input_mail').value,
		password: document.getElementById('Input_pwd').value,
		passwordConfirmation: document.getElementById('Input_confirm_pwd').value
	};

	var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-CSRFToken', crsf_token);

	fetch(document.location.origin + "/authApp/register/",
	{
		method: 'POST',
		headers: headers,
		body: JSON.stringify(data),
	})
	.then(Response =>
	{
		if (!Response.ok)
		{
			throw new Error('Network response was not okay');
		}
		return Response.json();
	})
	.then(data =>
	{
		navto("/")
		if (data.message)
		{
			document.getElementById('register').innerHTML = data.message;
		}
		else
		{
			document.getElementById('register').innerHTML = data.error;
		}
	})
	.catch(error =>
	{
		console.error('Error:', error);
		document.getElementById('register').innerHTML = data.message;
		return
	})
}