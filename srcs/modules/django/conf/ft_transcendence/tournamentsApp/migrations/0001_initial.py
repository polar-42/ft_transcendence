# Generated by Django 4.2.6 on 2023-12-16 09:29

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TournamentsModels',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tournamentsName', models.CharField(max_length=255)),
                ('numberOfPlayer', models.CharField(max_length=255)),
            ],
        ),
    ]
