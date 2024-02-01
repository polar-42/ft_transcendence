# Generated by Django 4.2.6 on 2024-02-01 10:37

import chatApp.enumChat
import django.contrib.auth.models
import django.contrib.postgres.fields
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('nickname', models.CharField(default='None')),
                ('connexionStatus', models.IntegerField(default=chatApp.enumChat.connexionStatus['Disconnected'])),
                ('avatarImage', models.BinaryField(blank=True, default=None, null=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('identification', models.CharField(max_length=5, unique=True)),
                ('channels', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(), blank=True, null=True, size=None)),
                ('blockedUser', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(), blank=True, null=True, size=None)),
                ('allPrivateTalks', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(), blank=True, null=True, size=None)),
                ('tfValidated', models.BooleanField(default=False)),
                ('tfKey', models.CharField(default=None, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
    ]
