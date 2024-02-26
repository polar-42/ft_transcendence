from django.shortcuts import render
from django.contrib.auth import login, logout
from django.http import JsonResponse
from .models import User
from django.contrib.auth.hashers import make_password, check_password
import json, re
from authApp.models import User
from chatApp.enumChat import connexionStatus
from ft_transcendence import ColorPrint
from ft_transcendence.decorators import isValidLoading

import jwt
import os
from PIL import Image

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

@isValidLoading
def logPage(request):
	if (request.user.is_authenticated == True):
		return render(request, 'index.html')
	else:
		return render(request, 'authApp/login.html')

def UserConnexion(request):
	if (request.method != "POST"):
		# ColorPrint.prRed("Error! Invalid request type")
		return JsonResponse({'error': 'Invalid request type.'})
	if (request.user.is_authenticated == True):
		# ColorPrint.prYellow("Warning! User Already Connected")
		return JsonResponse({'error': 'Already connected.'})
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
	if isPasswordValid:
		if userModel.tfValidated == True:
			token = jwt.encode({"email" : email, "status" : "2FA connexion"}, os.environ.get('DJANGO_KEY'), algorithm='HS256')
			# ColorPrint.prRed(token)
			response = JsonResponse({'TFA' : 'request'})
			response.set_cookie('2FACookie', token, max_age=600, samesite="Strict")
			return response
		else:
			login(request, userModel)
			return JsonResponse({'message': 'Connexion successfull'})
	else:
		return JsonResponse({'error': 'Email or Password is invalid'})

@isValidLoading
def registerPage(request):
	if (request.user.is_authenticated == True):
		return render(request, 'index.html')
	return render(request, 'authApp/register.html')

def UserRegistration(request):
	if (request.method != "POST"):
		# ColorPrint.prRed("Error! Invalid request type")
		return JsonResponse({'error': 'Invalid request type.'})
	if (request.user.is_authenticated == True):
		# ColorPrint.prYellow("Warning! User Already Connected")
		return JsonResponse({'error': 'Already connected.'})
	username = request.POST.get('username')
	email = request.POST.get('email')
	password = request.POST.get('password')
	passwordConfirmation = request.POST.get('passwordConfirmation')
	if request.FILES.get('avatar') != None:
		avatarImage = request.FILES.get('avatar')
	else:
		import io
		img = Image.open("./static/assets/pictures/studs/mjuin.jpg")
		new_img = img.resize((300, 300))
		img_buff = io.BytesIO()
		new_img.save(img_buff, format='JPEG')
		img_buff.seek(0)
		avatarImage = img_buff

	if len(username) == 0 or len(email) == 0 or len(password) == 0 or len(passwordConfirmation) == 0:
		return JsonResponse({'error': 'One of the field is empty'})
	if password != passwordConfirmation:
		return JsonResponse({'error': 'Password do not match'})
	if re.search(r"[\<\>\'\"\{\}\[\]\\\|\(\)\/] ", username) != None or re.search(r"[\<\>\'\"\{\}\[\]\\\|\(\)\/] ", email) != None or ' ' in username or ' ' in email:
		return JsonResponse({'error': 'Invalid character used'})
	if len(username) < 3:
		return JsonResponse({'error': 'Username length is too small'})
	elif len(username) > 16:
		return JsonResponse({'error': 'Username length is too big'})
	if User.objects.filter(nickname=username).exists():
		return JsonResponse({'error': 'This username is already taken'})
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
			avatarImage = avatarImage.read()
			)

	new_obj.save()
	return JsonResponse({'message': 'You registered successfully'})

def disconnect(request):
	if (request.user.is_authenticated):
		logout(request)
		return JsonResponse({'success': True})
	else:
		return JsonResponse({'success': False})
