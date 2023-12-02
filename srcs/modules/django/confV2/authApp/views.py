from django.shortcuts import render
import os

def logPage(request):
	validation = request.GET.get('valid', '')
	if validation == "True":
		return render(request, 'authApp/login.html')
	else:
		 return render(request, 'index.html')
    
def register(request):
    validation = request.GET.get('valid', '')
    if validation == "True":
        return render(request, 'authApp/register.html')
    else:
        return render(request, 'index.html')