# Generated by Django 4.2.6 on 2024-01-31 15:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('battleshipApp', '0002_battleshipgamemodels_player1_hit_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='battleshipgamemodels',
            name='player1_try',
            field=models.IntegerField(default=-1),
        ),
        migrations.AddField(
            model_name='battleshipgamemodels',
            name='player2_try',
            field=models.IntegerField(default=-1),
        ),
    ]