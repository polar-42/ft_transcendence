from django.shortcuts import render
from django.http import JsonResponse
from ft_transcendence.decorators import isValidLoading
from ft_transcendence import ColorPrint

@isValidLoading
def game_view(request):
	if (request.method == "GET"):
		return render(request, 'battleshipApp/game.html')
	else:
		return render(request, 'index.html')

@isValidLoading
def matchmake_view(request):
	if (request.method == "GET"):
		return render(request, 'battleshipApp/matchmake.html')
	else:
		return render(request, 'index.html')
