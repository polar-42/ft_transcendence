from django.core.management.base import BaseCommand
from authApp.models import User
from django.contrib.auth.hashers import make_password
import random, string

def getRandString():
	s = string.ascii_letters + string.digits
	ss = ''.join(random.choice(s) for i in range(5))

	return ss

class Command(BaseCommand):
    help = 'Create a new user'

    def handle(self, *args, **options):
        # Your logic to create a user
        username = 'chrome'
        email = 'chrome@chrome.com'
        password = make_password('123456789')

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create(
                username=getRandString(),
                customUsername=username,
                email=email,
                password=password
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'chromeprivate'
        email = 'chromeprivate@chromeprivate.com'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                customUsername=username,
                email=email,
                password=password,
                username=getRandString())
            print('User created successfully')
        else:
            print('User already exists')

        username = 'brave'
        email = 'brave@brave.com'
        password = make_password('123456789')
        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                customUsername=username,
                email=email,
                password=password,
                username=getRandString())
            print('User created successfully')
        else:
            print('User already exists')

        username = 'braveprivate'
        email = 'braveprivate@braveprivate.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                customUsername=username,
                email=email,
                password=password,
                username=getRandString())
            print('User created successfully')
        else:
            print('User already exists')

        username = 'IA'
        email = 'IA@test.com'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                customUsername=username,
                email=email,
                password=password,
                username=getRandString())
            print('User created successfully')
        else:
            print('User already exists')
