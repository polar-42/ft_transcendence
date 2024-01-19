FROM python:3.11-alpine

RUN apk --update add py-configobj py-pip
RUN pip install --upgrade pip
RUN pip install --no-cache-dir daphne Django==4.2.6 channels==4.0.0 psycopg2-binary

RUN mkdir -p /var/conf

WORKDIR /var/conf/ft_transcendence

ENTRYPOINT [ "daphne", "-b", "0.0.0.0", "-p", "8001", "ft_transcendence.asgi:application" ]