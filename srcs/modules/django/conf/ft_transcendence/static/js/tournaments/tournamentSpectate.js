var tournamentId = undefined
var curInterval = undefined

export function InitTournamentView()
{

    tournamentId = arguments[0][0]
    GetData()
    curInterval = setInterval(GetData, 10000);
}

function GetData()
{
    const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value

    var headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('X-CSRFToken', crsf_token)
    fetch(document.location.origin + "/tournaments/GetTournamentData",
	{
		method: 'POST',
        headers: headers,
        body: JSON.stringify({'tourID' : tournamentId})
	})
	.then(Response =>
	{
		if (!Response.ok)
		{
			throw new Error('Network response was not okay')
		}
		return Response.json()
	})
	.then(data =>
	{
		PrintPlayers(data)
		PrintMatchs(data)
	})
	.catch(error =>
	{
        clearInterval(curInterval)
        curInterval = undefined
		console.error('Error:', error)
	})
}

function PrintPlayers(data)
{

	const PL = document.getElementsByName("PlayerList")[0]
	if (PL == null)
		return
    let child = PL.lastElementChild
    while (child) {
        PL.removeChild(child)
        child = PL.lastElementChild
    }
	const Players = data.users
	Players.forEach(element => {
		const txt = document.createElement('li')
		txt.textContent = element
		PL.appendChild(txt)
	})
	// document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}

function PrintMatchs(data)
{
	const Matchs = data.matchs
    if (Matchs == 'None')
        return
	const PL = document.getElementsByName("MatchList")[0]
	if (PL == null)
		return
    let child = PL.lastElementChild
    while (child) {
        PL.removeChild(child)
        child = PL.lastElementChild
    }
	Matchs.forEach(element => {
		const txt = document.createElement('li')
		const user1 = document.createElement('h1')
		const user2 = document.createElement('h1')
		user1.textContent = element.User1
		user2.textContent = element.User2
		if (element.Winner == 0)
		{
			user1.style.color = "green"
			user2.style.color = "red"
		}
		else if (element.Winner == 1)
		{
			user1.style.color = "red"
			user2.style.color = "green"
		}
		txt.appendChild(user1)
		txt.appendChild(user2)
		PL.appendChild(txt)
	})
	// document.getElementById('players_in_tournaments').innerHTML = 'There is ' + data.player_in_tournament + ' in this ' + data.size_tournaments + ' players tournament.'
}