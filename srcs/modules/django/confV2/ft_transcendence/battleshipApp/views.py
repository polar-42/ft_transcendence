from django.shortcuts import render
from django.http import JsonResponse

def game_view(request):
	print("test1")
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'battleshipApp/game.html')
	else:
		return render(request, 'index.html')
	
def leave_matchmaking(request):
	print("test3")
	if (request.method != 'GET' or request.user.is_authenticated == False):
		return JsonResponse({'success': False})
	if (matchmaking.removeUser(request.user) == True):
		return JsonResponse({'success': True})
	return JsonResponse({'success': False})

def matchmake_view(request):
	print("test4")
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'battleshipApp/matchmake.html')
	else:
		return render(request, 'index.html')
