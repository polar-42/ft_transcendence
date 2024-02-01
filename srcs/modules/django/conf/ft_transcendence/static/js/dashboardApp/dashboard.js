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
            htmlMatch += '<li class="dash_classicMatch" id="gameId_' + element.id + '">'
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
            let gameId = 'gameId_' + matchs[i].id
            document.getElementById('gameId_' + matchs[i].id).addEventListener('click', function() {
                popUpGameStat(gameId);
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
            htmlTournament += '<li class="dash_tournament">'
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

function getBattleshipStat()
{
    document.getElementById('buttonGameBattleship').style.background = 'var(--fourth)'
    document.getElementById('buttonGamePong').style.background = 'transparent'
    addBattleshipClassicMatch()
    addBattleshipTournamentStat()
    addBattleshipGlobalStat()
    addOtherBattleshipStat()
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
            htmlMatch += '<li class="dash_classicMatch">'
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
            htmlTournament += '<li class="dash_tournament">'
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

function popUpGameStat(gameId)
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

        document.getElementById('boxTime').innerText = 'Date: ' + data.date
        document.getElementById('playerVs').innerText = data.player1 + ' vs ' + data.player2
        document.getElementById('boxScore').innerText = 'Score: ' + data.player1_score + ' | ' + data.player2_score
        document.getElementById('ballTouch').innerText = 'Ball touch: ' + data.player1_number_ball_touch + ' vs ' + data.player2_number_ball_touch
    })
    .catch(error =>
    {
        console.error('Error:', error)
        //navto("/")
    })
}
