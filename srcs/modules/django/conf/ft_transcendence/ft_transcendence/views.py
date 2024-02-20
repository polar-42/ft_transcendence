from django.shortcuts import render
import os
from functools import wraps
from ft_transcendence import ColorPrint
from .decorators import isValidLoading


@isValidLoading
def index_view(request):
    return render(request, 'index.html')

@isValidLoading
def homepage_view(request):
	ColorPrint.prRed("Request Homepage")
	if (request.method == "GET"):
		return render(request, 'homepage.html')
	else:
		return render(request, 'index.html')

@isValidLoading
def PNF_view(request):
	return render(request, '404.html')

@isValidLoading
def NeedLog_view(request):
	return render(request, 'needlog.html')

@isValidLoading
def games_view(request):
    print('yo')
    if (request.method == "GET"):
        return render(request, 'games.html')
    else:
        return render(request, 'index.html')
