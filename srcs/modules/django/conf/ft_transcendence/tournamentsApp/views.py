import json
from django.http import JsonResponse
from django.shortcuts import render
from .models import TournamentsModels
from . import T_Manager

from .T_Enum import TournamentState, UserState

from ft_transcendence.decorators import isValidLoading
from ft_transcendence import ColorPrint

# Create your views here.
@isValidLoading
def Home_view(request):
	if (request.method == "GET"):
		return render(request, 'tournaments/tournamentsHome.html')
	else:
		return render(request, 'index.html')

@isValidLoading
def CreationViews(request):
	if (request.method == "GET"):
		return render(request, 'tournaments/tournamentsCreation.html')
	else:
		return render(request, 'index.html')

def create_tournament(request):
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'})
	data = json.loads(request.body)
	tournamentName = data.get('tournamentsName')
	tournamentsDescription = data.get('tournamentsDescription')
	ColorPrint.prYellow(tournamentsDescription)
	numberOfPlayers = data.get('numberOfPlayers')
	typeGame = data.get('typeGame')
	if len(numberOfPlayers) <= 0:
		return JsonResponse({'message': 'Tournaments number of player cant be empty', 'isCreated': False})

	if len(tournamentName) < 3 or len(tournamentName) > 16:
		return JsonResponse({'message': 'Tournaments name must be a least 3 characters and max 16 characters', 'isCreated': False})

	if (typeGame != "Pong" and typeGame != "Battleship"):
		return JsonResponse({'message': 'Tournaments Type must be a Pong or a Battleship', 'isCreated': False})
	numberOfPlayers = int(numberOfPlayers)
	if numberOfPlayers != 4 and numberOfPlayers != 8 and numberOfPlayers != 16 and numberOfPlayers != 32 and numberOfPlayers != 64:
		return JsonResponse({'message': 'Tournaments number of player must be a least 4, 8 or 16', 'isCreated': False})
	Joined, TourId = T_Manager.Manager.CreateTournament(request.user, data)
	if (Joined is False):
		return JsonResponse({'message': 'Failed creating game (creator already in lobby)', 'isCreated': False})

	print(tournamentName, 'tournament for', typeGame,'is create with', numberOfPlayers, 'players')
	return JsonResponse({'message': 'Tournaments ' + tournamentName + ' is created', 'isCreated': True, 'id' : TourId})

def get_tournaments_html(request):
	tournamentL = T_Manager.Manager.GetTournaments()
	dictionnary = []
	for tour in tournamentL.values():
		Joinable = 'NotJoinable'
		usr = tour.GetUserById(request.user.id)
		if (tour.Status is TournamentState.Created and len(tour.PlayersList) != tour.PlayerAmount):
			Joinable = 'Joinable'
		elif (tour.Status is not TournamentState.Created and usr is not None and usr.Status is not UserState.Dead and usr.Status is not UserState.GivedUp):
			Joinable = 'Joinable'
		if tour.Type == 0:
			gameTypeUrl = '../static/assets/logo/ping-pong.png'
		else:
			gameTypeUrl = '../static/assets/logo/battleship.png'
		dictionnary.append({
			'index': tour.TournamentId,
			'name': tour.TournamentName,
			'typeGame': gameTypeUrl,
			'numberPlayers': len(tour.PlayersList),
			'creator': tour.Administrator.Username,
			'private': tour.Visibility,
			'description': tour.Description,
			'joinable' : Joinable
			})

	return render(request, 'tournaments/templateTournamentList.html', {'games': dictionnary})

def get_match_html(request):
	if (request.method != 'GET'):
		return JsonResponse({'error': 'Invalid request method'})
	return render(request, 'tournaments/templateBracketMatch.html')

@isValidLoading
def TournamentSpectateView(request):
	if (request.method == "GET"):
		return render(request, 'tournaments/tournamentView.html')
	else:
		return render(request, 'index.html')

def GetTournamentData(request):
	if request.method != "POST":
		return JsonResponse({'error': 'Method is invalid'})
	data = json.loads(request.body)
	tournamentId = int(data.get('tourID'))
	print("Tournament ID = ", tournamentId)
	print("Type of TOurnament ID = ", type(tournamentId))
	Tournament = T_Manager.Manager.GetTournament(tournamentId)
	if (Tournament is None):
		return JsonResponse({'error': 'Invalid Tournament ID'})
	UserMSG = Tournament.GetUsersList()
	MatchMSG = Tournament.GetMatchList()
	ColorPrint.prRed(Tournament.TournamentName)
	ColorPrint.prRed(Tournament.Type)
	return JsonResponse({ "tournamentName" : Tournament.TournamentName, 
					  "tournamentType" : Tournament.Type, 
					  "tournamentDescription": Tournament.Description,
					  "numberPlayers": Tournament.PlayerAmount,
					  "users" : UserMSG, 
					  "matchs" : 'None' if MatchMSG is None else MatchMSG
					  })

def get_tournaments(request):
	tournamentL = T_Manager.Manager.GetTournaments()
	dictionnary = []
	x = 0
	for tour in tournamentL:
		dictionnary.append({
			'index': str(x),
			'name': tour._name,
			'typeGame': tour._typeGame,
			'numberPlayers': len(tour._players),
			'creator': tour._creator.sock_user.username,
			'private': tour._private,
			'description': tour._desc
			})
		x += 1
	return JsonResponse({'games' : dictionnary})

def join_tournaments(request):
	if request.user.is_authenticated is False:
		return JsonResponse({'error': 'You are not authentiated', 'canJoin': False})
	if request.method != 'POST':
		return JsonResponse({'error': 'Method is invalid', 'canJoin': False})

	data = json.loads(request.body)
	tournamentsId = data.get('tournamentsId')

	print(request.user, 'is trying yo join tournament number', tournamentsId)

	# messageAddUser, isJoin, canJoin = T_Manager.Manager.canJoin(request.user, tournamentsId)
	# if isJoin is False:
	# 	return JsonResponse({'error': messageAddUser, 'canJoin': True})
	return JsonResponse({'message': "", 'canJoin': True})

@isValidLoading
def view_JoinPage(request):
	if (request.method == "GET"):
		return render(request, 'tournaments/tournamentsListPage.html')
	else:
		return render(request, 'index.html')

@isValidLoading
def Tournament_view(request):
	if (request.method == "GET"):
		return render(request, 'tournaments/tournament.html')
	else:
		return render(request, 'index.html')

def get_tournaments_manager():
	return T_Manager.Manager
