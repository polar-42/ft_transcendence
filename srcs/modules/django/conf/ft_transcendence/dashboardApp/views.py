from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from authApp.models import User
from pongGameApp.models import PongGameModels
from django.db.models import Q
from authApp.models import User
from tournamentsApp.models import TournamentsModels
from battleshipApp.models import BattleshipGameModels
from web3 import Web3
import os, json

def dashboardView(request):
    if request.user.is_authenticated:
        return render(request, 'dashboardApp/dashboard.html')
    return render(request, 'index.html')

def getPongClassicGameStats(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allPongGames = PongGameModels.objects.filter(tournamentId='-1').filter(Q(player1=request.user.id) | Q(player2=request.user.id)).order_by('-id')

    classicMatchs = []
    for game in allPongGames:
        gameId = game.id
        print('game.id =', gameId)
        if game.player1 == request.user.id:
            player1 = request.user.nickname
        elif game.player1 != 'AI':
            player1 = User.objects.get(id=game.player1).nickname
        else:
            player1 = 'AI'

        if game.player2 == request.user.id:
            player2 = request.user.nickname
        elif game.player2 != 'AI':
            player2 = User.objects.get(id=game.player2).nickname
        else:
            player2 = 'AI'

        win = False
        if game.winner == str(request.user.id):
            win = True

        dateGameTab = str(game.time).split(' ')
        dateGame = dateGameTab[0] + ' ' + dateGameTab[1][:5]

        classicMatchs.append({
            'id': str(gameId),
            'player1': player1,
            'player2': player2,
            'win': win,
            'player1_score': game.score_player1,
            'player2_score': game.score_player2,
            'date': dateGame
        })

    return JsonResponse({'classicMatchs': classicMatchs})

def getPongTournamentStats(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allPongTournament = TournamentsModels.objects.filter(tournamentType=0).order_by('-id')
    allTournamentInvolve = []
    for tournament in allPongTournament:
        if tournament.playersId is not None and str(request.user.id) in tournament.playersId:
            allTournamentInvolve.append(tournament)

    tournamentTab = []
    for tournament in allTournamentInvolve:

        #w3 = Web3(Web3.HTTPProvider('http://' + os.environ.get('IP_NODE') + ':8545'))
        #file = open('/var/blockchain/TranscendenceTournamentHistory.json')
        #jsonFile = json.load(file)
        #abi = jsonFile['abi']

        #contract_address = os.environ.get('CONTRACT_ADDRESS')
        #contract = w3.eth.contract(address=contract_address, abi=abi)

        #winnerId = contract.functions.getWinnerTournament(str(tournament.id)).call()

        winner = User.objects.get(id=tournament.winner)
        win = False
        if winner.id == request.user.id:
            win = True

        dateTab = str(tournament.creationTime).split(' ')
        date = dateTab[0] + ' ' + dateTab[1][:5]

        tournamentTab.append({
            'id': str(tournament.id),
            'name': tournament.tournamentsName,
            'winner': winner.nickname,
            'win': win,
            'date': date
        })

    return JsonResponse({'tournaments': tournamentTab})

def getWinratePongGames(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allPongGames = PongGameModels.objects.filter(tournamentId='-1').filter(Q(player1=request.user.id) | Q(player2=request.user.id)).order_by('-id')
    win = 0
    for games in allPongGames:
        if games.winner == str(request.user.id) and str(games.tournamentId) == '-1':
            win += 1
    winrateGame = None
    if win != 0:
        winrateGame = win / len(allPongGames) * 100
    elif len(allPongGames) != 0:
        winrateGame = 0

    allPongTournament = TournamentsModels.objects.filter(tournamentType=0).order_by('-id')
    allTournamentInvolve = []
    for tournament in allPongTournament:
        if tournament.playersId is not None and str(request.user.id) in tournament.playersId:
            allTournamentInvolve.append(tournament)
    win = 0
    for tournament in allTournamentInvolve:
        if tournament.winner == str(request.user.id):
            win += 1
    winrateTournament = None
    if win != 0:
        winrateTournament = win / len(allTournamentInvolve) * 100
    elif len(allTournamentInvolve) != 0:
        winrateTournament = 0

    return JsonResponse({'matchs': winrateGame, 'tournament': winrateTournament})

def getOtherPongStats(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allPongGames = PongGameModels.objects.filter(tournamentId='-1').filter(Q(player1=request.user.id) | Q(player2=request.user.id)).order_by('-id')
    currentStreak = 0
    for games in allPongGames:
        if games.winner == str(request.user.id) and str(games.tournamentId) == '-1':
            if currentStreak != 0 and currentStreak <= 0:
                break
            currentStreak += 1
        elif games.winner != str(request.user.id) and str(games.tournamentId) == '-1':
            if currentStreak != 0 and currentStreak >= 0:
                break
            currentStreak -= 1

    longestWinStreak = 0
    tmpStreak = 0
    for games in allPongGames:
        if games.winner == str(request.user.id) and str(games.tournamentId) == '-1':
            tmpStreak += 1
            if tmpStreak > longestWinStreak:
                longestWinStreak = tmpStreak
        else:
            if tmpStreak > longestWinStreak:
                longestWinStreak = tmpStreak
            tmpStreak = 0

    longestLoseStreak = 0
    tmpStreak = 0
    for games in allPongGames:
        if games.winner != str(request.user.id) and str(games.tournamentId) == '-1':
            tmpStreak += 1
            if tmpStreak > longestLoseStreak:
                longestLoseStreak = tmpStreak
        else:
            if tmpStreak > longestLoseStreak:
                longestLoseStreak = tmpStreak
            tmpStreak = 0

    totalPointSet = 0
    totalPointTaken = 0
    totalBallHit = 0
    totalBallHitByOpponent = 0
    for games in allPongGames:
        if games.player1 == str(request.user.id):
            totalBallHit += games.number_ball_touch_player1
            totalPointSet += games.score_player1
            totalPointTaken += games.score_player2
            totalBallHitByOpponent += games.number_ball_touch_player2
        else:
            totalBallHit += games.number_ball_touch_player2
            totalPointSet += games.score_player2
            totalPointTaken += games.score_player1
            totalBallHitByOpponent += games.number_ball_touch_player1

    percentageBallHit = 0
    if totalBallHitByOpponent + totalBallHit != 0:
        percentageBallHit = (totalBallHit / (totalBallHitByOpponent + totalBallHit)) * 100

    return JsonResponse({'currentStreak': currentStreak,
                         'longestWinStreak': longestWinStreak,
                         'longestLoseStreak': longestLoseStreak,
                         'totalPointSet': totalPointSet,
                         'totalPointTaken': totalPointTaken,
                         'totalBallHit': totalBallHit,
                         'percentageBallHit': percentageBallHit})

def getBattlehipClassicGameStats(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allBattleshipGames = BattleshipGameModels.objects.filter(tournamentId='-1').filter(Q(player1=request.user.id) | Q(player2=request.user.id)).order_by('-id')

    classicMatchs = []
    for game in allBattleshipGames:
        gameId = game.id
        if game.player1 == request.user.id:
            player1 = request.user.nickname
        else:
            player1 = User.objects.get(id=game.player1).nickname

        if game.player2 == request.user.id:
            player2 = request.user.nickname
        else:
            player2 = User.objects.get(id=game.player2).nickname

        win = False
        if game.winner == str(request.user.id):
            win = True

        dateGameTab = str(game.time).split(' ')
        dateGame = dateGameTab[0] + ' ' + dateGameTab[1][:5]

        classicMatchs.append({
            'id': str(gameId),
            'player1': player1,
            'player2': player2,
            'win': win,
            'date': dateGame
        })

    return JsonResponse({'classicMatchs': classicMatchs})

def getBattleshipTournamentStats(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allBattleshipTournament = TournamentsModels.objects.filter(tournamentType=1).order_by('-id')
    allTournamentInvolve = []
    for tournament in allBattleshipTournament:
        if str(request.user.id) in tournament.playersId:
            allTournamentInvolve.append(tournament)

    tournamentTab = []
    for tournament in allTournamentInvolve:

        #w3 = Web3(Web3.HTTPProvider('http://' + os.environ.get('IP_NODE') + ':8545'))
        #file = open('/var/blockchain/TranscendenceTournamentHistory.json')
        #jsonFile = json.load(file)
        #abi = jsonFile['abi']

        #contract_address = os.environ.get('CONTRACT_ADDRESS')
        #contract = w3.eth.contract(address=contract_address, abi=abi)

        #winnerId = contract.functions.getWinnerTournament(str(tournament.id)).call()

        winner = User.objects.get(id=int(tournament.winner))
        win = False
        if winner.id == request.user.id:
            win = True

        dateTab = str(tournament.creationTime).split(' ')
        date = dateTab[0] + ' ' + dateTab[1][:5]

        tournamentTab.append({
            'id': str(tournament.id),
            'name': tournament.tournamentsName,
            'winner': winner.nickname,
            'win': win,
            'date': date
        })

    return JsonResponse({'tournaments': tournamentTab})

def getWinrateBattleshipGames(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allBattleshipGames = BattleshipGameModels.objects.filter(tournamentId='-1').filter(Q(player1=request.user.id) | Q(player2=request.user.id)).order_by('-id')
    win = 0
    for games in allBattleshipGames:
        if games.winner == str(request.user.id) and games.tournamentId == '-1':
            win += 1
    winrateGame = None
    if win != 0:
        winrateGame = win / len(allBattleshipGames) * 100
    elif len(allBattleshipGames) != 0:
        winrateGame = 0

    allBattleshipTournament = TournamentsModels.objects.filter(tournamentType=1).order_by('-id')
    allTournamentInvolve = []
    for tournament in allBattleshipTournament:
        if str(request.user.id) in tournament.playersId:
            allTournamentInvolve.append(tournament)
    win = 0
    for tournament in allTournamentInvolve:
        if tournament.winner == str(request.user.id):
            win += 1
    winrateTournament = None
    if win != 0:
        winrateTournament = win / len(allTournamentInvolve) * 100
    elif len(allTournamentInvolve) != 0:
        winrateTournament = 0

    return JsonResponse({'matchs': winrateGame, 'tournament': winrateTournament})

def getOtherBatlleshipStats(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allBattleshipGames = BattleshipGameModels.objects.filter(tournamentId='-1').filter(Q(player1=request.user.id) | Q(player2=request.user.id)).order_by('-id')
    currentStreak = 0
    for games in allBattleshipGames:
        if games.winner == str(request.user.id) and str(games.tournamentId) == '-1':
            if currentStreak != 0 and currentStreak <= 0:
                break
            currentStreak += 1
        elif games.winner != str(request.user.id) and str(games.tournamentId) == '-1':
            if currentStreak != 0 and currentStreak >= 0:
                break
            currentStreak -= 1

    longestWinStreak = 0
    tmpStreak = 0
    for games in allBattleshipGames:
        if games.winner == str(request.user.id) and str(games.tournamentId) == '-1':
            tmpStreak += 1
            if tmpStreak > longestWinStreak:
                longestWinStreak = tmpStreak
        else:
            if tmpStreak > longestWinStreak:
                longestWinStreak = tmpStreak
            tmpStreak = 0

    longestLoseStreak = 0
    tmpStreak = 0
    for games in allBattleshipGames:
        if games.winner != str(request.user.id) and str(games.tournamentId) == '-1':
            tmpStreak += 1
            if tmpStreak > longestLoseStreak:
                longestLoseStreak = tmpStreak
        else:
            if tmpStreak > longestLoseStreak:
                longestLoseStreak = tmpStreak
            tmpStreak = 0

    totalHit = 0
    totalBoatHit = 0
    totalHitTaken = 0
    for games in allBattleshipGames:
        if games.player1 == str(request.user.id):
            totalHit == games.player1_try
            totalBoatHit += games.player1_hit
            totalHitTaken += games.player2_hit
        else:
            totalHit == games.player2_try
            totalBoatHit += games.player2_hit
            totalHitTaken += games.player1_hit

    precision = 0
    if totalHit != 0:
        precision = (totalBoatHit / (totalHit)) * 100

    return JsonResponse({'currentStreak': currentStreak,
                         'longestWinStreak': longestWinStreak,
                         'longestLoseStreak': longestLoseStreak,
                         'totalBoatHit': totalBoatHit,
                         'totalHitTaken': totalHitTaken,
                         'precision': precision})

def getPongSpecificGame(request):
    if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
        if request.method == "POST":
            gameId = request.POST.get('gameId')

            game = PongGameModels.objects.get(id=int(gameId[7:]))
            player1 = User.objects.get(id=int(game.player1))
            player2 = User.objects.get(id=int(game.player2))
            winner = User.objects.get(id=int(game.winner))
            player1_score = game.score_player1
            player2_score = game.score_player2
            player1_number_ball_touch = game.number_ball_touch_player1
            player2_number_ball_touch = game.number_ball_touch_player2

            dateGameTab = str(game.time).split(' ')
            dateGame = dateGameTab[0] + ' ' + dateGameTab[1][:5]

            return JsonResponse({
                'player1': player1.nickname,
                'player2': player2.nickname,
                'winner': winner.nickname,
                'player1_score': player1_score,
                'player2_score': player2_score,
                'player1_number_ball_touch': player1_number_ball_touch,
                'player2_number_ball_touch': player2_number_ball_touch,
                'date': dateGame
            })
    else:
        return JsonResponse({'null': None})



def getBattleshipSpecificGame(request):
    if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
        if request.method == "POST":
            gameId = request.POST.get('gameId')

            print(gameId)

            game = BattleshipGameModels.objects.get(id=int(gameId[13:]))
            player1 = User.objects.get(id=int(game.player1))
            player2 = User.objects.get(id=int(game.player2))
            winner = User.objects.get(id=int(game.winner))
            player1_score = game.player1_hit
            player2_score = game.player2_hit
            #player1_number_ball_touch = game.number_ball_touch_player1
            #player2_number_ball_touch = game.number_ball_touch_player2

            dateGameTab = str(game.time).split(' ')
            dateGame = dateGameTab[0] + ' ' + dateGameTab[1][:5]

            return JsonResponse({
                'player1': player1.nickname,
                'player2': player2.nickname,
                'winner': winner.nickname,
                'player1_score': player1_score,
                'player2_score': player2_score,
                'player1_number_ball_touch': "0",
                'player2_number_ball_touch': "0",
                'date': dateGame
            })
    else:
        return JsonResponse({'null': None})


def getPlayerImage(request):
    if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
        if request.method == "POST":

            gameId = request.POST.get('gameId')
            playerNumber = request.POST.get('player')
            typeGame = request.POST.get('typeGame')

            if typeGame == '0':
                game = PongGameModels.objects.get(id=int(gameId[7:]))
            elif typeGame == '1':
                game = BattleshipGameModels.objects.get(id=int(gameId[13:]))
            else:
                tournamentId = request.POST.get('tournamentId')
                winnerId = TournamentsModels.objects.get(id=int(tournamentId[13:])).winner
                avatar = User.objects.get(id=int(winnerId))
                return HttpResponse(avatar.avatarImage, content_type='image/png')

            if playerNumber == 1:
                avatar = User.objects.get(id=int(game.player1))
            else:
                avatar = User.objects.get(id=int(game.player2))
            return HttpResponse(avatar.avatarImage, content_type='image/png')
    else:
        return JsonResponse({'null': None})

def getTournamentStat(request):
    if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
        if request.method == "POST":
            tournamentId = request.POST.get('tournamentId')

            print(tournamentId)

            game = TournamentsModels.objects.get(id=int(tournamentId[13:]))
            winner = User.objects.get(id=int(game.winner))

            dateGameTab = str(game.creationTime).split(' ')
            dateGame = dateGameTab[0] + ' ' + dateGameTab[1][:5]

            return JsonResponse({
                'winner': winner.nickname,
                'date': dateGame
            })
    else:
        return JsonResponse({'null': None})
