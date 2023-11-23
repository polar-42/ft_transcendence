FROM postgres:16-alpine3.18

RUN apk update && apk add vim
#openrc postgresql

RUN adduser -S postgres_user
RUN mkdir -p /var/db
RUN chown -R postgres_user /var/
RUN chown -R postgres_user /var/
USER postgres_user

RUN mkdir -p /var/lib/scripts/

COPY postgresql.sh /var/lib/scripts/

EXPOSE 5432

CMD [ "sh", "/var/lib/scripts/postgresql.sh" ]
