from django.shortcuts import render

# Create your views here.
def tournaments_view(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournamentsHome.html')
	else:
		return render(request, 'index.html')

def tournaments_creation(request):
	if (request.method == "GET" and request.GET["valid"] == "True"):
		return render(request, 'tournaments/tournamentsCreation.html')
	else:
		return render(request, 'index.html')
