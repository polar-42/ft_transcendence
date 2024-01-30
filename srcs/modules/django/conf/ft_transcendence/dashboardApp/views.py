import json, re, base64, os
from django.shortcuts import render
from django.http import JsonResponse, FileResponse
from authApp.models import User
from django.http import HttpResponse
from pongGameApp.models import PongGameModels
from django.db.models import Q
from authApp.models import User
from tournamentsApp.models import TournamentsModels

def dashboardView(request):
    if request.user.is_authenticated:
        return render(request, 'dashboardApp/dashboard.html')
    return render(request, 'index.html')

def getPongClassicGameStats(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allPongGames = PongGameModels.objects.filter(Q(tournamentId='-1')).filter(Q(player1=request.user.id) | Q(player2=request.user.id)).order_by('-id')

    classicMatchs = []
    for game in allPongGames:
        if game.player1 == request.user.id:
            player1 = request.user.nickname
        elif game.player1 != 'AI':
            player1 = User.objects.get(id=game.player1).nickname
        else:
            player1 = 'AI'

        if game.player2 == request.user.id:
            player2 = request.user.nickname
        elif game.player2 != 'AI':
            player2 = User.objects.get(id=game.player2).nickname
        else:
            player2 = 'AI'

        win = False
        if game.winner == str(request.user.id):
            win = True

        dateGameTab = str(game.time).split(' ')
        dateGame = dateGameTab[0] + ' ' + dateGameTab[1][:5]

        classicMatchs.append({
            'player1': player1,
            'player2': player2,
            'win': win,
            'player1_score': game.score_player1,
            'player2_score': game.score_player2,
            'date': dateGame
        })

    return JsonResponse({'classicMatchs': classicMatchs})

def getPongTournamentStats(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allPongTournament = TournamentsModels.objects.filter(tournamentType=0).order_by('-id')
    allTournamentInvolve = []
    for tournament in allPongTournament:
        if str(request.user.id) in tournament.playersId:
            allTournamentInvolve.append(tournament)

    tournamentTab = []
    for tournament in allTournamentInvolve:
        winner = User.objects.get(id=tournament.winner)
        win = False
        if winner.id == request.user.id:
            win = True

        dateTab = str(tournament.creationTime).split(' ')
        date = dateTab[0] + ' ' + dateTab[1][:5]

        tournamentTab.append({
            'name': tournament.tournamentsName,
            'winner': winner.nickname,
            'win': win,
            'date': date
        })

    return JsonResponse({'tournaments': tournamentTab})

def getWinratePongGames(request):
    if request.user.is_authenticated is False or request.method != 'GET':
        return render(request, 'index.html')

    allPongGames = PongGameModels.objects.filter(Q(player1=request.user.id) | Q(player2=request.user.id)).order_by('-id')
    win = 0
    for games in allPongGames:
        if games.winner == str(request.user.id) and games.tournamentId != '-1':
            win += 1
    winrateGame = 0
    if win != 0:
        winrateGame = win / len(allPongGames) * 100

    allPongTournament = TournamentsModels.objects.filter(tournamentType=0).order_by('-id')
    allTournamentInvolve = []
    for tournament in allPongTournament:
        if str(request.user.id) in tournament.playersId:
            allTournamentInvolve.append(tournament)
    win = 0
    for tournament in allTournamentInvolve:
        if tournament.winner == str(request.user.id):
            win += 1
    winrateTournament = 0
    if win != 0:
        winrateTournament = win / len(allTournamentInvolve) * 100

    return JsonResponse({'matchs': winrateGame, 'tournament': winrateTournament})
