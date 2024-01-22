#!/bin/sh

if [ ! -f "/var/db/postgresql.conf" ]; then
	echo database initialisation;
	initdb -D /var/db >> /var/log/postgres.log 2>> /var/log/error.log;
else
	echo initialisation already done;
fi

export IP_DJANGO=$(ping container_django | head -n 2 | awk '{print $3}'# | cut -c2- | rev | cut -c3- | rev)

# echo "host $DB_NAME all $IP_DJANGO/32 trust" >> /var/db/pg_hba.conf
echo "host $DB_NAME all 0.0.0.0/0 trust" >> /var/db/pg_hba.conf

pg_ctl -D /var/db start >> /var/log/postgres.log 2>> /var/log/error.log;

if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME ; then
	echo $DB_NAME already created;
else
	createdb $DB_NAME;

	psql -d $DB_NAME -c "create user ${DB_USER} with encrypted password '${DB_PASSWORD}';" >> /var/log/postgres.log 2>> /var/log/error.log;
	psql -d $DB_NAME -c "grant all on SCHEMA public TO ${DB_USER};" >> /var/log/postgres.log 2>> /var/log/error.log;
	psql -d $DB_NAME -c "grant all privileges on database ${DB_NAME} TO ${DB_USER};" >> /var/log/postgres.log 2>> /var/log/error.log;

	echo $DB_NAME created;
fi

pg_ctl -D /var/db stop >> /var/log/postgres.log 2>> /var/log/error.log;

echo $DB_NAME is launching...;

postgres -D /var/db;

