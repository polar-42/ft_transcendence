# Generated by Django 4.2.6 on 2024-01-15 12:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pongGameApp', '0005_ponggamemodels_typegame'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ponggamemodels',
            name='typeGame',
        ),
        migrations.AddField(
            model_name='ponggamemodels',
            name='tournamentId',
            field=models.CharField(default='CPASUNTOURNOISDUCON', max_length=255),
        ),
    ]