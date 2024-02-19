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
from ft_transcendence import ColorPrint

def dashboardView(request):
	if request.user.is_authenticated:
		return render(request, 'dashboardApp/dashboard.html')
	return render(request, 'index.html')

def getPongClassicGameStats(request):
	if request.user.is_authenticated is False or request.method != 'GET':
		return render(request, 'index.html')

	params = request.GET.get('userid', None)
	if params != None and User.objects.filter(id=params).exists():
		userId = User.objects.get(id=str(params)).id
	else:
		userId = request.user.id

	allPongGames = PongGameModels.objects.filter(tournamentId='-1').filter(Q(player1=userId) | Q(player2=userId)).order_by('-id')

	classicMatchs = []
	for game in allPongGames:
		gameId = game.id
		if game.player1 == userId:
			player1 = request.user.nickname
		elif game.player1 != 'AI':
			player1 = User.objects.get(id=game.player1).nickname
		else:
			player1 = 'AI'

		if game.player2 == userId:
			player2 = request.user.nickname
		elif game.player2 != 'AI':
			player2 = User.objects.get(id=game.player2).nickname
		else:
			player2 = 'AI'

		win = False
		if game.winner == str(userId):
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


	params = request.GET.get('userid', None)
	if params != None and User.objects.filter(id=params).exists():
		userId = User.objects.get(id=str(params)).id
	else:
		userId = request.user.id

	allPongTournament = TournamentsModels.objects.filter(tournamentType=0).order_by('-id')
	allTournamentInvolve = []
	for tournament in allPongTournament:
		if tournament.playersId is not None and str(userId) in tournament.playersId:
			allTournamentInvolve.append(tournament)

	tournamentTab = []
	for tournament in allTournamentInvolve:

		w3 = Web3(Web3.HTTPProvider('http://' + os.environ.get('IP_NODE') + ':8545'))
		file = open('/var/blockchain/TranscendenceTournamentHistory.json')
		jsonFile = json.load(file)
		abi = jsonFile['abi']

		contract_address = os.environ.get('CONTRACT_ADDRESS')
		contract = w3.eth.contract(address=contract_address, abi=abi)

		winnerId = contract.functions.getWinnerTournament(str(tournament.id)).call()

		winner = User.objects.get(id=tournament.winner)
		win = False
		if winner.id == userId:
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


	params = request.GET.get('userid', None)
	if params != None and User.objects.filter(id=params).exists():
		userId = User.objects.get(id=str(params)).id
	else:
		userId = request.user.id

	allPongGames = PongGameModels.objects.filter(tournamentId='-1').filter(Q(player1=userId) | Q(player2=userId)).order_by('-id')
	win = 0
	for games in allPongGames:
		if games.winner == str(userId) and str(games.tournamentId) == '-1':
			win += 1
	winrateGame = None
	if win != 0:
		winrateGame = win / len(allPongGames) * 100
	elif len(allPongGames) != 0:
		winrateGame = 0

	allPongTournament = TournamentsModels.objects.filter(tournamentType=0).order_by('-id')
	allTournamentInvolve = []
	for tournament in allPongTournament:
		if tournament.playersId is not None and str(userId) in tournament.playersId:
			allTournamentInvolve.append(tournament)
	win = 0
	for tournament in allTournamentInvolve:
		if tournament.winner == str(userId):
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


	params = request.GET.get('userid', None)
	if params != None and User.objects.filter(id=params).exists():
		userId = User.objects.get(id=str(params)).id
	else:
		userId = request.user.id

	userModel = User.objects.get(id=int(userId))

	allPongGames = PongGameModels.objects.filter(tournamentId='-1').filter(Q(player1=userId) | Q(player2=userId)).order_by('-id')
	currentStreak = 0
	for games in allPongGames:
		if games.winner == str(userId) and str(games.tournamentId) == '-1':
			if currentStreak != 0 and currentStreak <= 0:
				break
			currentStreak += 1
		elif games.winner != str(userId) and str(games.tournamentId) == '-1':
			if currentStreak != 0 and currentStreak >= 0:
				break
			currentStreak -= 1

	longestWinStreak = 0
	tmpStreak = 0
	for games in allPongGames:
		if games.winner == str(userId) and str(games.tournamentId) == '-1':
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
		if games.winner != str(userId) and str(games.tournamentId) == '-1':
			tmpStreak += 1
			if tmpStreak > longestLoseStreak:
				longestLoseStreak = tmpStreak
		else:
			if tmpStreak > longestLoseStreak:
				longestLoseStreak = tmpStreak
			tmpStreak = 0

	totalPointSet = userModel.Pong_Point
	totalPointTaken = userModel.Pong_PointTaken
	totalBallHit = userModel.Pong_BallHit
	totalBallHitByOpponent = userModel.Pong_BallHitByOpponent
	totalWin = userModel.Pong_Win
	totalLose = userModel.Pong_Lose
	totalGame = userModel.Pong_Game
	vsAI = int(userModel.Pong_Versus_AI)

	if vsAI > 0:
		statusAI = "Yes"
	elif vsAI < 0:
		statusAI = "No"
	else:
		statusAI = "It depends"

	percentageBallHit = 0
	if totalPointTaken + totalBallHit != 0:
		percentageBallHit = (totalBallHit / (totalBallHit + totalPointTaken)) * 100

	return JsonResponse({'currentStreak': currentStreak,
					  'longestWinStreak': longestWinStreak,
					  'longestLoseStreak': longestLoseStreak,
					  'totalPointSet': totalPointSet,
					  'totalPointTaken': totalPointTaken,
					  'totalBallHit': totalBallHit,
					  'totalBallHitByOpponent': totalBallHitByOpponent,
					  'totalWin': totalWin,
					  'totalLose': totalLose,
					  'totalGame': totalGame,
					  'statusAI': statusAI,
					  'percentageBallHit': round(percentageBallHit, 2)
					  })

def getBattlehipClassicGameStats(request):
	if request.user.is_authenticated is False or request.method != 'GET':
		return render(request, 'index.html')


	params = request.GET.get('userid', None)
	if params != None and User.objects.filter(id=params).exists():
		userId = User.objects.get(id=str(params)).id
	else:
		userId = request.user.id

	allBattleshipGames = BattleshipGameModels.objects.filter(tournamentId='-1').filter(Q(player1=userId) | Q(player2=userId)).order_by('-id')

	classicMatchs = []
	for game in allBattleshipGames:
		gameId = game.id
		if game.player1 == userId:
			player1 = request.user.nickname
		else:
			player1 = User.objects.get(id=game.player1).nickname

		if game.player2 == userId:
			player2 = request.user.nickname
		else:
			player2 = User.objects.get(id=game.player2).nickname

		win = False
		if game.winner == str(userId):
			win = True

		dateGameTab = str(game.time).split(' ')
		dateGame = dateGameTab[0] + ' ' + dateGameTab[1][:5]

		classicMatchs.append({
			'id': str(gameId),
			'player1': player1,
			'player2': player2,
			'player1_score': game.player1_hit,
			'player2_score': game.player2_hit,
			'win': win,
			'date': dateGame
			})

	return JsonResponse({'classicMatchs': classicMatchs})

def getBattleshipTournamentStats(request):
	if request.user.is_authenticated is False or request.method != 'GET':
		return render(request, 'index.html')


	params = request.GET.get('userid', None)
	if params != None and User.objects.filter(id=params).exists():
		userId = User.objects.get(id=str(params)).id
	else:
		userId = request.user.id

	allBattleshipTournament = TournamentsModels.objects.filter(tournamentType=1).order_by('-id')
	allTournamentInvolve = []
	for tournament in allBattleshipTournament:
		if tournament.playersId is not None and str(userId) in tournament.playersId:
			allTournamentInvolve.append(tournament)

	tournamentTab = []
	for tournament in allTournamentInvolve:

		w3 = Web3(Web3.HTTPProvider('http://' + os.environ.get('IP_NODE') + ':8545'))
		file = open('/var/blockchain/TranscendenceTournamentHistory.json')
		jsonFile = json.load(file)
		abi = jsonFile['abi']

		contract_address = os.environ.get('CONTRACT_ADDRESS')
		contract = w3.eth.contract(address=contract_address, abi=abi)

		winnerId = contract.functions.getWinnerTournament(str(tournament.id)).call()

		winner = User.objects.get(id=int(tournament.winner))
		win = False
		if winner.id == userId:
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


	params = request.GET.get('userid', None)
	if params != None and User.objects.filter(id=params).exists():
		userId = User.objects.get(id=str(params)).id
	else:
		userId = request.user.id

	allBattleshipGames = BattleshipGameModels.objects.filter(tournamentId='-1').filter(Q(player1=userId) | Q(player2=userId)).order_by('-id')
	win = 0
	for games in allBattleshipGames:
		if games.winner == str(userId) and games.tournamentId == '-1':
			win += 1
	winrateGame = None
	if win != 0:
		winrateGame = win / len(allBattleshipGames) * 100
	elif len(allBattleshipGames) != 0:
		winrateGame = 0

	allBattleshipTournament = TournamentsModels.objects.filter(tournamentType=1).order_by('-id')
	allTournamentInvolve = []
	for tournament in allBattleshipTournament:
		ColorPrint.prRed('tournament : {tour}'.format(tour=tournament))
		if tournament.playersId is not None and str(userId) in tournament.playersId:
			allTournamentInvolve.append(tournament)
	win = 0
	for tournament in allTournamentInvolve:
		if tournament.winner == str(userId):
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


	params = request.GET.get('userid', None)
	if params != None and User.objects.filter(id=params).exists():
		userId = User.objects.get(id=str(params)).id
	else:
		userId = request.user.id

	userModel = User.objects.get(id=int(userId))

	allBattleshipGames = BattleshipGameModels.objects.filter(tournamentId='-1').filter(Q(player1=userId) | Q(player2=userId)).order_by('-id')
	currentStreak = 0
	for games in allBattleshipGames:
		if games.winner == str(userId) and str(games.tournamentId) == '-1':
			if currentStreak != 0 and currentStreak <= 0:
				break
			currentStreak += 1
		elif games.winner != str(userId) and str(games.tournamentId) == '-1':
			if currentStreak != 0 and currentStreak >= 0:
				break
			currentStreak -= 1

	longestWinStreak = 0
	tmpStreak = 0
	for games in allBattleshipGames:
		if games.winner == str(userId) and str(games.tournamentId) == '-1':
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
		if games.winner != str(userId) and str(games.tournamentId) == '-1':
			tmpStreak += 1
			if tmpStreak > longestLoseStreak:
				longestLoseStreak = tmpStreak
		else:
			if tmpStreak > longestLoseStreak:
				longestLoseStreak = tmpStreak
			tmpStreak = 0

	totalShoot = userModel.BS_Bullets
	totalMiss = userModel.BS_E_Miss
	totalHitGive = userModel.BS_E_Hit
	totalHitTake = userModel.BS_P_Hit
	totalBoatDestroy = userModel.BS_E_BoatsDestroyed
	totalBoatGetDestroy = userModel.BS_P_BoatsDestroyed
	totalGame = userModel.BS_GameCount

	precision = 0
	if totalShoot != 0:
		precision = (totalHitGive / (totalShoot)) * 100

	return JsonResponse({'currentStreak': currentStreak,
					  'longestWinStreak': longestWinStreak,
					  'longestLoseStreak': longestLoseStreak,
					  'totalShoot': totalShoot,
					  'totalMiss': totalMiss,
					  'totalHitGive': totalHitGive,
					  'totalHitTake': totalHitTake,
					  'totalBoatDestroy': totalBoatDestroy,
					  'totalBoatGetDestroy': totalBoatGetDestroy,
					  'totalGame': totalGame,
					  'precision': round(precision, 2)
					  })

def getPongSpecificGame(request):
	if request.method == "POST":
		data = json.loads(request.body)
		ColorPrint.prRed(data['gameId'])		
		game = PongGameModels.objects.get(id=data['gameId'])
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
			'player1_id': player1.id,
			'player2_id': player2.id,
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
			data = json.loads(request.body)
			game = BattleshipGameModels.objects.get(id=int(data['gameId']))
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
				'player1_id': player1.id,
				'player2_id': player2.id,
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
			data = json.loads(request.body)	
			if data['typeGame'] == '0':
				game = PongGameModels.objects.get(id=data['gameId'])
			elif data['typeGame'] == '1':
				game = BattleshipGameModels.objects.get(id=data['gameId'])
			else:
				tournamentId = request.POST.get('tournamentId')
				winnerId = TournamentsModels.objects.get(id=int(tournamentId[13:])).winner
				avatar = User.objects.get(id=int(winnerId))
				return HttpResponse(avatar.avatarImage, content_type='image/png')

			if data['playerNumber'] == '1':
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

			ColorPrint.prLGreen(tournamentId)
			game = TournamentsModels.objects.get(id=int(tournamentId[13:]))
			winner = User.objects.get(id=int(game.winner))
			playersId = game.playersId
			players = []

			for player in playersId:
				players.append(User.objects.get(id=int(player)).nickname)

			dateGameTab = str(game.creationTime).split(' ')
			dateGame = dateGameTab[0] + ' ' + dateGameTab[1][:5]

			return JsonResponse({
				'players': players,
				'description': game.description,
				'winner': winner.nickname,
				'winner_id': winner.id,
				'date': dateGame
				})
	else:
		return JsonResponse({'null': None})

def getPongStatHtml(request):
	ColorPrint.prRed(request.method)
	if (request.method == "GET"):
		return render(request, 'dashboardApp/pongStats.html')
	raise Exception('Invalid Request Method')

def getBattleshipStatHtml(request):
	if (request.method == "GET"):
		return render(request, 'dashboardApp/battleshipStats.html')
	raise Exception('Invalid Request Method')

