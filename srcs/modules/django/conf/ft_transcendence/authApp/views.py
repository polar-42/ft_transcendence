from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from .models import User
from django.contrib.auth.hashers import make_password
from .management.commands.create_user import getRandString
import json, re

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

def logPage(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		if request.method == "POST":
			data = json.loads(request.body)
			username = data.get('username')
			password = data.get('password')

			if len(username) == 0 or len(password) == 0 :
				return JsonResponse({'error': 'One of the field is empty'})

			user = authenticate(request, username=username, password=password)

			if user is not None:
				login(request, user)
				return JsonResponse({'message': 'Connexion successfull'})
			else:
				return JsonResponse({'error': 'Username or Password is invalid'})
		else:
			return render(request, 'authApp/login.html')
	else:
		return render(request, 'index.html')

def register(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		if request.method == "POST":
			data = json.loads(request.body)
			username = data.get('username')
			email = data.get('email')
			password = data.get('password')
			passwordConfirmation = data.get('passwordConfirmation')

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

			if User.objects.filter(username=username).exists():
				return JsonResponse({'error': 'Username is already taken'})

			passwordHash = make_password(password)
			new_obj = User.objects.create(
				username=username,
				email=email,
				password=passwordHash,
				identification=getRandString(username)
			)

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
