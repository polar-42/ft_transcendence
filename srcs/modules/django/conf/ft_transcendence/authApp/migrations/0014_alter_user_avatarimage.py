# Generated by Django 4.2.6 on 2024-01-18 10:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authApp', '0013_alter_user_avatarimage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatarImage',
            field=models.BinaryField(blank=True, default=None, null=True),
        ),
    ]
