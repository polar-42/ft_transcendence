# myapp/management/commands/createuser.py
from django.core.management.base import BaseCommand
from transcendence.models import User

class Command(BaseCommand):
    help = 'Create a new user'

    def handle(self, *args, **options):
        # Your logic to create a user
        username = 'test'
        email = 'test@test.com'
        password = '123456789'

        # Check if the user already exists
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username, email, password)
            self.stdout.write(self.style.SUCCESS('User created successfully'))
        else:
            self.stdout.write(self.style.WARNING('User already exists'))
