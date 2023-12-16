import json
from django.http import JsonResponse
from django.shortcuts import render
from .models import TournamentsModels
from .TournamentManager import TournamentsManager

TournamentManager = TournamentsManager()

# Create your views here.
def tournaments_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournamentsHome.html')
	else:
		return render(request, 'index.html')

def tournaments_creation(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournamentsCreation.html')
	else:
		return render(request, 'index.html')

def create_tournaments(request):
	global TournamentManager
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'})
	data = json.loads(request.body)
	tournamentName = data.get('tournamentsName')
	numberOfPlayers = data.get('numberOfPlayers')
	typeGame = data.get('typeGame')
	if len(numberOfPlayers) <= 0:
		return JsonResponse({'message': 'Tournaments number of player cant be empty', 'isCreated': 'false'})

	if len(tournamentName) < 3 or len(tournamentName) > 16:
		return JsonResponse({'message': 'Tournaments name must be a least 3 characters and max 16 characters', 'isCreated': 'false'})

	if (typeGame != "Pong" and typeGame != "Battleship"):
		return JsonResponse({'message': 'Tournaments Type must be a Pong or a Battleship', 'isCreated': 'false'})
	numberOfPlayers = int(numberOfPlayers)
	if numberOfPlayers != 4 and numberOfPlayers != 8 and numberOfPlayers != 16:
		return JsonResponse({'message': 'Tournaments number of player must be a least 4, 8 or 16', 'isCreated': 'false'})

	if (TournamentManager.CreateTournaments(request.user, data) is False):
		return JsonResponse({'message': 'Failed creating game (creator already in lobby)', 'isCreated': 'false'})

	#l = ['player1', 'player2', 'player3']
	#listJson = json.dumps(l)

	obj = TournamentsModels.objects.create(
		tournamentsName=tournamentName,
		numberOfPlayers=numberOfPlayers,
		creatorId=request.user.username,
		privateGame=False,
		description='TOURNOIS',
		tournamentsType=typeGame
	)
	print(type(request.user))

	obj.save()

	print(obj.tournamentsName)

	#jsonDec = json.decoder.JSONDecoder()
	#l = jsonDec.decode(obj.playersId)
	#l.append('player4')
	#listJson = json.dumps(l)

	#obj.playersId = listJson
	#obj.save()
	#print(obj.playersId)

	print(tournamentName, 'is create with', numberOfPlayers, 'players')
	return JsonResponse({'message': 'Tournaments ' + tournamentName + ' is created', 'isCreated': 'true'})

def get_tournaments_html(request):
	tournamentL = TournamentManager.GetTournaments()
	dictionnary = []
	x = 0
	for tour in tournamentL:
		dictionnary.append({
			'index': str(x),
			'name': tour._name,
			'typeGame': tour._typeGame,
			'numberPlayers': len(tour._players),
			'creator': tour._creator.username,
			'private': tour._private,
			'description': tour._desc
		})
		x += 1

	return render(request, 'tournaments/templateTournaments.html', {'games': dictionnary})

def get_tournaments(request):
	tournamentL = TournamentManager.GetTournaments()
	dictionnary = []
	x = 0
	for tour in tournamentL:
		dictionnary.append({
			'index': str(x),
			'name': tour._name,
			'typeGame': tour._typeGame,
			'numberPlayers': len(tour._players),
			'creator': tour._creator.username,
			'private': tour._private,
			'description': tour._desc
		})
		x += 1
	return JsonResponse({'games' : dictionnary})

def join_tournaments(request):
	if request.user.is_authenticated is False:
		return JsonResponse({'error': 'You are not authentiated'})
	if request.method != 'POST':
		return JsonResponse({'error': 'Method is invalid'})

	data = json.loads(request.body)
	tournamentName = data.get('name')
	tournamentsId = data.get('tournamentsId')

	print(request.user, 'is joining', tournamentName)
	if TournamentManager.AddUser(request.user, tournamentName) is False:
		return JsonResponse({'error': 'Error while joining the tournament'})

	return JsonResponse({'message': 'Join the tournaments'})



def view_JoinPage(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournamentsListPage.html')
	else:
		return render(request, 'index.html')
