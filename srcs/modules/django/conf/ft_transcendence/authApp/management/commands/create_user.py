from django.core.management.base import BaseCommand
from authApp.models import User
from django.contrib.auth.hashers import make_password
import random, string, io
from PIL import Image

def getRandString():
	s = string.ascii_letters + string.digits
	ss = ''.join(random.choice(s) for i in range(5))

	return ss

class Command(BaseCommand):
    help = 'Create a new user'

    def handle(self, *args, **options):
        img = Image.open("./static/assets/pictures/studs/mjuin.jpg")
        new_img = img.resize((300, 300))
        img_buff = io.BytesIO()
        new_img.save(img_buff, format='JPEG')
        img_buff.seek(0)
        avatarImage = img_buff
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
                identification=getRandString(),
                avatarImage=avatarImage.read()
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'chromeprivate'
        email = 'chromeprivate@test.fr'
        password = make_password('123456789')
        img = Image.open("./static/assets/pictures/studs/mjuin.jpg")
        new_img = img.resize((300, 300))
        img_buff = io.BytesIO()
        new_img.save(img_buff, format='JPEG')
        img_buff.seek(0)
        avatarImage = img_buff

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification=getRandString(),
                avatarImage=avatarImage.read()
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'brave'
        email = 'brave@test.fr'
        password = make_password('123456789')
        img = Image.open("./static/assets/pictures/studs/mjuin.jpg")
        new_img = img.resize((300, 300))
        img_buff = io.BytesIO()
        new_img.save(img_buff, format='JPEG')
        img_buff.seek(0)
        avatarImage = img_buff

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification=getRandString(),
                avatarImage=avatarImage.read()
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'braveprivate'
        email = 'braveprivate@test.fr'
        password = make_password('123456789')
        img = Image.open("./static/assets/pictures/studs/mjuin.jpg")
        new_img = img.resize((300, 300))
        img_buff = io.BytesIO()
        new_img.save(img_buff, format='JPEG')
        img_buff.seek(0)
        avatarImage = img_buff

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification=getRandString(),
                avatarImage=avatarImage.read()
            )
            print('User created successfully')
        else:
            print('User already exists')

        username = 'AI'
        email = 'AI@test.com'
        password = make_password('123456789')
        img = Image.open("./static/assets/pictures/studs/mjuin.jpg")
        new_img = img.resize((300, 300))
        img_buff = io.BytesIO()
        new_img.save(img_buff, format='JPEG')
        img_buff.seek(0)
        avatarImage = img_buff

        # Check if the user already exists
        if not User.objects.filter(email=email).exists():
            User.objects.create(
                nickname=username,
                email=email,
                password=password,
                identification='AI',
                avatarImage=avatarImage.read()
            )
            print('User created successfully')
        else:
            print('User already exists')
