from django.core.management.base import BaseCommand
from authApp.models import User
import random, string

def getRandString(username):
	s = string.ascii_letters + string.digits
	str = ''.join(random.choice(s) for i in range(5))

	return username + '-' + str

class Command(BaseCommand):
    help = 'Create a new user'

    def handle(self, *args, **options):
        # Your logic to create a user
        username = 'chrome'
        email = 'test@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                username=username,
                email=email,
                password=password,
                identification=getRandString(username))
            print('User created successfully')
        else:
            print('User already exists')

        username = 'chromeprivate'
        email = 'test1@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                username=username,
                email=email,
                password=password,
                identification=getRandString(username))
            print('User created successfully')
        else:
            print('User already exists')

        username = 'brave'
        email = 'brave@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                username=username,
                email=email,
                password=password,
                identification=getRandString(username))
            print('User created successfully')
        else:
            print('User already exists')

        username = 'braveprivate'
        email = 'braveprivate@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                username=username,
                email=email,
                password=password,
                identification=getRandString(username))
            print('User created successfully')
        else:
            print('User already exists')

        username = 'IA'
        email = 'IA@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                username=username,
                email=email,
                password=password,
                identification=getRandString(username))
            print('User created successfully')
        else:
            print('User already exists')
