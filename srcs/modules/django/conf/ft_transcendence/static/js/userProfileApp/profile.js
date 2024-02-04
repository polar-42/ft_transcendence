import { navto } from "../index.js"
import { addPongClassicMatch, addPongTournamentStat, addPongGlobalStat, addOtherPongStat, addBattleshipClassicMatch, addBattleshipTournamentStat, addBattleshipGlobalStat, addOtherBattleshipStat } from "../dashboardApp/dashboard.js"

let userIdentification;

export function initProfile()
{
	if (arguments[0] == undefined)
	{
		navto('/dashboard');
		return;
	}
	userIdentification = arguments[0]

	getUserInformation()
	getUserAvatar()
    getPongStat()
    document.getElementById('buttonGamePong').addEventListener('click', getPongStat);
    document.getElementById('buttonGameBattleship').addEventListener('click', getBattleshipStat);
}

function getUserInformation()
{
    let url = new URL(document.location.origin + '/profile/getUserInformation/')
	if (userIdentification != undefined)
	{
        url.searchParams.append('userIdentification', userIdentification);
	}

    fetch(url, {
        method: 'GET'
    })
    .then(Response =>
    {
        if (!Response.ok)
        {
            throw new Error('Network response was not okay')
        }
        return Response.text()
    })
    .then(data =>
    {
        data = JSON.parse(data)

		if (data.error == 'error')
			navto('/dashboard')
		document.getElementById('userName').innerHTML = 'Nickname: ' + data.userName
		document.getElementById('userStatus').innerHTML = 'Status: ' + data.userStatus
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

async function getUserAvatar()
{
    let url = new URL(document.location.origin + '/profile/getPlayerImage/')
	if (userIdentification != undefined)
	{
        url.searchParams.append('userIdentification', userIdentification);
	}

    let res = await fetch(url, {
        method: 'GET'
    })
	if (res.ok)
    {
        var vari = await res.blob()
	    if (vari.type == "image/png")
        {
            let img = document.getElementById('userAvatarImage')
            img.src = URL.createObjectURL(vari)
            img.style.borderRadius = '50%'
            img.style.width = '100px'
            img.style.height = '100px'
        }
		else
		{
			navto("/dashboard")
		}
    }
}

function getPongStat()
{
    document.getElementById('buttonGamePong').style.background = 'var(--fourth)'
    document.getElementById('buttonGameBattleship').style.background = 'transparent'
    addPongClassicMatch(userIdentification);
    addPongTournamentStat(userIdentification);
    addPongGlobalStat(userIdentification);
    addOtherPongStat(userIdentification);
}

function getBattleshipStat()
{
    document.getElementById('buttonGameBattleship').style.background = 'var(--fourth)'
    document.getElementById('buttonGamePong').style.background = 'transparent'
    addBattleshipClassicMatch(userIdentification)
    addBattleshipTournamentStat(userIdentification)
    addBattleshipGlobalStat(userIdentification)
    addOtherBattleshipStat(userIdentification)
}
