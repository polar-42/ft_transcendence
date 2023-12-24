# myapp/management/commands/createuser.py
from django.core.management.base import BaseCommand
from authApp.models import User

class Command(BaseCommand):
    help = 'Create a new user'

    def handle(self, *args, **options):
        # Your logic to create a user
        username = 'chrome'
        email = 'test@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username, email, password)
            print('User created successfully')
        else:
            print('User already exists')

        username = 'chromeprivate'
        email = 'test1@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username, email, password)
            print('User created successfully')
        else:
            print('User already exists')

        username = 'brave'
        email = 'brave@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username, email, password)
            print('User created successfully')
        else:
            print('User already exists')

        username = 'braveprivate'
        email = 'braveprivate@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username, email, password)
            print('User created successfully')
        else:
            print('User already exists')

        username = 'IA'
        email = 'IA@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username, email, password)
            print('User created successfully')
        else:
            print('User already exists')
