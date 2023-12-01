#!/bin/sh

export SITE_NAME="ft_transcendence";
export APP_NAME="Dashboard";

export IP_DJANGO=$(hostname -i);
echo $IP_DJANGO > /var/db/ip_django

export DB_NAME="transcendence_db"
export DB_USER="user_db"
export DB_PASSWORD="password_db"
export DB_PORT="5432"

while [ ! -f /var/db/ip_db ] ; do
	sleep 1
done

export DB_HOST=$(cat /var/db/ip_db);
rm -rf /var/db/ip_db

while [ ! -f /var/db/check ] ; do
	sleep 1
done
rm -rf /var/db/check

if [ ! -d $SITE_NAME ]; then
	django-admin startproject $SITE_NAME;
	mkdir -p  $SITE_NAME/templates
	mkdir -p  $SITE_NAME/static
	mv ./conf/settings.py ./$SITE_NAME/$SITE_NAME/settings.py
	mv ./conf/urls.py ./$SITE_NAME/$SITE_NAME/urls.py
	mv ./conf/views.py ./$SITE_NAME/$SITE_NAME/views.py
	ln -s /var/site_files/html/index.html ./$SITE_NAME/templates/
	ln -s /var/site_files/html/dashboard.html ./$SITE_NAME/templates/
	ln -s /var/site_files/html/game.html ./$SITE_NAME/templates/
	ln -s /var/site_files/css/ ./$SITE_NAME/static/
	ln -s /var/site_files/js/ ./$SITE_NAME/static/
	ln -s /var/site_files/assets/ ./$SITE_NAME/static/
	chmod +x ./conf/authApp/authApp.sh
	./conf/authApp/authApp.sh &
	wait
	
fi

cd $SITE_NAME

# if [ ! -d "$APP_NAME/" ] ; then
# 
	# mkdir -p $SITE_NAME/templates/$SITE_NAME;
	# mkdir -p $SITE_NAME/static/$SITE_NAME;
	# mkdir -p $SITE_NAME/templates/$SITE_NAME/files;
# 
	# cat ../conf/settings.py > mysite/settings.py;
	# ln -s /var/site_files/html/index.html $SITE_NAME/templates/$SITE_NAME/index.html
	# ln -s /var/site_files/css/ $SITE_NAME/static/$SITE_NAME/
	# ln -s /var/site_files/html/ $SITE_NAME/templates/$SITE_NAME/files;
	# ln -s /var/site_files/js/ $SITE_NAME/static/$SITE_NAME/;
	# ln -s /var/site_files/assets/ $SITE_NAME/static/$SITE_NAME/;
	# mv ../site_files/html/index.html $SITE_NAME/templates/$SITE_NAME;
	# mv ../site_files/css/ $SITE_NAME/static/$SITE_NAME/
	# mv ../site_files/html/ $SITE_NAME/templates/$SITE_NAME/files;
	# mv ../site_files/js/ $SITE_NAME/static/$SITE_NAME/js;
	# mv ../site_files/assets/ $SITE_NAME/static/$SITE_NAME/;
	# cat ../conf/models.py > $SITE_NAME/models.py;
	# cat ../conf/views.py > $SITE_NAME/views.py;
	# cat ../conf/urls_app.py > $SITE_NAME/urls.py;
	# cat ../conf/urls_project.py > mysite/urls.py;


	#TEST SOCKETS
	# cp ../conf/asgi.py mysite/asgi.py
	# cp ../conf/consumers.py $SITE_NAME/consumers.py
	# cp ../conf/routing.py $SITE_NAME/routing.py
# 
	# cp ../conf/managers.py $SITE_NAME/managers.py
# 
	# echo "python manage.py makemigrations";
	# python manage.py makemigrations;
# 
	# echo "python manage.py migrate";
	# python manage.py migrate;

	# ADD USER TEST WITH PASSWORD 123456789
	# mkdir -p $SITE_NAME/management/commands
	# cp ../conf/createuser.py $SITE_NAME/management/commands/createuser.py
	# python manage.py createuser;

# fi

# tail -f /dev/null/
echo "python mysite/manage.py runserver";
python manage.py runserver $(hostname -i):8080;
