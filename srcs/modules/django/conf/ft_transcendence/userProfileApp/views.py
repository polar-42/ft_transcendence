from django.shortcuts import render

# Create your views here.
def profileView(request):
    if request.user.is_authenticated:
        print('test')
        return render(request, 'userProfileApp/profile.html')
    return render(request, 'index.html')
