# Generated by Django 4.2.6 on 2024-01-12 13:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authApp', '0006_user_identification'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='identification',
            field=models.CharField(default='ERG05'),
        ),
    ]
