from django.shortcuts import render
import os

def index_view(request):
    return render(request, 'index.html')

def homepage_view(request):
	if (request.method == "GET"):
		return render(request, 'homepage.html')
	else:
		return render(request, 'index.html')
def PNF_view(request):
	if (request.method == "GET"):
		return render(request, '404.html')
	else:
		return render(request, 'index.html')
def NeedLog_view(request):
	if (request.method == "GET"):
		return render(request, 'needlog.html')
	else:
		return render(request, 'index.html')

def games_view(request):
    print('yo')
    if (request.method == "GET"):
        return render(request, 'games.html')
    else:
        return render(request, 'index.html')
