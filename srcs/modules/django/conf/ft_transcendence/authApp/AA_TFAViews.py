from django.http import JsonResponse, HttpResponse, HttpResponseForbidden
from django.contrib.auth import login, logout
from django.shortcuts import render
from django.contrib.auth.hashers import check_password

from ft_transcendence import ColorPrint
from .models import User

import json
import jwt
import os


def ShowPopUp(request):
	if request.user.is_authenticated == False:
		return render(request, 'index.html')
	return render(request, 'authApp/TFA/PopUp.html')

def ChooseTypePage(request):
	if request.user.is_authenticated == False:
		return render(request, 'index.html')
	return render(request, 'authApp/TFA/Choose2FA.html')

def ConfirmPassPage(request):
	if request.user.is_authenticated == False:
		return render(request, 'index.html')
	return render(request, 'authApp/TFA/ConfirmPass.html')

def CheckPass(request):
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

def CheckPassDesactivation(request):
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

def Selected(request):
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

def RequestQR(request):
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


def SendCode(request):
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

def Disable(request):
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

def LoginPage(request):
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

def LoginCheck(request):
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