import os
from django.http import HttpResponse
from django.shortcuts import render
from django.http import JsonResponse
from transcendence.models import User
from transcendence.managers import PongGameManager
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
        new_obj = User.objects.create(username=username, email=email, password=passwordHash, dateInscription=date.today())

        return JsonResponse({'message': 'You registered successfully'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)


def connect_user(request):
    if request.method == 'POST':
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
        return JsonResponse({'error': 'Invalid request method'}, status=400)


def check_connexion(request):
    if request.user.is_authenticated:
        return JsonResponse({'message': 'You are connected!', 'connexionStatus': True})
    else:
        return JsonResponse({'message': 'You are not connected. Please log in.', 'connexionStatus': False})

def check_disconnexion(request):
    if request.user.is_authenticated:
        logout(request)
        return JsonResponse({'message': 'You are now disconnected!'})
    else:
        return JsonResponse({'message': 'You are not connected.'})


def get_data(request):
    data = {'message': 'Information is empty', 'value': 42}
    return JsonResponse(data)


#TEST PONG GAME

pong_game_manager = PongGameManager()

def create_game_view(request):
    player1 = request.POST.get('player1')
    player2 = request.POST.get('player2')

    # Create a game using the PongGameManager
    game_id = f'game_{len(pong_game_manager.get_all_games()) + 1}'
    game = pong_game_manager.create_game(game_id, player1, player2)

    return JsonResponse({'game': game})

def get_all_games_view(request):
    # Retrieve all games using the PongGameManager
    games = pong_game_manager.get_all_games()

    return JsonResponse({'games': games})

def get_game_view(request, game_id):
    # Retrieve the game using the PongGameManager
    game = pong_game_manager.get_game(game_id)

    if game:
        return JsonResponse({'game': game})
    else:
        return JsonResponse({'error': 'Game not found'}, status=404)

def delete_game_view(request, game_id):
    # Delete the game using the PongGameManager
    pong_game_manager.delete_game(game_id)

    return JsonResponse({'message': 'Game deleted'})
