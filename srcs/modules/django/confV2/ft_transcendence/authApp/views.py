from django.shortcuts import render

def logPage(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		return render(request, 'authApp/login.html')
	else:
		return render(request, 'index.html')
    
def register(request):
	if (request.method == "GET" and request.GET["valid"] == "True") or (request.method == "POST"):
		return render(request, 'authApp/register.html')
	else:
		return render(request, 'index.html')