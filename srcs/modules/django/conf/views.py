import os
from django.shortcuts import render
from django.http import JsonResponse
from transcendence.models import User
from datetime import date
from django.contrib.auth.hashers import make_password, check_password
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
import json
import re

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

def index_view(request):
    return render(request, os.environ.get('APP_NAME') + '/index.html')

def create_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        passwordConfirmation = data.get('passwordConfirmation')

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
        new_obj = User.objects.create(username=username, email=email, password=passwordHash, dateInscription=date.today())

        return JsonResponse({'message': 'You registered successfully'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)


def connect_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Connexion successfull'})
        else:
            return JsonResponse({'error': 'Username or Password is invalid'})

        #try:
        #    user = User.objects.get(username=username)

        #    if check_password(password, user.password):
        #        return JsonResponse({'message': 'Connexion successfull'})
        #    else:
        #        return JsonResponse({'message': 'Username or Password is invalid'})
        #except User.DoesNotExist:
        #    return JsonResponse({'error': 'Username or Password is invalid'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

#def check_connexion(request):

def check_connexion(request):
    if request.user.is_authenticated:
        return JsonResponse({'message': 'You are connected!'})
    else:
        return JsonResponse({'message': 'You are not connected. Please log in.'})

def check_disconnexion(request):
    if request.user.is_authenticated:
        logout(request)
        return JsonResponse({'message': 'You are now disconnected!'})
    else:
        return JsonResponse({'message': 'You are not connected.'})


def get_data(request):
    data = {'message': 'Information is empty', 'value': 42}
    return JsonResponse(data)
