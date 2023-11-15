#!/bin/sh

echo "launch django-admin startproject mysite;";
django-admin startproject mysite;


echo "cd mysite";
cd mysite;

echo "python manage.py migrate";
python manage.py migrate;

echo "python mysite/manage.py runserver";
python manage.py runserver 0.0.0.0:8000;
