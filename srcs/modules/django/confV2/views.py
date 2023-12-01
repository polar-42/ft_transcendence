from django.shortcuts import render
import os

def index_view(request):
    return render(request, 'index.html')
def battleship_view(request):
    return render(request, 'game.html')
def dashboard_view(request):
    return render(request, 'dashboard.html')