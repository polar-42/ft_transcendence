#!/bin/sh

if [ ! -f "/var/db/postgresql.conf" ]; then
	echo database initialisation;
	initdb -D /var/db;
else
	echo initialisation already done;
fi

export IP_DJANGO=$(ping container_django | head -n 1 | awk '{print $3}'# | cut -c2- | rev | cut -c3- | rev)

# echo "host $DB_NAME all $DB_HOST_LINUX/32 trust" >> /var/db/pg_hba.conf
echo "host $DB_NAME all $IP_DJANGO/32 trust" >> /var/db/pg_hba.conf

pg_ctl -D /var/db start;

if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME ; then
	echo $DB_NAME already created;
else
	createdb $DB_NAME;

	psql -d $DB_NAME -c "create user ${DB_USER} with encrypted password '${DB_PASSWORD}';" > /dev/null 2>&1
	psql -d $DB_NAME -c "grant all on SCHEMA public TO ${DB_USER};" > /dev/null 2>&1
	psql -d $DB_NAME -c "grant all privileges on database ${DB_NAME} TO ${DB_USER};" > /dev/null 2>&1

	echo $DB_NAME created;
fi

pg_ctl -D /var/db stop;

echo $DB_NAME is launching...;

postgres -D /var/db;

