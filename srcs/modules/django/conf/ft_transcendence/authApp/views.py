from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, FileResponse
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from .management.commands.create_user import getRandString
import json, re, base64, os
from django.core.files.base import ContentFile
from django.conf import settings
from django.http import HttpResponse
from django.db import models
from authApp.models import User

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

def logPage(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		if request.method == "POST":
			data = json.loads(request.body)
			email = data.get('email')
			password = data.get('password')

			if len(email) == 0 or len(password) == 0 :
				return JsonResponse({'error': 'One of the field is empty'})

			if User.objects.filter(email=email).exists() is False:
				return JsonResponse({'error': 'Email or Password is invalid'})
			userModel = User.objects.get(email=email)
			if check_password(password, userModel.password):
				isPasswordValid = True
			else:
				isPasswordValid = False

			print('test', isPasswordValid)
			if isPasswordValid:
				login(request, userModel)
				return JsonResponse({'message': 'Connexion successfull'})
			else:
				return JsonResponse({'error': 'Email or Password is invalid'})
		else:
			return render(request, 'authApp/login.html')
	else:
		return render(request, 'index.html')

def register(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		if request.method == "POST":

			username = request.POST.get('username')
			email = request.POST.get('email')
			password = request.POST.get('password')
			passwordConfirmation = request.POST.get('passwordConfirmation')

			if request.FILES.get('avatar') != None:
				avatarImage = request.FILES.get('avatar')
			else:
				avatarImage = None

			if len(username) == 0 or len(email) == 0 or len(password) == 0 or len(passwordConfirmation) == 0:
				return JsonResponse({'error': 'One of the field is empty'})

			if password != passwordConfirmation:
				return JsonResponse({'error': 'Password do not match'})

			if len(username) < 3:
				return JsonResponse({'error': 'Username length is too small'})
			elif len(username) > 16:
				return JsonResponse({'error': 'Username length is too big'})

			if len(password) < 6:
				return JsonResponse({'error': 'Password length is too small'})

			if re.fullmatch(regex, email) is None:
				return JsonResponse({'error': 'Email is invalid'})

			if User.objects.filter(email=email).exists():
				return JsonResponse({'error': 'Email is already taken'})

			passwordHash = make_password(password)
			new_obj = User.objects.create(
				nickname=username,
				email=email,
				password=passwordHash,
				username=getRandString()
			)

			if avatarImage != None:
				new_obj.avatarImage = avatarImage.read()

			new_obj.save()

			return JsonResponse({'message': 'You registered successfully'})
		else:
			return render(request, 'authApp/register.html')
	else:
		return render(request, 'index.html',)

def socket(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'authApp/testSocket.html')
	else:
		return render(request, 'index.html',)

def disconnect(request):
	if (request.user.is_authenticated):
		logout(request)
		return JsonResponse({'success': True})
	else:
		return JsonResponse({'success': False})


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
    return JsonResponse({'userName': request.user.username})

def getUserID(request):
    return JsonResponse({'userID': request.user.username})

def getAvatarImage(request):
    if request.user.is_authenticated:
        usr = User.objects.get(id=request.user.id)
        if usr.avatarImage is None:
            return HttpResponse(None, content_type='image/null')
        return HttpResponse(usr.avatarImage, content_type='image/png')
