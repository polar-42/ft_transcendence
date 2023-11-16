#!/bin/sh

if [ ! -f "/var/lib/postgresql/data/postgresql.conf" ]; then
	initdb > /dev/null 2>&1;
fi

export IP_DB=$(hostname -i);

export DB_NAME="test"
export DB_USER="test"
export DB_PASSWORD="test"

echo $IP_DB > /var/db/ip_db

pg_ctl start > /dev/null 2>&1;
if [ "$(psql -lqt | grep -c $DB_NAME > /dev/null 2>&1)" -gt 0 ];then
	echo $DB_NAME already created;
else
	createdb $DB_NAME > /dev/null 2>&1;

	psql -d $DB_NAME -c "create user ${DB_USER} with encrypted password '${DB_PASSWORD}';" > /dev/null 2>&1
	psql -d $DB_NAME -c "grant all privileges on database ${DB_NAME} TO ${DB_USER};" > /dev/null 2>&1

	echo $DB_NAME created;

fi

pg_ctl stop > /dev/null 2>&1;

postgres;
