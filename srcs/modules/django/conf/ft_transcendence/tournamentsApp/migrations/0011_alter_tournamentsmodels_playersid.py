# Generated by Django 4.2.6 on 2024-01-15 13:52

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournamentsApp', '0010_remove_tournamentsmodels_tournamentstype_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournamentsmodels',
            name='playersId',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(), default='', null=True, size=None),
        ),
    ]