# Generated by Django 4.2.6 on 2024-01-19 10:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authApp', '0016_alter_user_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(blank=True, max_length=254, verbose_name='email address'),
        ),
    ]
