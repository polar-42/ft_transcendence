from django.http import JsonResponse, HttpResponse
from .models import User
from chatApp.models import ChannelModels
from ft_transcendence import ColorPrint
	
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
    print(request.user.id)
    return JsonResponse({'userID': request.user.id})

def getAvatarImage(request):
    if request.user.is_authenticated:
        paramType = request.GET.get('type', None)
        if paramType == 'channel':
            print('TO DO')
            channelName = request.GET.get('userId', None)
            if ChannelModels.objects.filter(channelName=channelName).exists() is False:
                return HttpResponse(None, content_type='image/null')
            avatarChan = ChannelModels.objects.get(channelName=channelName).channelPicture
            if avatarChan is None:
                return HttpResponse(None, content_type='image/null')
            return HttpResponse(avatarChan, content_type='image/png')
        else:
            userId = request.GET.get('userId', None)
            ColorPrint.prRed('userId {id}'.format(id=userId))
            if userId == 'self':
                userId = request.user.id
            if User.objects.filter(id=userId).exists() is False:
                return HttpResponse(None, content_type='image/null')

            avatarImage = User.objects.get(id=userId).avatarImage
            if avatarImage == None:
                return HttpResponse(None, content_type='image/null')
            return HttpResponse(avatarImage, content_type='image/png')
    else:
        return HttpResponse(None, content_type='image/null')

def Get2FaStatus(request):
	if request.user.is_authenticated == False:
		return JsonResponse({'error': 'User not authenticated'})
	usr = User.objects.get(id=request.user.id)
	return JsonResponse({'status': True if (usr.tfValidated == True) else False})
