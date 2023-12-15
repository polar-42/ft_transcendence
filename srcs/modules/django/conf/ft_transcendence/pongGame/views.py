from django.shortcuts import render
from django.http import JsonResponse

def game_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'pongGame/game.html')
	else:
		return render(request, 'index.html')

def matchmake_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'pongGame/pongMatchmaking.html')
	else:
		return render(request, 'index.html')

def local_game_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'pongGame/localPongGame.html')
	else:
		return render(request, 'index.html')

def ia_game_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'pongGame/pongGameIA.html')
	else:
		return render(request, 'index.html')