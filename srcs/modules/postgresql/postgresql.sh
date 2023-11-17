#!/bin/sh

if [ ! -f "/var/db/postgresql.conf" ]; then
	echo database initialisation;
	initdb -D /var/db > /dev/null 2>&1;
else
	echo initialisation already done;
fi

sleep 5;
export DB_HOST=$(hostname -i);
export IP_DJANGO=$(cat /var/db/ip_django);
#export DB_NAME="transcendence_db"
#export DB_USER="user_db"
#export DB_PASSWORD="password_db"
#export PORT="5432"


echo $DB_HOST > /var/db/ip_db
echo "host $DB_NAME all $IP_DJANGO/32 trust" >> /var/db/pg_hba.conf
echo "host $DB_NAME all 192.168.64.1/32 trust" >> /var/db/pg_hba.conf

pg_ctl -D /var/db start > /dev/null 2>&1;

if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME ; then
	echo $DB_NAME already created;
else
	createdb $DB_NAME > /dev/null 2>&1;

	psql -d $DB_NAME -c "create user ${DB_USER} with encrypted password '${DB_PASSWORD}';" > /dev/null 2>&1
	psql -d $DB_NAME -c "grant all on SCHEMA public TO ${DB_USER};" > /dev/null 2>&1
	psql -d $DB_NAME -c "grant all privileges on database ${DB_NAME} TO ${DB_USER};" > /dev/null 2>&1

	echo $DB_NAME created;
fi

pg_ctl -D /var/db stop > /dev/null 2>&1;

echo $DB_NAME is launching...;

postgres -D /var/db;
