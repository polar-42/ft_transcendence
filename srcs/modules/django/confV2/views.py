from django.shortcuts import render
import os

def index_view(request):
    return render(request, 'index.html')
def battleship_view(request):
	validation = request.GET.get('valid', '')
	print(validation)
	if validation == "True":
		return render(request, 'game.html')
	else:
		return render(request, 'index.html')
		
def dashboard_view(request):
	validation = request.GET.get('valid', '')
	print(validation)
	if validation == "True":
		return render(request, 'dashboard.html')
	else:
		return render(request, 'index.html')
def PNF_view(request):
	validation = request.GET.get('valid', '')
	print(validation)
	if validation == "True":
		return render(request, '404.html')
	else:
		return render(request, 'index.html')

def NeedLog_view(request):
	validation = request.GET.get('valid', '')
	print(validation)
	if validation == "True":
		return render(request, 'needlog.html')
	else:
		return render(request, 'index.html')
