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
  cleanStats()
  addPongClassicMatch();
  addPongTournamentStat();
  addPongGlobalStat();
  addOtherPongStat();
}

function getBattleshipStat()
{
  document.getElementById('buttonGameBattleship').style.background = 'var(--fourth)'
  document.getElementById('buttonGamePong').style.background = 'transparent'
  cleanStats()
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
          let matchList = document.getElementById('dash_listClassicMatch')
          matchs.forEach(element => {
            let elem = document.createElement('li')
            elem.classList.add('dash_classicMatch')
            elem.setAttribute('id', 'pongId_' + element.id)
            elem.appendChild(document.createElement('img'))
            if (element.win == true) {
              elem.firstChild.src = '/static/assets/logo/trophy.png'
              elem.firstChild.alt = 'Trophy logo'
              elem.classList.add('win')
            } else {
              elem.firstChild.src = '/static/assets/logo/red_cross.png'
              elem.firstChild.alt = 'Lose logo'
              elem.classList.add('lose')
            }
            elem.appendChild(document.createElement('p'))
            elem.lastChild.classList.add('players')
            elem.lastChild.textContent = element.player1 + ' vs ' + element.player2
            elem.appendChild(document.createElement('p'))
            elem.lastChild.classList.add('score')
            elem.lastChild.textContent = element.player1_score + ' : ' + element.player2_score
            elem.appendChild(document.createElement('p'))
            elem.lastChild.textContent = element.date
            elem.addEventListener('click', popUpPongGameStat.bind(null, element.id))
            matchList.appendChild(elem)	
          })
          if (matchs.length == 0) 
            document.getElementById('dash_listClassicMatch').innerHTML = '<li class="no_data">No Data</li>'
        })
      .catch(error => {
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
          let matchList = document.getElementById('dash_listTournaments')

          tournament.forEach(element => {
            let elem = document.createElement('li')
            elem.classList.add('dash_tournament')
            elem.setAttribute('id', 'tournamentId_' + element.id)
            elem.appendChild(document.createElement('img'))
            if (element.win == true) {
              elem.firstChild.src = '/static/assets/logo/trophy.png'
              elem.firstChild.alt = 'Trophy logo'
              elem.classList.add('win')
            } else {
              elem.firstChild.src = '/static/assets/logo/red_cross.png'
              elem.firstChild.alt = 'Lose logo'
              elem.classList.add('lose')
            }
            elem.appendChild(document.createElement('p'))
            elem.lastChild.textContent = element.name + ' win by ' + element.winner
            elem.appendChild(document.createElement('p'))
            elem.lastChild.textContent = element.date
            elem.addEventListener('click', popUpTournamentStat.bind(null, element.id))
            matchList.appendChild(elem)	
          })

          let games = document.querySelectorAll('.dash_tournament');

          for (let i = 0; i < games.length; i++)
          {
            let tournamentId = 'tournamentId_' + tournament[i].id
            document.getElementById('tournamentId_' + tournament[i].id).addEventListener('click', function() {
              popUpTournamentStat(tournamentId);
            })
            if (tournament[i].win == true)
              games[i].classList.add('win')
            else
              games[i].classList.add('lose')
          }

          if (tournament.length == 0)
          {
            document.getElementById('dash_listTournaments').innerHTML = '<li class="no_data">No Data</li>'
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

export async function addOtherPongStat()
{
  let url = new URL(document.location.origin + '/dashboard/getOtherPongStats/')
  if (window.location.search != '')
  {
    url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
  }

  let data = await fetch(url, {
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
      .catch(error =>
        {
          console.error('Error:', error)
        })
  data = JSON.parse(data)
  let statList = await fetch(document.location.origin + '/dashboard/getPongStatHtml/',
    {
      method: 'GET'
    })
    .then(Response => {
      if (!Response.ok)
        throw new Error('Network response was not okay')
      return Response.text()
    })
    .catch(error => {
      console.error('Error', error)
      return
    })
  document.querySelector('.otherStat').innerHTML = statList
  document.getElementById('currentStreak').children[1].textContent = data.currentStreak.toString()
  document.getElementById('longestWinStreak').children[1].textContent = data.longestWinStreak.toString()
  document.getElementById('longestLoseStreak').children[1].textContent = data.longestLoseStreak.toString()
  document.getElementById('pointsScored').children[1].textContent = data.totalPointSet.toString()
  document.getElementById('pointsConceded').children[1].textContent = data.totalPointTaken.toString()
  document.getElementById('ballsHit').children[1].textContent = data.totalBallHit.toString()
  document.getElementById('ballsHitOpponent').children[1].textContent = data.totalBallHitByOpponent.toString()
  document.getElementById('gamesPlayed').children[1].textContent = data.totalGame.toString()
  document.getElementById('ai').children[1].textContent = data.statusAI
  document.getElementById('precision').children[1].textContent = data.percentageBallHit.toString() + '%'
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
          console.log(data)
          let matchs = JSON.parse(data).classicMatchs
          let matchList = document.getElementById('dash_listClassicMatch')

          matchs.forEach(element => {
            let elem = document.createElement('li')
            elem.classList.add('dash_classicMatch')
            elem.setAttribute('id', 'battleshipId_' + element.id)
            elem.appendChild(document.createElement('img'))
            if (element.win == true) {
              elem.firstChild.src = '/static/assets/logo/trophy.png'
              elem.firstChild.alt = 'Trophy logo'
              elem.classList.add('win')
            } else {
              elem.firstChild.src = '/static/assets/logo/red_cross.png'
              elem.firstChild.alt = 'Lose logo'
              elem.classList.add('lose')
            }
            elem.appendChild(document.createElement('p'))
            elem.lastChild.classList.add('players')
            elem.lastChild.textContent = element.player1 + ' vs ' + element.player2
            elem.appendChild(document.createElement('p'))
            elem.lastChild.classList.add('score')
            elem.lastChild.textContent = element.player1_score + ' : ' + element.player2_score
            elem.appendChild(document.createElement('p'))
            elem.lastChild.textContent = element.date
            elem.addEventListener('click', popUpPongGameStat.bind(null, element.id))
            matchList.appendChild(elem)	
          })
          if (matchs.length == 0)
            document.getElementById('dash_listClassicMatch').innerHTML = '<li class="no_data">No Data</li>'
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
          let matchList = document.getElementById('dash_listTournaments')
          tournament.forEach(element => {
            let elem = document.createElement('li')
            elem.classList.add('dash_tournament')
            elem.setAttribute('id', 'tournamentId_' + element.id)
            elem.appendChild(document.createElement('img'))
            if (element.win == true) {
              elem.firstChild.src = '/static/assets/logo/trophy.png'
              elem.firstChild.alt = 'Trophy logo'
              elem.classList.add('win')
            } else {
              elem.firstChild.src = '/static/assets/logo/red_cross.png'
              elem.firstChild.alt = 'Lose logo'
              elem.classList.add('lose')
            }
            elem.appendChild(document.createElement('p'))
            elem.lastChild.textContent = element.name + ' win by ' + element.winner
            elem.appendChild(document.createElement('p'))
            elem.lastChild.textContent = element.date
            elem.addEventListener('click', popUpTournamentStat.bind(null, element.id))
            matchList.appendChild(elem)	
          })
          if (tournament.length == 0)
            document.getElementById('dash_listTournaments').innerHTML = '<li class="no_data">No Data</li>'
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


export async function addOtherBattleshipStat()
{
  console.log('akecoucou')
  let url = new URL(document.location.origin + '/dashboard/getOtherBatlleshipStats/')
  if (window.location.search != '')
  {
    url.searchParams.append('userid', window.location.search.substring(window.location.search.indexOf('=') + 1));
  }

  let data = await fetch(url, {
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
      .catch(error =>
        {
          console.error('Error:', error)
          return
        })
  data = JSON.parse(data)
  let statList = await fetch(document.location.origin + '/dashboard/getBattleshipStatHtml/',
    {
      method: 'GET'
    })
    .then(Response => {
      if (!Response.ok)
        throw new Error('Network response was not okay')
      return Response.text()
    })
    .catch(error => {
      console.error('Error', error)
      return
    })
  document.querySelector('.otherStat').innerHTML = statList
  document.getElementById('currentStreak').children[1].textContent = data.currentStreak.toString()
  document.getElementById('longestWinStreak').children[1].textContent = data.longestWinStreak.toString()
  document.getElementById('longestLoseStreak').children[1].textContent = data.longestLoseStreak.toString()
  document.getElementById('totalHit').children[1].textContent = data.totalShoot.toString()
  document.getElementById('totalMiss').children[1].textContent = data.totalMiss.toString()
  document.getElementById('totalBoatShot').children[1].textContent = data.totalHitGive.toString()
  document.getElementById('totalBoatDestroyed').children[1].textContent = data.totalBoatDestroy.toString()
  document.getElementById('totalBotLost').children[1].textContent = data.totalBoatGetDestroy.toString()
  document.getElementById('precision').children[1].textContent = data.precision.toString() + '%'
}

export async function popUpPongGameStat(gameId)
{
  document.querySelector('.PopUp_wrapper').style.display = 'block';

  document.getElementById('closePopUp').addEventListener('click', function() {
    document.querySelector('.PopUp_wrapper').style.display = 'none';
  })

  let data = {'gameId': gameId};
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
    body: JSON.stringify(data),
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

          document.querySelector('#boxTime p').innerText = data.date
          document.querySelector('.players_score').children[0].innerText = data.player1_score 
          document.querySelector('.players_score').children[2].innerText = data.player2_score
          document.querySelector('.players_touched').children[0].innerText = data.player1_number_ball_touch
          document.querySelector('.players_touched').children[2].innerText = data.player2_number_ball_touch
        })
      .catch(error =>
        {
          console.error('Error:', error)
          return
        })
  document.getElementById('player1_name').textContent = player1
  document.getElementById('player2_name').textContent = player2
  let res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({'gameId': gameId, 'playerNumber': '1', 'typeGame': '0'})
  })
  if (res.ok)
  {
    var vari = await res.blob()
    if (vari.type == "image/png")
    {
      let img = document.getElementById('player_1_avatar')
      img.src = URL.createObjectURL(vari)
      img.addEventListener('click', function(e) {
        navto("/profile/?id="+ player1_id)
      })
    }
  }

  res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({'gameId': gameId, 'playerNumber': '2', 'typeGame': '0'}),
  })
  if (res.ok)
  {
    var vari = await res.blob()
    if (vari.type == "image/png")
    {
      let img = document.getElementById('player_2_avatar')
      img.src = URL.createObjectURL(vari)
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
        navto("/profile/?id=" + winner_id)
      })
    }
  }
}

function cleanStats() {
  let lists = document.querySelectorAll('ul')
  lists[0].innerHTML = ''
  lists[1].innerHTML = ''
  document.querySelector('.otherStat').firstChild.remove()
}
