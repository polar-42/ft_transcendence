from authApp.models import User
from django.db import models
from django.db.models import Q 
from ft_transcendence import ColorPrint
from django.http import HttpResponse, JsonResponse

def getAllUsers(request):
	if (request.method != "GET"):
		ColorPrint.prRed("Error! Invalid request type")
		return JsonResponse({'error': 'Invalid request type.'})

	query = User.objects.all().exclude(Q(identification='AI') | Q(identification=request.user))
	usrList = []
	for usr in query:
		name = usr.nickname
		id = usr.identification
		usrList.append({'name': name, 'id':id})
	

	return  JsonResponse(usrList, safe=False)
