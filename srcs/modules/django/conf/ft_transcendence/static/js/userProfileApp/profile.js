import { navto } from "../index.js"
import { addPongClassicMatch, addPongTournamentStat, addPongGlobalStat, addOtherPongStat, addBattleshipClassicMatch, addBattleshipTournamentStat, addBattleshipGlobalStat, addOtherBattleshipStat } from "../dashboardApp/dashboard.js"

let userid = undefined;

export async function initProfile()
{
	if (window.location.search != '')
		userid = window.location.search.substring(window.location.search.indexOf('=') + 1)
	if (userid == undefined)
	{
		navto('/dashboard');
		return;
	}
	fetch(window.location.origin + '/authApp/GET/userID')
	.then(Response => 
	{
		if (Response.ok)
			return Response.json()
	})
	.then (Jsoned => {
		if (Jsoned.userID != parseInt(userid))
		{
			getUserInformation()
			getUserAvatar()
			getPongStat()
			document.getElementById('buttonGamePong').addEventListener('click', getPongStat);
			document.getElementById('buttonGameBattleship').addEventListener('click', getBattleshipStat);
		}
	})
}

function getUserInformation()
{
    let url = new URL(document.location.origin + '/profile/getUserInformation/')
	if (userid != undefined)
	{
        url.searchParams.append('userid', userid);
	}
	// console.log('modified = ' + url)
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
        document.querySelectorAll('.userInformation')[0].style.display = 'grid'
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
	if (userid != undefined)
	{
        url.searchParams.append('userid', userid);
	}
	// console.log('modified = ' + url)
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
    addPongClassicMatch(userid);
    addPongTournamentStat(userid);
    addPongGlobalStat(userid);
    addOtherPongStat(userid);
}

function getBattleshipStat()
{
    document.getElementById('buttonGameBattleship').style.background = 'var(--fourth)'
    document.getElementById('buttonGamePong').style.background = 'transparent'
    addBattleshipClassicMatch(userid)
    addBattleshipTournamentStat(userid)
    addBattleshipGlobalStat(userid)
    addOtherBattleshipStat(userid)
}
