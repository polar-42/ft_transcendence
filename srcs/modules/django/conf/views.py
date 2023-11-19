import os
from django.shortcuts import render
from django.http import JsonResponse
from transcendence.models import User
import json

def index_view(request):
    if request.headers.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        data = {'message': 'Hello from Django! This is an AJAX response.'}
        return JsonResponse(data)
    return render(request, os.environ.get('APP_NAME') + '/index.html')

def create_object(request):
    new_obj = User.objects.create(firstName='first', lastName='last')
    return JsonResponse({'message': 'Object created successfully', 'id': new_obj.id})

def get_data(request):
    data = {'message': 'Information is empty', 'value': 42}
    return JsonResponse(data)
