from django.shortcuts import render

def game_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'battleshipApp/game.html')
	else:
		return render(request, 'index.html')