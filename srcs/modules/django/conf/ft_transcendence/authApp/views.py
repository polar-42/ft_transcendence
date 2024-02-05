from django.shortcuts import render
from django.contrib.auth import login, logout
from django.http import JsonResponse
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from .management.commands.create_user import getRandString
import json, re
from django.http import HttpResponse, HttpResponseForbidden
from authApp.models import User
from PIL import Image

from ft_transcendence import ColorPrint
from ft_transcendence.decorators import isValidLoading

import jwt
import time
import os
from django.core.management.utils import get_random_secret_key

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
		if userModel.tfValidated == True:
			token = jwt.encode({"email" : email, "status" : "2FA connexion"}, os.environ.get('DJANGO_KEY'), algorithm='HS256')
			ColorPrint.prRed(token)
			response = JsonResponse({'TFA' : 'request'})
			response.set_cookie('2FACookie', token, max_age=600, samesite="Strict")
			return response
		else:
			login(request, userModel)
			return JsonResponse({'message': 'Connexion successfull'})
	else:
		return JsonResponse({'error': 'Email or Password is invalid'})

@isValidLoading
def registerPage(request):
	if (request.user.is_authenticated == True):
		return render(request, 'index.html')

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
		import io
		img = Image.open("./static/assets/pictures/studs/mjuin.jpg")
		new_img = img.resize((300, 300))
		img_buff = io.BytesIO()
		new_img.save(img_buff, format='JPEG')
		img_buff.seek(0)
		avatarImage = img_buff
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
		nickname=username,
		email=email,
		password=passwordHash,
		identification=getRandString(),
		avatarImage = avatarImage.read()
	)

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
        return JsonResponse({'userName': request.user.nickname})
    else:
        return JsonResponse({'userName': 'LOG IN'})
    return JsonResponse({'userName': request.user.username})

def getUserID(request):
    print(request)
    print(request.user.identification)
    return JsonResponse({'userID': request.user.identification})

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
	return JsonResponse({'status': True if (usr.tfValidated == True) else False})

def ShowPopUp(request):
	if request.user.is_authenticated == False:
		return render(request, 'index.html')
	return render(request, 'authApp/TFA/PopUp.html')

def TFAChooseTypePage(request):
	if request.user.is_authenticated == False:
		return render(request, 'index.html')
	return render(request, 'authApp/TFA/Choose2FA.html')

def TFAConfirmPassPage(request):
	if request.user.is_authenticated == False:
		return render(request, 'index.html')
	return render(request, 'authApp/TFA/ConfirmPass.html')

def TFACheckPass(request):
	if request.user.is_authenticated == False:
		return JsonResponse({'error': 'User not authenticated'})
	if User.objects.filter(id=request.user.id).exists() is False:
		return JsonResponse({'error': 'User not found.'})
	userModel = User.objects.get(id=request.user.id)
	data = json.loads(request.body)
	if len(data.get('password')) == 0:
		return JsonResponse({'error': 'Invalid password.'})
	if check_password(data.get('password'), userModel.password):
		response = JsonResponse({'Success': 'Success.'})
		token = jwt.encode({"email" : userModel.email, "status" : "2FA register"}, os.environ.get('DJANGO_KEY'), algorithm='HS256')
		response.set_cookie('2FACookie', token, max_age=600, samesite="Strict")
		return response
	return JsonResponse({'error': 'Invalid password.'})

def TFACheckPassDesactivation(request):
	if request.user.is_authenticated == False:
		return JsonResponse({'error': 'User not authenticated.'})
	if User.objects.filter(id=request.user.id).exists() is False:
		return JsonResponse({'error': 'User not found.'})
	userModel = User.objects.get(id=request.user.id)
	data = json.loads(request.body)
	if len(data.get('password')) == 0:
		return JsonResponse({'error': 'invalid password.'})
	if check_password(data.get('password'), userModel.password):
		return JsonResponse({'success': '2Fa disabled.'})
	return JsonResponse({'error': 'invalid password.'})

import pyotp

def TFASelected(request):
	if request.user.is_authenticated == False:
		return HttpResponse('', content_type="text/plain")
	data = json.loads(request.body)
	if User.objects.filter(id=request.user.id).exists() is False:
		return JsonResponse({'error': 'User not found.'})
	match data.get('selectedAuth'):
		case '0':
			return render(request, 'authApp/TFA/Auth2FA.html')
		case _:
			return HttpResponse('', content_type="text/plain")

def TFARequestQR(request):
	if request.user.is_authenticated == False:
		return HttpResponse('', content_type="text/plain")
	if User.objects.filter(id=request.user.id).exists() is False:
		return HttpResponse('', content_type="text/plain")

	cookie = request.COOKIES.get('2FACookie')
	if (cookie == None):
		return HttpResponse('404', content_type="text/plain")
	cookie = jwt.decode(cookie, os.environ.get('DJANGO_KEY'), algorithms="HS256")
	userModel = User.objects.get(id=request.user.id)
	if userModel.email != cookie.get('email') or cookie.get('status') != '2FA register':
		return HttpResponse('404', content_type="text/plain")

	k = pyotp.random_base32()
	userModel.tfKey = k
	userModel.save()
	totp_auth = pyotp.totp.TOTP(k).provisioning_uri( name=userModel.email, issuer_name='ft_transcendenceServer')
	qrcode_uri = "https://www.google.com/chart?chs=100x100&chld=M|0&cht=qr&chl={}".format(totp_auth)
	response = JsonResponse({'qr' : qrcode_uri})
	response.delete_cookie('2FACookie')
	token = jwt.encode({"email" : userModel.email, "status" : "2FA register QR"}, os.environ.get('DJANGO_KEY'), algorithm='HS256')
	response.set_cookie('2FACookie', token, max_age=600, samesite="Strict")
	return response


def TFASendCode(request):
	if request.user.is_authenticated == False:
		return JsonResponse({'error': 'User not authenticated.'})
	if (request.method != "POST"):
		return JsonResponse({'error': 'Invalid method.'})
	if User.objects.filter(id=request.user.id).exists() is False:
		return JsonResponse({'error': 'User not found.'})
	userModel = User.objects.get(id=request.user.id)

	cookie = request.COOKIES.get('2FACookie')
	if (cookie == None):
		return JsonResponse({'error': 'User 2fa not initialized.'})
	cookie = jwt.decode(cookie, os.environ.get('DJANGO_KEY'), algorithms="HS256")

	if userModel.email != cookie.get('email') or cookie.get('status') != '2FA register QR':
		return JsonResponse({'error': 'Invalid 2FA cookie.'})

	if userModel.tfKey == None:
		return JsonResponse({'error': 'User 2fa not initialized.'})
	data = json.loads(request.body)
	totp = pyotp.TOTP(userModel.tfKey)
	code = data.get('TFACode')



	if totp.now() == code:
		userModel.tfValidated = True
		userModel.save()
		logout(request)
		response = JsonResponse({'success': '2fa successfully set. Please log in.'})
		response.delete_cookie('2FACookie')
		return response
	return JsonResponse({'error': 'Invalid code.'})

def TFADisable(request):
	if request.user.is_authenticated == False:
		return JsonResponse({'error': 'User not authenticated.'})
	if (request.method != "GET"):
		return JsonResponse({'error': 'Invalid method.'})
	if User.objects.filter(id=request.user.id).exists() is False:
		return JsonResponse({'error': 'User not found.'})
	userModel = User.objects.get(id=request.user.id)
	userModel.tfValidated = False
	userModel.tfKey = None
	userModel.save()
	return JsonResponse({'Success': '2FA Disabled.'})

def TFALoginPage(request):
	if request.user.is_authenticated == True:
		ColorPrint.prGreen("1")
		return HttpResponseForbidden('', content_type="text/plain")
	cookie = request.COOKIES.get('2FACookie')
	if cookie == None:
		ColorPrint.prGreen("3")
	cookie = jwt.decode(cookie, os.environ.get('DJANGO_KEY'), algorithms="HS256")
	if User.objects.filter(email=cookie.get('email')).exists() is False:
		ColorPrint.prGreen("2")
		return HttpResponseForbidden('', content_type="text/plain")
	userModel = User.objects.get(email=cookie.get('email'))
	return render(request, 'authApp/TFA/Enter2FACode.html')

def LoginCheckTFA(request):
	if request.user.is_authenticated == True:
		ColorPrint.prGreen("1")
		return JsonResponse({'error' : 'User already logged.'})
	data = json.loads(request.body)
	cookie = request.COOKIES.get('2FACookie')
	if cookie == None:
		ColorPrint.prGreen("3")
		return JsonResponse({'error' : 'incorrect step.'})
	readedCookie = jwt.decode(cookie, os.environ.get('DJANGO_KEY'), algorithms="HS256")
	userModel = User.objects.get(email=readedCookie.get('email'))
	if userModel.tfKey == None or readedCookie.get('status') != '2FA connexion':
		return JsonResponse({'error': 'User 2fa not initialized.'})
	totp = pyotp.TOTP(userModel.tfKey)
	code = data.get('TFACode')
	if totp.now() == code:
		login(request, userModel)
		response = JsonResponse({'message': 'User is connected.'})
		response.delete_cookie('2FACookie')
		return response
	return JsonResponse({'error': 'Invalid 2FA code.'})
