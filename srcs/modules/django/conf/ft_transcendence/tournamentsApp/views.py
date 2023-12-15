import json
from django.http import JsonResponse
from django.shortcuts import render

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
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'})
	data = json.loads(request.body)
	tournamentName = data.get('tournamentsName')
	numberOfPlayers = int(data.get('numberOfPlayers'))

	if len(tournamentName) <= 3:
		return JsonResponse({'message': 'tournament s name must be a least 3 characters', 'isCreated': 'false'})
	if numberOfPlayers != 4 and numberOfPlayers != 8 and numberOfPlayers != 16:
		return JsonResponse({'message': 'tournament s number of player must be a least 4, 8 or 16', 'isCreated': 'false'})


	print(tournamentName, 'is create with', numberOfPlayers, 'players')
	return JsonResponse({'message': 'tournaments is created', 'isCreated': 'true'})
