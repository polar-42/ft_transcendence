from django.shortcuts import render
import os
from functools import wraps

from . import ColorPrint

def isValidLoading(function):
	@wraps(function)
	def wrap(request, *args, **kwargs):
		if request.GET.get('Valid') == 'true':
			ColorPrint.prRed(request)
			return function(request, *args, **kwargs)
		else:
			return render(request, 'index.html')
	return wrap