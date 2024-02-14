import { navto } from "../index.js"

export function initDashboard()
{
    getPongStat()
    document.getElementById('buttonGamePong').addEventListener('click', getPongStat);
    document.getElementById('buttonGameBattleship').addEventListener('click', getBattleshipStat);
}

function getPongStat()
{
    document.getElementById('buttonGamePong').style.background = 'var(--fourth)'
    document.getElementById('buttonGameBattleship').style.background = 'transparent'
    addPongClassicMatch();
    addPongTournamentStat();
    addPongGlobalStat();
    addOtherPongStat();
}

function getBattleshipStat()
{
    document.getElementById('buttonGameBattleship').style.background = 'var(--fourth)'
    document.getElementById('buttonGamePong').style.background = 'transparent'
    addBattleshipClassicMatch()
    addBattleshipTournamentStat()
    addBattleshipGlobalStat()
    addOtherBattleshipStat()
}

export function addPongClassicMatch()
{
    let url = new URL(document.location.origin + '/dashboard/getPongClassicGameStats/')
	if (window.location.search != '')
	{
        url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
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
        let matchs = JSON.parse(data).classicMatchs
        let htmlMatch = "";

        matchs.forEach(element => {
            htmlMatch += '<li class="dash_classicMatch" id="pongId_' + element.id + '">'
            if (element.win == true)
                htmlMatch += '🏆 '
            else
                htmlMatch += '❌ '
            htmlMatch += element.player1 + ' vs ' + element.player2 + ' | ' + element.player1_score + ' ' + element.player2_score + ' | ' + element.date + '</li>'
        })

        document.getElementById('dash_listClassicMatch').innerHTML = htmlMatch
        let games = document.querySelectorAll('.dash_classicMatch');

        for (let i = 0; i < games.length; i++)
        {
            let gameId = 'pongId_' + matchs[i].id
            document.getElementById('pongId_' + matchs[i].id).addEventListener('click', function() {
                popUpPongGameStat(gameId);
            })
            if (matchs[i].win == true)
            {
                games[i].style.background = 'linear-gradient(rgb(0, 255, 38) 0%, black 65%)';
            }
            else
            {
                games[i].style.background = 'linear-gradient(rgb(255, 0, 0) 0%, black 65%)';
            }
        }
        if (matchs.length == 0)
        {
            document.getElementById('dash_listClassicMatch').innerHTML = '<li>No Data</li>'
        }
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

export function addPongTournamentStat()
{
    let url = new URL(document.location.origin + '/dashboard/getPongTournamentStats/')
	if (window.location.search != '')
	{
        url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
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
        let tournament = JSON.parse(data).tournaments
        let htmlTournament = "";

        tournament.forEach(element => {
            htmlTournament += '<li class="dash_tournament" id="tournamentId_' + element.id + '">'
            if (element.win == true)
                htmlTournament += '🏆 '
            else
                htmlTournament += '❌ '
            htmlTournament += element.name + ' win by ' + element.winner + ' | ' + element.date + '</li>'
        })

        document.getElementById('dash_listTournaments').innerHTML = htmlTournament
        let games = document.querySelectorAll('.dash_tournament');

        for (let i = 0; i < games.length; i++)
        {
            let tournamentId = 'tournamentId_' + tournament[i].id
            document.getElementById('tournamentId_' + tournament[i].id).addEventListener('click', function() {
                popUpTournamentStat(tournamentId);
            })
            if (tournament[i].win == true)
            {
                games[i].style.background = 'linear-gradient(rgb(0, 255, 38) 0%, black 65%)';
            }
            else
            {
                games[i].style.background = 'linear-gradient(rgb(255, 0, 0) 0%, black 65%)';
            }
        }

        if (tournament.length == 0)
        {
            document.getElementById('dash_listTournaments').innerHTML = '<li>No Data</li>'
        }
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

export function addPongGlobalStat()
{
    let url = new URL(document.location.origin + '/dashboard/getWinratePongGames/')
	if (window.location.search != '')
	{
        url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
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

        if (data.matchs != null)
        {
            document.getElementsByClassName('piechartGame')[0].style.backgroundImage = 'conic-gradient(green ' + (data.matchs * 3.6) + 'deg, red 0 ' + (360 - (data.matchs * 3.6)) +'deg)';
            document.getElementsByClassName('piechartGame')[0].style.border = '';
            document.getElementById('winGame').innerHTML =  '🏆 Win (' + Number(Math.round(data.matchs * 10) / 10).toFixed(2) + '%)'
            document.getElementById('loseGame').innerHTML =  '❌ Lose (' + Number(100 - Math.round(data.matchs * 10) / 10).toFixed(2) + '%)'
        }
        else
        {
            document.getElementsByClassName('piechartGame')[0].style.backgroundImage = 'conic-gradient(transparent 360deg, red 0deg)';
            document.getElementsByClassName('piechartGame')[0].style.border = '1px dashed var(--fourth)';
            document.getElementById('winGame').innerHTML =  '🏆 Win (0%)'
            document.getElementById('loseGame').innerHTML =  '❌ Lose (0%)'
        }

        if (data.tournament != null)
        {
            document.getElementsByClassName('piechartTournament')[0].style.backgroundImage = 'conic-gradient(green ' + (data.tournament * 3.6) + 'deg, red 0 ' + (360 - (data.tournament * 3.6)) +'deg)';
            document.getElementsByClassName('piechartTournament')[0].style.border = '';
            document.getElementById('winTournament').innerHTML =  '🏆 Win (' + Number(Math.round(data.tournament * 10) / 10).toFixed(2) + '%)'
            document.getElementById('loseTournament').innerHTML =  '❌ Lose (' + Number(100 - Math.round(data.tournament * 10) / 10).toFixed(2) + '%)'
        }
        else
        {
            document.getElementsByClassName('piechartTournament')[0].style.backgroundImage = 'conic-gradient(transparent 360deg, red 0deg)';
            document.getElementsByClassName('piechartTournament')[0].style.border = '1px dashed var(--fourth)';
            document.getElementById('winTournament').innerHTML =  '🏆 Win (0%)'
            document.getElementById('loseTournament').innerHTML =  '❌ Lose (0%)'
        }
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

export function addOtherPongStat()
{
    let url = new URL(document.location.origin + '/dashboard/getOtherPongStats/')
	if (window.location.search != '')
	{
        url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
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
        document.getElementById('otherStatLine').innerHTML = ""

        if (data.currentStreak >= 0)
            document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🏆 Current Streak = ' + data.currentStreak + ' Win</li>'
        else
            document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Current Streak = ' + (data.currentStreak * -1) + ' Lose</li>'

        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🏆 Longest Win Streak = ' + data.longestWinStreak + ' Win</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Longest Lose Steak = ' + data.longestLoseStreak + ' Lose</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🏆 Point Set = ' + data.totalPointSet + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Point Taken = ' + data.totalPointTaken + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">👊 Ball Hit = ' + data.totalBallHit + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Ball Hit By Opponents = ' + data.totalBallHitByOpponent + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🎮 Total Games Played = ' + data.totalGame + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🤖 Is AI better than you = ' + data.statusAI + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">📈 Percentage Ball Hit = ' + Number(Math.round(data.percentageBallHit * 10) / 10).toFixed(2) + '%</li>'
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

export function addBattleshipClassicMatch()
{
    let url = new URL(document.location.origin + '/dashboard/getBattlehipClassicGameStats/')
	if (window.location.search != '')
	{
        url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
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
        let matchs = JSON.parse(data).classicMatchs
        let htmlMatch = "";

        matchs.forEach(element => {
            htmlMatch += '<li class="dash_classicMatch" id="battleshipId_' + element.id + '">'
            if (element.win == true)
                htmlMatch += '🏆 '
            else
                htmlMatch += '❌ '
            htmlMatch += element.player1 + ' vs ' + element.player2 + ' | ' + element.date + '</li>'
        })

        document.getElementById('dash_listClassicMatch').innerHTML = htmlMatch
        let games = document.querySelectorAll('.dash_classicMatch');


        for (let i = 0; i < games.length; i++)
        {
            let gameId = 'battleshipId_' + matchs[i].id
            document.getElementById('battleshipId_' + matchs[i].id).addEventListener('click', function() {
                popUpBattleshipGameStat(gameId);
            })

            if (matchs[i].win == true)
            {
                games[i].style.background = 'linear-gradient(rgb(0, 255, 38) 0%, black 65%)';
            }
            else
            {
                games[i].style.background = 'linear-gradient(rgb(255, 0, 0) 0%, black 65%)';
            }
        }

        if (matchs.length == 0)
        {
            document.getElementById('dash_listClassicMatch').innerHTML = '<li>No Data</li>'
        }
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

export function addBattleshipTournamentStat()
{
    let url = new URL(document.location.origin + '/dashboard/getBattleshipTournamentStats/')
	if (window.location.search != '')
	{
        url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
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
        let tournament = JSON.parse(data).tournaments
        let htmlTournament = "";

        tournament.forEach(element => {
            htmlTournament += '<li class="dash_tournament" id="tournamentId_' + element.id + '">'
            if (element.win == true)
                htmlTournament += '🏆 '
            else
                htmlTournament += '❌ '
            htmlTournament += element.name + ' win by ' + element.winner + ' | ' + element.date + '</li>'
        })

        document.getElementById('dash_listTournaments').innerHTML = htmlTournament
        let games = document.querySelectorAll('.dash_tournament');

        for (let i = 0; i < games.length; i++)
        {
            let tournamentId = 'tournamentId_' + tournament[i].id
            document.getElementById('tournamentId_' + tournament[i].id).addEventListener('click', function() {
                popUpTournamentStat(tournamentId);
            })
            if (tournament[i].win == true)
            {
                games[i].style.background = 'linear-gradient(rgb(0, 255, 38) 0%, black 65%)';
            }
            else
            {
                games[i].style.background = 'linear-gradient(rgb(255, 0, 0) 0%, black 65%)';
            }
        }

        if (tournament.length == 0)
        {
            document.getElementById('dash_listTournaments').innerHTML = '<li>No Data</li>'
        }
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

export function addBattleshipGlobalStat()
{
    let url = new URL(document.location.origin + '/dashboard/getWinrateBattleshipGames/')
	if (window.location.search != '')
	{
        url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
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
        if (data.matchs != null)
        {
            document.getElementsByClassName('piechartGame')[0].style.backgroundImage = 'conic-gradient(green ' + (data.matchs * 3.6) + 'deg, red 0 ' + (360 - (data.matchs * 3.6)) +'deg)';
            document.getElementsByClassName('piechartGame')[0].style.border = '';
            document.getElementById('winGame').innerHTML =  '🏆 Win (' + Number(Math.round(data.matchs * 10) / 10).toFixed(2) + '%)'
            document.getElementById('loseGame').innerHTML =  '❌ Lose (' + Number(100 - Math.round(data.matchs * 10) / 10).toFixed(2) + '%)'
        }
        else
        {
            document.getElementsByClassName('piechartGame')[0].style.backgroundImage = 'conic-gradient(transparent 360deg, red 0deg)';
            document.getElementsByClassName('piechartGame')[0].style.border = '1px dashed var(--fourth)';
            document.getElementById('winGame').innerHTML =  '🏆 Win (0%)'
            document.getElementById('loseGame').innerHTML =  '❌ Lose (0%)'
        }

        if (data.tournament != null)
        {
            document.getElementsByClassName('piechartTournament')[0].style.backgroundImage = 'conic-gradient(green ' + (data.tournament * 3.6) + 'deg, red 0 ' + (360 - (data.tournament * 3.6)) +'deg)';
            document.getElementsByClassName('piechartGame')[0].style.border = '';
            document.getElementById('winTournament').innerHTML =  '🏆 Win (' + Number(Math.round(data.tournament * 10) / 10).toFixed(2) + '%)'
            document.getElementById('loseTournament').innerHTML =  '❌ Lose (' + Number(100 - Math.round(data.tournament * 10) / 10).toFixed(2) + '%)'
        }
        else
        {
            document.getElementsByClassName('piechartTournament')[0].style.backgroundImage = 'conic-gradient(transparent 360deg, red 0deg)';
            document.getElementsByClassName('piechartTournament')[0].style.border = '1px dashed var(--fourth)';
            document.getElementById('winTournament').innerHTML =  '🏆 Win (0%)'
            document.getElementById('loseTournament').innerHTML =  '❌ Lose (0%)'
        }

    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}


export function addOtherBattleshipStat()
{
    let url = new URL(document.location.origin + '/dashboard/getOtherBatlleshipStats/')
	if (window.location.search != '')
	{
        url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
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
        document.getElementById('otherStatLine').innerHTML = ""

        if (data.currentStreak >= 0)
            document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🏆 Current Streak = ' + data.currentStreak + ' Win</li>'
        else
            document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Current Streak = ' + (data.currentStreak * -1) + ' Lose</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🏆 Longest Win Streak = ' + data.longestWinStreak + ' Win</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Longest Lose Steak = ' + data.longestLoseStreak + ' Lose</li>'

        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🏹 Total Hit = ' + data.totalShoot + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Total Miss = ' + data.totalMiss + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">✅ Total Boat Shoot = ' + data.totalHitGive + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">⛴️ Total Boat Destroy = ' + data.totalBoatDestroy + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">💀 Total Boat Get Destroy = ' + data.totalBoatDestroy + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🎮 Total Game Played = ' + data.totalGame + '</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">📈 Precision = ' + Number(Math.round(data.precision * 10) / 10).toFixed(2) + '%</li>'
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

export async function popUpPongGameStat(gameId)
{
    document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'block';
    document.querySelectorAll('.GameStatPopUp')[0].style.display = 'block';

    document.getElementById('closePopUp').addEventListener('click', function() {
        document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'none';
        document.querySelectorAll('.GameStatPopUp')[0].style.display = 'none';
    })

    let gameIdForm = new FormData();
    gameIdForm.append('gameId', gameId);

    var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
    let feedback = document.querySelector('.feedback')
    var headers = new Headers()
    headers.append('X-CSRFToken', crsf_token)

    let player1 = "";
    let player2 = "";
    let player1_id = "";
    let player2_id = "";

    fetch(document.location.origin + '/dashboard/getPongSpecificGame/', {
        method: 'POST',
        headers: headers,
        body: gameIdForm,
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
        player1 = data.player1
        player2 = data.player2
        player1_id = data.player1_id
        player2_id = data.player2_id

        document.getElementById('boxTime').innerText = 'Date: ' + data.date
        document.getElementById('boxScore').innerText = 'Score: ' + data.player1_score + ' | ' + data.player2_score
        document.getElementById('ballTouch').innerText = 'Ball touch: ' + data.player1_number_ball_touch + ' vs ' + data.player2_number_ball_touch
    })
    .catch(error =>
    {
        console.error('Error:', error)
        //navto("/")
    })

    gameIdForm.append('player', '1')
    gameIdForm.append('typeGame', '0')
    let res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
        method: 'POST',
        headers: headers,
        body: gameIdForm,
    })
    if (res.ok)
    {
        var vari = await res.blob()
	    if (vari.type == "image/png")
        {
            let img = document.getElementById('player_1_avatar')
            img.src = URL.createObjectURL(vari)
            img.style.borderRadius = '50%'
            img.style.cursor = 'pointer'
            img.style.width = '100px'
            img.style.height = '100px'
            img.addEventListener('mouseover', function(e) {
                displayPlayerNickname(e, player1, 1, true)
            })
            img.addEventListener('mouseout', function(e) {
                displayPlayerNickname(e, player1, 1, false)
            })
            img.addEventListener('click', function(e) {
                navto("/profile/?id="+ player1_id)
            })
        }
    }

    gameIdForm.set('player', '2')
    res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
        method: 'POST',
        headers: headers,
        body: gameIdForm,
    })
    if (res.ok)
    {
        var vari = await res.blob()
	    if (vari.type == "image/png")
        {
            let img = document.getElementById('player_2_avatar')
            img.src = URL.createObjectURL(vari)
            img.style.borderRadius = '50%'
            img.style.cursor = 'pointer'
            img.style.width = '100px'
            img.style.height = '100px'
            img.addEventListener('mouseover', function(e) {
                displayPlayerNickname(e, player2, 2, true)
            })
            img.addEventListener('mouseout', function(e) {
                displayPlayerNickname(e, player2, 2, false)
            })
            img.addEventListener('click', function(e) {
                navto("/profile/?id=" + player2_id)
            })
        }
    }
}

export async function popUpBattleshipGameStat(gameId)
{
    document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'block';
    document.querySelectorAll('.GameStatPopUp')[0].style.display = 'block';

    document.getElementById('closePopUp').addEventListener('click', function() {
        document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'none';
        document.querySelectorAll('.GameStatPopUp')[0].style.display = 'none';
    })


    let gameIdForm = new FormData();
    gameIdForm.append('gameId', gameId);

    var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
    let feedback = document.querySelector('.feedback')
    var headers = new Headers()
    headers.append('X-CSRFToken', crsf_token)

    let player1 = "";
    let player2 = "";
    let player1_id = "";
    let player2_id = "";

    fetch(document.location.origin + '/dashboard/getBattleshipSpecificGame/', {
        method: 'POST',
        headers: headers,
        body: gameIdForm,
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
        player1 = data.player1
        player2 = data.player2
        player1_id = data.player1_id
        player2_id = data.player2_id

        document.getElementById('boxTime').innerText = 'Date: ' + data.date
        document.getElementById('boxScore').innerText = 'Number hit: ' + data.player1_score + ' | ' + data.player2_score
        document.getElementById('ballTouch').innerText = '????: ' + data.player1_number_ball_touch + ' vs ' + data.player2_number_ball_touch
    })
    .catch(error =>
    {
        console.error('Error:', error)
        //navto("/")
    })

    gameIdForm.append('player', '1')
    gameIdForm.append('typeGame', '1')
    let res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
        method: 'POST',
        headers: headers,
        body: gameIdForm,
    })
    if (res.ok)
    {
        var vari = await res.blob()
	    if (vari.type == "image/png")
        {
            let img = document.getElementById('player_1_avatar')
            img.src = URL.createObjectURL(vari)
            img.style.borderRadius = '50%'
            img.style.cursor = 'pointer'
            img.style.width = '100px'
            img.style.height = '100px'
            img.addEventListener('mouseover', function(e) {
                displayPlayerNickname(e, player1, 1, true)
            })
            img.addEventListener('mouseout', function(e) {
                displayPlayerNickname(e, player1, 1, false)
            })
            img.addEventListener('click', function(e) {
                navto("/profile/?id=" + player1_id)
            })
        }
    }

    gameIdForm.set('player', '2')
    res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
        method: 'POST',
        headers: headers,
        body: gameIdForm,
    })
    if (res.ok)
    {
        var vari = await res.blob()
	    if (vari.type == "image/png")
        {
            let img = document.getElementById('player_2_avatar')
            img.src = URL.createObjectURL(vari)
            img.style.borderRadius = '50%'
            img.style.cursor = 'pointer'
            img.style.width = '100px'
            img.style.height = '100px'
            img.addEventListener('mouseover', function(e) {
                displayPlayerNickname(e, player2, 2, true)
            })
            img.addEventListener('mouseout', function(e) {
                displayPlayerNickname(e, player2, 2, false)
            })
            img.addEventListener('click', function(e) {
                navto("/profile/?id=" + player2_id)
            })
        }
    }
}

export function displayPlayerNickname(e, playerNickname, num, value)
{
    if (value == true)
    {
        if (num == 1)
        {
            let tooltip = document.getElementById('tooltip_player1')
            tooltip.style.display = 'inline-block'
            tooltip.innerText = playerNickname
        }
        else if (num == 2)
        {
            document.getElementById('tooltip_player2').style.display = 'inline-block'
            document.getElementById('tooltip_player2').innerText = playerNickname
        }
        else
        {
            document.getElementById('tooltip_winnerTournament').style.display = 'block'
            document.getElementById('tooltip_winnerTournament').innerText = playerNickname
        }
    }
    else
    {
            document.getElementById('tooltip_player1').style.display = 'none'
            document.getElementById('tooltip_player2').style.display = 'none'
            document.getElementById('tooltip_winnerTournament').style.display = 'none'
    }
}

export async function popUpTournamentStat(tournamentId) {

    document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'block';
    document.querySelectorAll('.TournamentStatPopUp')[0].style.display = 'block';

    document.getElementById('closeTournamentPopUp').addEventListener('click', function() {
        document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'none';
        document.querySelectorAll('.TournamentStatPopUp')[0].style.display = 'none';
    })

    let tournamentIdForm = new FormData();
    tournamentIdForm.append('tournamentId', tournamentId);

    var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
    let feedback = document.querySelector('.feedback')
    var headers = new Headers()
    headers.append('X-CSRFToken', crsf_token)

    let winner = "";
    let winner_id = "";

    fetch(document.location.origin + '/dashboard/getTournamentStat/', {
        method: 'POST',
        headers: headers,
        body: tournamentIdForm,
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
        winner = data.winner
        winner_id = data.winner_id

        let players = "";
        let i = 0;

        data.players.forEach(element => {
            players += element;
            if (i + 2 < data.players.length)
                players += ", ";
            else if (i + 1 < data.players.length)
                players += " and ";
            i++;
        })

        document.getElementById('boxTimeTournament').innerText = 'Date: ' + data.date
        document.getElementById('tournamentDescription').innerText = 'Decription: ' + data.description
        document.getElementById('winnerTextTournament').innerText = 'Participants: ' + players
    })
    .catch(error =>
    {
        console.error('Error:', error)
        //navto("/")
    })

    tournamentIdForm.append('typeGame', '2')
    tournamentIdForm.append('tournamentId', tournamentId)
    let res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
        method: 'POST',
        headers: headers,
        body: tournamentIdForm,
    })
    if (res.ok)
    {
        var vari = await res.blob()
	    if (vari.type == "image/png")
        {
            let img = document.getElementById('winnerTournamentImage')
            img.src = URL.createObjectURL(vari)
            img.style.borderRadius = '50%'
            img.style.cursor = 'pointer'
            img.style.width = '150px'
            img.style.height = '150px'
            img.addEventListener('mouseover', function(e) {
                displayPlayerNickname(e, winner, 3, true)
            })
            img.addEventListener('mouseout', function(e) {
                displayPlayerNickname(e, winner, 3, false)
            })
            img.addEventListener('click', function(e) {
                navto("/profile/?id = " + winner_id)
            })
        }
    }
}
