# Generated by Django 4.2.6 on 2024-01-10 15:08

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authApp', '0002_user_connexionstatus'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='channels',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(), blank=True, null=True, size=None),
        ),
    ]
