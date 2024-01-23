from django.shortcuts import render
from django.http import JsonResponse

def game_view(request):
	if (request.method == "GET"):
		return render(request, 'pongGame/pongGameRemote.html')
	else:
		return render(request, 'index.html')

def matchmake_view(request):
	if (request.method == "GET"):
		return render(request, 'pongGame/pongMatchmaking.html')
	else:
		return render(request, 'index.html')

def local_game_view(request):
	if (request.method == "GET"):
		return render(request, 'pongGame/pongGameLocal.html')
	else:
		return render(request, 'index.html')

def ia_game_view(request):
	if (request.method == "GET"):
		return render(request, 'pongGame/pongGameIA.html')
	else:
		return render(request, 'index.html')
