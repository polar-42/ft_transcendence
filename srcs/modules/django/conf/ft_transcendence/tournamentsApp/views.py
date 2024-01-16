import json
from django.http import JsonResponse
from django.shortcuts import render
from .models import TournamentsModels
from . import TournamentManager

from .EnumClass import TournamentState, UserState

# Create your views here.
def Home_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournamentsHome.html')
	else:
		return render(request, 'index.html')

def CreationViews(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournamentsCreation.html')
	else:
		return render(request, 'index.html')

def create_tournament(request):
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'})
	data = json.loads(request.body)
	tournamentName = data.get('tournamentsName')
	numberOfPlayers = data.get('numberOfPlayers')
	typeGame = data.get('typeGame')
	if len(numberOfPlayers) <= 0:
		return JsonResponse({'message': 'Tournaments number of player cant be empty', 'isCreated': False})

	if len(tournamentName) < 3 or len(tournamentName) > 16:
		return JsonResponse({'message': 'Tournaments name must be a least 3 characters and max 16 characters', 'isCreated': False})

	if (typeGame != "Pong" and typeGame != "Battleship"):
		return JsonResponse({'message': 'Tournaments Type must be a Pong or a Battleship', 'isCreated': False})
	numberOfPlayers = int(numberOfPlayers)
	if numberOfPlayers < 4:
		return JsonResponse({'message': 'Tournaments number of player must be a least 4, 8 or 16', 'isCreated': False})
	Joined, id = TournamentManager.Manager.CreateTournament(request.user, data)
	if (Joined is False):
		return JsonResponse({'message': 'Failed creating game (creator already in lobby)', 'isCreated': False})

	print(tournamentName, 'is create with', numberOfPlayers, 'players')
	return JsonResponse({'message': 'Tournaments ' + tournamentName + ' is created', 'isCreated': True, 'id' : id})

def get_tournaments_html(request):
	tournamentL = TournamentManager.Manager.GetTournaments()
	dictionnary = []
	for tour in tournamentL.values():
			Joinable = 'NotJoinable'
			usr = tour.GetUserById(request.user.id)
			if (tour.Status is TournamentState.Created and len(tour.PlayersList) != tour.PlayerAmount):
				Joinable = 'Joinable'
			elif (tour.Status is not TournamentState.Created and usr is not None and usr.Status is not UserState.Dead and usr.Status is not UserState.GivedUp):
				Joinable = 'Joinable'
			dictionnary.append({
				'index': tour.TournamentId,
				'name': tour.TournamentName,
				'typeGame': tour.Type,
				'numberPlayers': len(tour.PlayersList),
				'creator': tour.Administrator.Username,
				'private': tour.Visibility,
				'description': tour.Description,
				'joinable' : Joinable
			})

	return render(request, 'tournaments/templateTournaments.html', {'games': dictionnary})

def get_tournaments(request):
	tournamentL = TournamentManager.Manager.GetTournaments()
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

	# messageAddUser, isJoin, canJoin = TournamentManager.Manager.canJoin(request.user, tournamentsId)
	# if isJoin is False:
		# return JsonResponse({'error': messageAddUser, 'canJoin': True})
	return JsonResponse({'message': "", 'canJoin': True})

def view_JoinPage(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournamentsListPage.html')
	else:
		return render(request, 'index.html')

def Tournament_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournament.html')
	else:
		return render(request, 'index.html')

def get_tournaments_manager():
	return TournamentManager.Manager
