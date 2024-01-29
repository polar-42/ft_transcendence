import json, re, base64, os
from django.shortcuts import render
from django.http import JsonResponse, FileResponse
from authApp.models import User
from django.http import HttpResponse

def dashboardView(request):
    if request.user.is_authenticated:
        return render(request, 'dashboardApp/dashboard.html')
    return render(request, 'index.html')
