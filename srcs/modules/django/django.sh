#!/bin/sh

echo "launch django-admin startproject mysite;";
django-admin startproject mysite;

export IP_DJANGO=$(hostname -i);
echo $IP_DJANGO > /var/db/ip_django

echo done

#export DB_NAME="transcendence_db"
#export DB_USER="user_db"
#export DB_PASSWORD="password_db"
#export DB_PORT="5432"

sleep 20;

export DB_HOST=$(cat /var/db/ip_db);

cat settings.py > mysite/mysite/settings.py;

echo "cd mysite";
cd mysite;

echo "python manage.py makemigrations";
python manage.py makemigrations;

echo "python manage.py migrate";
python manage.py migrate;

echo "python manage.py startapp polls";
python manage.py startapp polls;

echo "python mysite/manage.py runserver";
python manage.py runserver $(hostname -i):8080;
