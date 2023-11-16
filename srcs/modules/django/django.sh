#!/bin/sh

echo "launch django-admin startproject mysite;";
django-admin startproject mysite;

cat settings.py > mysite/mysite/settings.py

echo "cd mysite";
cd mysite;

sleep 15;

echo "python manage.py migrate";
python manage.py migrate;

echo "python mysite/manage.py runserver";
python manage.py runserver $(hostname -i):8080;
