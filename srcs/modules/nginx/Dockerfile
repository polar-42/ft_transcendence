FROM alpine:3.19

RUN apk update; apk upgrade
RUN apk add nginx
RUN apk add openssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj "/C=FR/ST=Charente/L=Angouleme/O=42/OU=tmp/CN=tmp.42.fr"

WORKDIR /etc/nginx

RUN rm nginx.conf http.d/*

COPY ./nginx.conf nginx.conf
COPY ./django_server.conf http.d
RUN mkdir -p /home/app/web/static
CMD [ "nginx" ]