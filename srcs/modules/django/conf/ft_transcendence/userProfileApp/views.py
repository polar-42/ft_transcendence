from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from authApp.models import User
from pongGameApp.models import PongGameModels
from django.db.models import Q
from authApp.models import User
from tournamentsApp.models import TournamentsModels
from battleshipApp.models import BattleshipGameModels
from web3 import Web3
import os, json
from ft_transcendence.decorators import isValidLoading
from chatApp.enumChat import connexionStatus

# Create your views here.
@isValidLoading
def profileView(request):
    if request.user.is_authenticated:
        print('test')
        return render(request, 'userProfileApp/profile.html')
    return render(request, 'index.html')

def getUserInformation(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return JsonResponse({'error': 'error'})

    params = request.GET.get('userid', None)
    if params != None and User.objects.filter(id=params).exists() and request.user.id != params:
        userModel = User.objects.get(id=str(params))
    else:
        return JsonResponse({'error': 'error'})

    if userModel.connexionStatus == connexionStatus.Connected:
        userStatus = 'Online'
    else:
        userStatus = 'Offline'

    return JsonResponse({'userName': userModel.nickname,
                         'userStatus': userStatus})

def getPlayerImage(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return HttpResponse(None, content_type='image/null')

    params = request.GET.get('userid', None)
    if params != None and User.objects.filter(id=params).exists():
        user = User.objects.get(id=str(params))
        return HttpResponse(user.avatarImage, content_type='image/png')
    else:
        return HttpResponse(None, content_type='image/null')
