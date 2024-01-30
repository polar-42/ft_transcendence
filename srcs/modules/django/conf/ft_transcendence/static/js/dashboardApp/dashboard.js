
export function initDashboard()
{
    console.log('initDashboard');

    getPongStat()
    document.getElementById('buttonGamePong').addEventListener('click', getPongStat);
    document.getElementById('buttonGameBattleship').addEventListener('click', getBattleshipStat);
}

function getPongStat()
{
    addPongClassicMatch();
    addPongTournamentStat();
    addPongGlobalStat();
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
            htmlMatch += '<li class="dash_classicMatch">'
            if (element.win == true)
                htmlMatch += '🏆 '
            htmlMatch += element.player1 + ' vs ' + element.player2 + ' | ' + element.player1_score + ' ' + element.player2_score + ' | ' + element.date + '</li>'
        })

        document.getElementById('dash_listPongClassicMatch').innerHTML = htmlMatch
        let games = document.querySelectorAll('.dash_classicMatch');

        for (let i = 0; i < games.length; i++)
        {
            if (matchs[i].win == true)
            {
                games[i].style.background = 'linear-gradient(rgb(0, 255, 38) 0%, black 65%)';
            }
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
            htmlTournament += element.name + ' win by ' + element.winner + ' | ' + element.date + '</li>'
        })

        document.getElementById('dash_listPongTournaments').innerHTML = htmlTournament
        let games = document.querySelectorAll('.dash_tournament');

        for (let i = 0; i < games.length; i++)
        {
            if (tournament[i].win == true)
            {
                games[i].style.background = 'linear-gradient(rgb(0, 255, 38) 0%, black 65%)';
            }
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
        document.getElementsByClassName('piechartGame')[0].style.backgroundImage = 'conic-gradient(green ' + (data.matchs * 3.6) + 'deg, red 0 ' + (360 - (data.matchs * 3.6)) +'deg)';
        document.getElementById('winGame').innerHTML =  'Win (' + (Math.round(data.matchs * 10) / 10) + '%)'
        document.getElementById('loseGame').innerHTML =  'Lose (' + (100 - Math.round(data.matchs * 10) / 10) + '%)'
        document.getElementsByClassName('piechartTournament')[0].style.backgroundImage = 'conic-gradient(green ' + (data.tournament * 3.6) + 'deg, red 0 ' + (360 - (data.tournament * 3.6)) +'deg)';
        document.getElementById('winTournament').innerHTML =  'Win (' + (Math.round(data.tournament * 10) / 10) + '%)'
        document.getElementById('loseTournament').innerHTML =  'Lose (' + (Math.round(data.tournament * 10) / 10) + '%)'
    })
    .catch(error =>
    {
        console.error('Error:', error)
    })
}


function getBattleshipStat()
{
    console.log('getBattleshipStat');
}
