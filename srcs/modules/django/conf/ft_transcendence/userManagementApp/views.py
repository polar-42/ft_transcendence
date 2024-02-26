import re
from django.shortcuts import render
from django.http import JsonResponse
from authApp.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password

from ft_transcendence.decorators import isValidLoading

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'


@isValidLoading
def userManagementView(request):
    if request.user.is_authenticated:
        return render(request, 'userManagementApp/userManagement.html')
    return render(request, 'index.html')

def updateAccount(request):
    if request.user.is_authenticated is False:
        return render(request, '/')
    if (request.method == "GET") or (request.method == "POST"):
        if request.method == "POST":
            needReload = False
            userModel = User.objects.get(id=request.user.id)
            passwordConfirmation = request.POST.get('password')
            if check_password(passwordConfirmation, userModel.password) is False:
                return JsonResponse({'error': 'Password is incorrect', 'reload' : False})

            newUsername = request.POST.get('newUsername')
            newEmail = request.POST.get('newEmail')
            newPassword = request.POST.get('newPassword')
            newPasswordConfirmation = request.POST.get('newPasswordConfirmation')


            if request.FILES.get('newAvatar') != None:
                avatarImage = request.FILES.get('newAvatar')
            else:
                avatarImage = None

            if len(newUsername) == 0 and len(newEmail) == 0 and len(newPassword) == 0 and len(newPasswordConfirmation) == 0 and avatarImage is None:
                return JsonResponse({'error': 'All field are empty', 'reload' : False})

            if re.search(r"[\<\>\'\"\{\}\[\]\\\|\(\)\/] ", newUsername) != None or re.search(r"[\<\>\'\"\{\}\[\]\\\|\(\)\/]", newEmail) != None or ' ' in newUsername or ' ' in newEmail:
                return JsonResponse({'error': 'Invalid character used'})

            if len(newUsername) > 0 and len(newUsername) < 3 or len(newUsername) > 16:
                return JsonResponse({'error': 'Username length is too small or to big', 'reload' : False})
            elif User.objects.filter(nickname=newUsername).exists():
                return JsonResponse({'error': 'This username is already taken'})
            elif len(newUsername) != 0 and userModel.nickname != newUsername:
                print('username has been updated to', newUsername)
                userModel.nickname = newUsername

            if User.objects.filter(email=newEmail).exists():
                return JsonResponse({'error': 'Email is already taken', 'reload' : False})

            if re.fullmatch(regex, newEmail) is not None and len(newEmail) != 0 and userModel.email != newEmail:
                print('email has been updated to', newEmail)
                needReload = True
                userModel.email = newEmail
            elif len(newEmail) != 0:
                return JsonResponse({'error': 'Email is invalid', 'reload' : False})

            if newPassword != newPasswordConfirmation:
                return JsonResponse({'error': 'Password do not match', 'reload' : False})
            elif len(newPassword) < 6 and len(newPassword) != 0:
                return JsonResponse({'error': 'Password length is too small', 'reload' : False})
            elif len(newPassword) != 0:
                print('password has been updated to', newPassword)
                needReload = True
                userModel.password = make_password(newPassword)

            if avatarImage != None:
                print('avatar of has been updated')
                userModel.avatarImage = avatarImage.read()

            userModel.save()

            return JsonResponse({'message': 'You update your profil successfully', 'reload' : needReload})
        else:
            return render(request, 'authApp/register.html')

    else:
    	return render(request, 'index.html')
