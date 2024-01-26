from django.shortcuts import render
from django.contrib.auth import login, logout
from django.http import JsonResponse
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from .management.commands.create_user import getRandString
import json, re
from django.http import HttpResponse
from authApp.models import User

from ft_transcendence import ColorPrint
from ft_transcendence.decorators import isValidLoading

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
@isValidLoading
def logPage(request):
	if (request.user.is_authenticated == True):
		return render(request, 'index.html')
	else:
		return render(request, 'authApp/login.html')

def UserConnexion(request):
	if (request.method != "POST"):
		ColorPrint.prRed("Error! Invalid request type")
		return JsonResponse({'error': 'Invalid request type.'})
	if (request.user.is_authenticated == True):
		ColorPrint.prYellow("Warning! User Already Connected")
		return JsonResponse({'error': 'Already connected.'})
	data = json.loads(request.body)
	email = data.get('email')
	password = data.get('password')

	if len(email) == 0 or len(password) == 0 :
		return JsonResponse({'error': 'One of the field is empty'})

	if User.objects.filter(email=email).exists() is False:
		return JsonResponse({'error': 'Email or Password is invalid'})
	userModel = User.objects.get(email=email)
	if check_password(password, userModel.password):
		isPasswordValid = True
	else:
		isPasswordValid = False
	if isPasswordValid:
		login(request, userModel)
		return JsonResponse({'message': 'Connexion successfull'})
	else:
		return JsonResponse({'error': 'Email or Password is invalid'})

@isValidLoading
def registerPage(request):
	if (request.user.is_authenticated == True):
		return render(request, 'index.html')
	else:
		return render(request, 'authApp/register.html')

def UserRegistration(request):
	if (request.method != "POST"):
		ColorPrint.prRed("Error! Invalid request type")
		return JsonResponse({'error': 'Invalid request type.'})
	if (request.user.is_authenticated == True):
		ColorPrint.prYellow("Warning! User Already Connected")
		return JsonResponse({'error': 'Already connected.'})
	username = request.POST.get('username')
	email = request.POST.get('email')
	password = request.POST.get('password')
	passwordConfirmation = request.POST.get('passwordConfirmation')
	if request.FILES.get('avatar') != None:
		avatarImage = request.FILES.get('avatar')
	else:
		avatarImage = None
	if len(username) == 0 or len(email) == 0 or len(password) == 0 or len(passwordConfirmation) == 0:
		return JsonResponse({'error': 'One of the field is empty'})
	if password != passwordConfirmation:
			return JsonResponse({'error': 'Password do not match'})
	if len(username) < 3:
		return JsonResponse({'error': 'Username length is too small'})
	elif len(username) > 16:
		return JsonResponse({'error': 'Username length is too big'})
	if len(password) < 6:
		return JsonResponse({'error': 'Password length is too small'})
	if re.fullmatch(regex, email) is None:
		return JsonResponse({'error': 'Email is invalid'})
	if User.objects.filter(email=email).exists():
		return JsonResponse({'error': 'Email is already taken'})
	passwordHash = make_password(password)
	new_obj = User.objects.create(
		customUsername=username,
		email=email,
		password=passwordHash,
		username=getRandString()
	)
	if avatarImage != None:
		new_obj.avatarImage = avatarImage.read()
	new_obj.save()
	return JsonResponse({'message': 'You registered successfully'})

def socket(request):
	if (request.method == "GET"):
		return render(request, 'authApp/testSocket.html')
	else:
		return render(request, 'index.html',)

def disconnect(request):
	if (request.user.is_authenticated):
		logout(request)
		return JsonResponse({'success': True})
	else:
		return JsonResponse({'success': False})


def check_connexion(request):
    if (request.user.is_authenticated):
        return JsonResponse({'connexionStatus': True})
    else:
        return JsonResponse({'connexionStatus': False})

def getUserName(request):
    if request.user.is_authenticated:
        return JsonResponse({'userName': request.user.customUsername})
    else:
        return JsonResponse({'userName': 'LOG IN'})

def getAvatarImage(request):
    if request.user.is_authenticated:
        usr = User.objects.get(id=request.user.id)
        if usr.avatarImage is None:
            return HttpResponse(None, content_type='image/null')
        return HttpResponse(usr.avatarImage, content_type='image/png')

def Get2FaStatus(request):
	if request.user.is_authenticated == False:
		return JsonResponse({'error': 'User not authenticated'})
	usr = User.objects.get(id=request.user.id)
	return JsonResponse({'status': True if (usr.tfEnable == True and usr.tfValidated == True) else False})

def Start2FaActivation(request):
	if request.user.is_authenticated == False:
		return render(request, 'index.html')
	usr = User.objects.get(id=request.user.id)
	return render(request, 'authApp/TFA/PopUp.html')

def TFAConfirmPassPage(request):
	if request.user.is_authenticated == False:
		return render(request, 'index.html')
	return render(request, 'authApp/TFA/ConfirmPass.html')

def TFACheckPass(request):
	if request.user.is_authenticated == False:
		return HttpResponse('', content_type="text/plain")
	userModel = User.objects.get(id=request.user.id)
	ColorPrint.prGreen(userModel)
	ColorPrint.prYellow(type(userModel))
	data = json.loads(request.body)
	if len(data.get('password')) == 0:
		return HttpResponse('', content_type="text/plain")
	if check_password(data.get('password'), userModel.password):
		return render(request, 'authApp/TFA/Choose2FA.html')
	return HttpResponse('', content_type="text/plain") 