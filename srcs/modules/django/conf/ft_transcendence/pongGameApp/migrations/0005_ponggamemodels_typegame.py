# Generated by Django 4.2.6 on 2024-01-08 14:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pongGameApp', '0004_ponggamemodels_player1_ponggamemodels_player2_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='ponggamemodels',
            name='typeGame',
            field=models.CharField(default='COUCOU GILLIAN', max_length=255),
        ),
    ]
