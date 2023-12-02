#!/bin/sh

echo "Starting authApp configuration"

cd $SITE_NAME/
python manage.py startapp authApp
line_number=$(cat ft_transcendence/settings.py | grep -n "INSTALLED_APPS = \[" | cut -d: -f1)
let "line_number=line_number+7"
sed -i "${line_number}i\\   'authApp'," ./$SITE_NAME/settings.py
mv ../conf/authApp/models.py ./authApp/models.py
line_number=$(cat ft_transcendence/settings.py | grep -n "ROOT_URLCONF" | cut -d: -f1)
let "line_number=line_number-1"
sed -i "${line_number}i\\AUTH_USER_MODEL = 'authApp.User'" ./$SITE_NAME/settings.py
mv ../conf/authApp/admin.py ./authApp/admin.py
mv ../conf/authApp/views.py ./authApp/views.py
mv ../conf/authApp/urls.py ./authApp/urls.py
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser