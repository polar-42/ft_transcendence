from django.http import JsonResponse, HttpResponse
from .models import User

def check_connexion(request):
    if (request.user.is_authenticated):
        return JsonResponse({'connexionStatus': True})
    else:
        return JsonResponse({'connexionStatus': False})

def getUserName(request):
    if request.user.is_authenticated:
        return JsonResponse({'userName': request.user.nickname})
    else:
        return JsonResponse({'userName': 'LOG IN'})

def getUserID(request):
    print(request)
    print(request.user.identification)
    return JsonResponse({'userID': request.user.identification})

def getAvatarImage(request):
    if request.user.is_authenticated:
        usr = User.objects.get(id=request.user.id)
        if usr.avatarImage is None:
            return HttpResponse(None, content_type='image/null')
        return HttpResponse(usr.avatarImage, content_type='image/png')

def Get2FaStatus(request):
	if request.user.is_authenticated == False:
		return JsonResponse({'error': 'User not authenticated'})
	usr = User.objects.get(id=request.user.id)
	return JsonResponse({'status': True if (usr.tfValidated == True) else False})