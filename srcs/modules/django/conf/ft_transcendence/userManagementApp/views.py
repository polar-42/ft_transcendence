import json, re, base64, os
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, FileResponse
from authApp.models import User
from django.contrib.auth.hashers import make_password
from authApp.management.commands.create_user import getRandString
from django.core.files.base import ContentFile
from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth.hashers import check_password
from django.db import models

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

def userManagementView(request):
    if request.user.is_authenticated:
        return render(request, 'userManagementApp/userManagement.html')
    return render(request, 'index.html')

def updateAccount(request):
    if request.user.is_authenticated is False:
        return render(request, '/')
    if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
        if request.method == "POST":
            userModel = User.objects.get(id=request.user.id)
            
            passwordConfirmation = request.POST.get('password')
            if check_password(passwordConfirmation, userModel.password) is False:
                return JsonResponse({'error': 'Password is incorrect'})
            
            newUsername = request.POST.get('newUsername')
            newEmail = request.POST.get('newEmail')
            newPassword = request.POST.get('newPassword')
            newPasswordConfirmation = request.POST.get('newPasswordConfirmation')
            
            
            if request.FILES.get('newAvatar') != None:
                avatarImage = request.FILES.get('newAvatar')
            else:
                avatarImage = None
            
            if len(newUsername) == 0 and len(newEmail) == 0 and len(newPassword) == 0 and len(newPasswordConfirmation) == 0 and avatarImage is None:
                return JsonResponse({'error': 'All field are empty'})
            
            if len(newUsername) > 0 and len(newUsername) <= 3:
                return JsonResponse({'error': 'Username length is too small'})
            elif len(newUsername) != 0 and userModel.nickname != newUsername:
                print('username has been updated to', newUsername)
                userModel.nickname = newUsername
            
            if User.objects.filter(email=newEmail).exists():
                return JsonResponse({'error': 'Email is already taken'})
            
            if re.fullmatch(regex, newEmail) is not None and len(newEmail) != 0 and userModel.email != newEmail:
                print('email has been updated to', newEmail)
                userModel.email = newEmail
            elif len(newEmail) != 0:
                return JsonResponse({'error': 'Email is invalid'})
            
            if newPassword != newPasswordConfirmation:
                return JsonResponse({'error': 'Password do not match'})
            elif len(newPassword) < 6 and len(newPassword) != 0:
                return JsonResponse({'error': 'Password length is too small'})
            elif len(newPassword) != 0:
                print('password has been updated to', newPassword)
                userModel.password = make_password(newPassword)
                
            if avatarImage != None:
                print('avatar has been updated')
                userModel.avatarImage = avatarImage.read()
                
            userModel.save()
            
            return JsonResponse({'message': 'You update your profil successfully'})
        else:
            return render(request, 'authApp/register.html')
    
    else:
    	return render(request, 'index.html',)
