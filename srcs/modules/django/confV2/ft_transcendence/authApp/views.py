from django.shortcuts import render

def logPage(request):
	return render(request, 'authApp/login.html')
    
def register(request):
    return render(request, 'authApp/register.html')