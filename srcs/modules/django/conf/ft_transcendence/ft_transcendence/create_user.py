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
        email = 'chrome@test.fr'
        password = make_password('123456789')

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification=getRandString()
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'chromeprivate'
        email = 'chromeprivate@test.fr'
        password = make_password('123456789')

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification=getRandString()
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'brave'
        email = 'brave@test.fr'
        password = make_password('123456789')

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification=getRandString()
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'braveprivate'
        email = 'braveprivate@test.fr'
        password = make_password('123456789')

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification=getRandString()
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'AI'
        email = 'AI@test.com'
        password = make_password('123456789')

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification='AI'
            )
            print('User created successfully')
        else:
            print('User already exists')
