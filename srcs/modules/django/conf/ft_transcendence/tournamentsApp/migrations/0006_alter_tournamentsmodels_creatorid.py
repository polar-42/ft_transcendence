# Generated by Django 4.2.6 on 2023-12-16 10:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournamentsApp', '0005_alter_tournamentsmodels_creatorid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournamentsmodels',
            name='creatorId',
            field=models.CharField(default='NON', max_length=16),
        ),
    ]
