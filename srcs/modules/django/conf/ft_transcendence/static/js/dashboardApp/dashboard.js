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

function addPongClassicMatch()
{
    fetch(document.location.origin + '/dashboard/getPongClassicGameStats/', {
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

function addPongTournamentStat()
{
    fetch(document.location.origin + '/dashboard/getPongTournamentStats/', {
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

function addPongGlobalStat()
{
    fetch(document.location.origin + '/dashboard/getWinratePongGames/', {
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
            document.getElementById('winGame').innerHTML =  '🏆 Win (' + (Math.round(data.matchs * 10) / 10) + '%)'
            document.getElementById('loseGame').innerHTML =  '❌ Lose (' + (100 - Math.round(data.matchs * 10) / 10) + '%)'
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
            document.getElementById('winTournament').innerHTML =  '🏆 Win (' + (Math.round(data.tournament * 10) / 10) + '%)'
            document.getElementById('loseTournament').innerHTML =  '❌ Lose (' + (100 - Math.round(data.tournament * 10) / 10) + '%)'
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

function addOtherPongStat()
{
    fetch(document.location.origin + '/dashboard/getOtherPongStats/', {
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
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🏆 Total Point Set = ' + data.totalPointSet + ' pts</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Total Point Taken = ' + data.totalPointTaken + ' pts</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">👊 Total Ball Hit = ' + data.totalBallHit + ' hits</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">📈 Percentage Ball Hit = ' + (Math.round(data.percentageBallHit * 10) / 10) + '%</li>'
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

function addBattleshipClassicMatch()
{
    fetch(document.location.origin + '/dashboard/getBattlehipClassicGameStats/', {
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

function addBattleshipTournamentStat()
{
    fetch(document.location.origin + '/dashboard/getBattleshipTournamentStats/', {
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

function addBattleshipGlobalStat()
{
    fetch(document.location.origin + '/dashboard/getWinrateBattleshipGames/', {
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
            document.getElementById('winGame').innerHTML =  '🏆 Win (' + (Math.round(data.matchs * 10) / 10) + '%)'
            document.getElementById('loseGame').innerHTML =  '❌ Lose (' + (100 - Math.round(data.matchs * 10) / 10) + '%)'
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
            document.getElementById('winTournament').innerHTML =  '🏆 Win (' + (Math.round(data.tournament * 10) / 10) + '%)'
            document.getElementById('loseTournament').innerHTML =  '❌ Lose (' + (100 - Math.round(data.tournament * 10) / 10) + '%)'
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


function addOtherBattleshipStat()
{
    fetch(document.location.origin + '/dashboard/getOtherBatlleshipStats/', {
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
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">🏆 Total Boat Hit = ' + data.totalBoatHit + ' hit</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">❌ Total Hit Taken = ' + data.totalHitTaken + ' hit</li>'
        document.getElementById('otherStatLine').innerHTML += '<li id="otherStatRow">📈 Precision = ' + (Math.round(data.precision * 10) / 10) + '%</li>'
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}

async function popUpPongGameStat(gameId)
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
    let player1_identification = "";
    let player2_identification = "";

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
        player1_identification = data.player1_identification
        player2_identification = data.player2_identification

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
            console.log
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
                navto("/profile", player1_identification)
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
                navto("/profile", player2_identification)
            })
        }
    }
}

async function popUpBattleshipGameStat(gameId)
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
    let player1_identification = "";
    let player2_identification = "";

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
        player1_identification = data.player1_identification
        player2_identification = data.player2_identification

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
                navto("/profile", player1_identification)
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
                navto("/profile", player2_identification)
            })
        }
    }
}

function displayPlayerNickname(e, playerNickname, num, value)
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

async function popUpTournamentStat(tournamentId) {

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
    let winner_identification = "";

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
        winner_identification = data.winner_identification

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
                navto("/profile", winner_identification)
            })
        }
    }
}
