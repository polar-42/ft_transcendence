import { navto } from "../index.js"

export function initProfile()
{
	if (arguments[0] == undefined)
	{
		navto('/dashboard');
		return;
	}
	console.log('initProfil')
	console.log(arguments[0])
	document.querySelectorAll('.userProfile')[0].innerHTML = 'User profile of ' + arguments[0]
}
