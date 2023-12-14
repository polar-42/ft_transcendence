from django.shortcuts import render
import os

def index_view(request):
    return render(request, 'index.html')

def dashboard_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		return render(request, 'dashboard.html')
	else:
		return render(request, 'index.html')
def PNF_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		return render(request, '404.html')
	else:
		return render(request, 'index.html')
def NeedLog_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		return render(request, 'needlog.html')
	else:
		return render(request, 'index.html')
