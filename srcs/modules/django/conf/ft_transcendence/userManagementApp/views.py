from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse

def userManagementView(request):
	return render(request, 'userManagementApp/userManagement.html')
