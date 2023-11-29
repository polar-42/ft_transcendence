#!/bin/sh

if [ ! -d mysite ]; then
	echo "launch django-admin startproject mysite;";
	django-admin startproject mysite;
fi

export IP_DJANGO=$(hostname -i);
echo $IP_DJANGO > /var/db/ip_django

#export DB_NAME="transcendence_db"
#export DB_USER="user_db"
#export DB_PASSWORD="password_db"
#export DB_PORT="5432"

while [ ! -f /var/db/ip_db ] ; do
	sleep 1
done

export DB_HOST=$(cat /var/db/ip_db);
rm -rf /var/db/ip_db

echo "cd mysite";
cd mysite;

while [ ! -f /var/db/check ] ; do
	sleep 1
done
rm -rf /var/db/check

export APP_NAME="transcendence";

if [ ! -d "$APP_NAME/" ] ; then
	python manage.py startapp $APP_NAME;

	mkdir -p $APP_NAME/templates/$APP_NAME;
	mkdir -p $APP_NAME/static/$APP_NAME;
	mkdir -p $APP_NAME/templates/$APP_NAME/files;

	cat ../conf/settings.py > mysite/settings.py;
	ln -s /var/site_files/html/index.html $APP_NAME/templates/$APP_NAME/index.html
	ln -s /var/site_files/css/ $APP_NAME/static/$APP_NAME/
	ln -s /var/site_files/html/ $APP_NAME/templates/$APP_NAME/files;
	ln -s /var/site_files/js/ $APP_NAME/static/$APP_NAME/;
	ln -s /var/site_files/assets/ $APP_NAME/static/$APP_NAME/;
	# mv ../site_files/html/index.html $APP_NAME/templates/$APP_NAME;
	# mv ../site_files/css/ $APP_NAME/static/$APP_NAME/
	# mv ../site_files/html/ $APP_NAME/templates/$APP_NAME/files;
	# mv ../site_files/js/ $APP_NAME/static/$APP_NAME/js;
	# mv ../site_files/assets/ $APP_NAME/static/$APP_NAME/;
	cat ../conf/models.py > $APP_NAME/models.py;
	cat ../conf/views.py > $APP_NAME/views.py;
	cat ../conf/urls_app.py > $APP_NAME/urls.py;
	cat ../conf/urls_project.py > mysite/urls.py;


	#TEST SOCKETS
	cp ../conf/asgi.py mysite/asgi.py
	cp ../conf/consumers.py $APP_NAME/consumers.py
	cp ../conf/routing.py $APP_NAME/routing.py

	cp ../conf/managers.py $APP_NAME/managers.py

	echo "python manage.py makemigrations";
	python manage.py makemigrations;

	echo "python manage.py migrate";
	python manage.py migrate;

	#ADD USER TEST WITH PASSWORD 123456789
	mkdir -p $APP_NAME/management/commands
	cp ../conf/createuser.py $APP_NAME/management/commands/createuser.py
	python manage.py createuser;

fi

echo "python mysite/manage.py runserver";
python manage.py runserver $(hostname -i):8080;
