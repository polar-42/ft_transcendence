from django.shortcuts import render
from django.http import JsonResponse

def game_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'battleshipApp/game.html')
	else:
		return render(request, 'index.html')

def matchmake_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'battleshipApp/matchmake.html')
	else:
		return render(request, 'index.html')
