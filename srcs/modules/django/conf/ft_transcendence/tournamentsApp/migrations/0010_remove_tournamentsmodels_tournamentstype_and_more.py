# Generated by Django 4.2.6 on 2024-01-09 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournamentsApp', '0009_tournamentsmodels_winner'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournamentsmodels',
            name='tournamentsType',
        ),
        migrations.AddField(
            model_name='tournamentsmodels',
            name='tournamentType',
            field=models.IntegerField(default=-1),
        ),
        migrations.AlterField(
            model_name='tournamentsmodels',
            name='privateGame',
            field=models.IntegerField(default=0),
        ),
    ]
