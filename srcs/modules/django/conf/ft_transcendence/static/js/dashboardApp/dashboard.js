import { getProfilePicture } from "../chatApp/CA_General.js";
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
          if (tournament.length == 0)
            document.getElementById('dash_listTournaments').innerHTML = '<li class="no_data">No Data</li>'
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
  let currentStreakSuffix
  if (data.currentStreak < 0) {
    if (data.currentStreak == -1)
      currentStreakSuffix = ' lose'
    else
      currentStreakSuffix = ' loses'
  } else if (data.currentStreak > 0) {
    if (data.currentStreak == 1)
      currentStreakSuffix = ' win' 
    else
      currentStreakSuffix = ' wins'
  }
  else 
    currentStreakSuffix = ''

  document.querySelector('.otherStat').innerHTML = statList
  document.getElementById('currentStreak').children[1].textContent = Math.abs(data.currentStreak).toString() + currentStreakSuffix
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
            elem.addEventListener('click', popUpBattleshipGameStat.bind(null, element.id))
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
  let currentStreakSuffix
  if (data.currentStreak < 0) {
    if (data.currentStreak == -1)
      currentStreakSuffix = ' lose'
    else
      currentStreakSuffix = ' loses'
  } else if (data.currentStreak > 0) {
    if (data.currentStreak == 1)
      currentStreakSuffix = ' win' 
    else
      currentStreakSuffix = ' wins'
  }
  else 
    currentStreakSuffix = ''
  document.querySelector('.otherStat').innerHTML = statList
  document.getElementById('currentStreak').children[1].textContent = Math.abs(data.currentStreak).toString() + currentStreakSuffix
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

  document.getElementById('closePopUp').addEventListener('click', function() {
    document.querySelector('.PopUp_wrapper').style.display = 'none';
    document.querySelector('.GameStatPopUp').style.display = 'none';
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

          document.querySelector('#boxTime p').textContent = data.date
          document.querySelector('.players_score').children[0].textContent = data.player1_score 
          document.querySelector('.players_score').children[2].textContent = data.player2_score
          document.querySelector('.players_touched').children[1].textContent = 'Touched balls'
          document.querySelector('.players_touched').children[0].textContent = data.player1_number_ball_touch
          document.querySelector('.players_touched').children[2].textContent = data.player2_number_ball_touch
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
  document.querySelector('.PopUp_wrapper').style.display = 'block';
  document.querySelector('.GameStatPopUp').style.display = 'block';
}

export async function popUpBattleshipGameStat(gameId)
{

  document.getElementById('closePopUp').addEventListener('click', function() {
    document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'none';
    document.querySelectorAll('.GameStatPopUp')[0].style.display = 'none';
  })



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
    body: JSON.stringify({'gameId': gameId}),
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

          document.querySelector('#boxTime p').textContent = data.date
          document.querySelector('.players_score').children[0].textContent = data.player1_score 
          document.querySelector('.players_score').children[2].textContent = data.player2_score
          document.querySelector('.players_touched').children[1].textContent = 'Accuracy'
          document.querySelector('.players_touched').children[0].textContent = data.player1_accuracy + '%'
          document.querySelector('.players_touched').children[2].textContent = data.player2_accuracy + '%'
        })
      .catch(error =>
        {
          console.error('Error:', error)
          //navto("/")
        })

  let res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({'gameId': gameId, 'playerNumber': '1', 'typeGame': '1'})
  })
  if (res.ok)
  {
    var vari = await res.blob()
    if (vari.type == "image/png")
    {
      let img = document.getElementById('player_1_avatar')
      img.src = URL.createObjectURL(vari)
      img.addEventListener('click', function(e) {
        navto("/profile/?id=" + player1_id)
      })
    }
  }

  res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({'gameId': gameId, 'playerNumber': '2', 'typeGame': '1'}),
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
  document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'block';
  document.querySelectorAll('.GameStatPopUp')[0].style.display = 'block';
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


  document.getElementById('closeTournamentPopUp').addEventListener('click', function() {
    document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'none';
    document.querySelectorAll('.TournamentStatPopUp')[0].style.display = 'none';
  })


  var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
  var headers = new Headers()
  headers.append('X-CSRFToken', crsf_token)

  let winner = "";
  let winner_id = "";

  fetch(document.location.origin + '/dashboard/getTournamentStat/', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({tournamentId: tournamentId}),
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
          
          document.querySelector('.tournament_name').textContent = data.name
          document.getElementById('boxTimeTournament').textContent = data.date
          document.getElementById('tournamentDescription').textContent = data.description
          document.querySelector('#tournamentWinner p').textContent = data.winner
          displayPlayerList(data.players)
        })
      .catch(error =>
        {
          console.error('Error:', error)
          return
        })

  let res = await fetch(document.location.origin + '/dashboard/getPlayerImage/', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({tournamentId: tournamentId, 'typeGame': '2'})
  })
  if (res.ok)
  {
    var vari = await res.blob()
    if (vari.type == "image/png")
    {
      let img = document.querySelector('#tournamentWinner img')
      img.src = URL.createObjectURL(vari)
      img.addEventListener('click', function(e) {
        navto("/profile/?id=" + winner_id)
      })
    }
  }
  document.querySelectorAll('.PopUp_wrapper')[0].style.display = 'block';
  document.querySelectorAll('.TournamentStatPopUp')[0].style.display = 'block';
}

async function displayPlayerList(players) {
  let playerList = document.querySelector('.players_list')

  for (let i in players) {
    let avatar = await getProfilePicture({'type': 'user', 'id': players[i].id})
    if (avatar.type == 'image/null')
      avatar = 'static/assets/logo/user.png'
    else
      avatar = URL.createObjectURL(avatar)

    let elem = document.createElement('li')
    elem.appendChild(document.createElement('img'))
    elem.children[0].src = avatar
    elem.children[0].alt = 'Player avatar'
    elem.appendChild(document.createElement('p'))
    elem.children[1].textContent = players[i].name
    playerList.appendChild(elem)
  }
} 

function cleanStats() {
  let lists = document.querySelectorAll('ul')
  lists[0].innerHTML = ''
  lists[1].innerHTML = ''
  document.querySelector('.otherStat').firstChild.remove()
}
