FROM python:3.10-alpine

RUN apk update && apk add postgresql-client && apk add vim
RUN apk add py-configobj
RUN apk add libusb
RUN apk add py-pip
RUN apk add musl-dev
RUN apk add libffi-dev
RUN apk add openssl-dev
RUN apk add gcc
RUN apk add linux-headers

RUN mkdir -p /var/site_files

WORKDIR /usr/src/app

COPY conf/ ./conf
COPY ft_transcendence.sh .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir daphne Django==4.2.6 requests psycopg2-binary Pillow channels==4.0.0 web3

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=ft_transcendence.settings

EXPOSE 8080

CMD [ "sh", "ft_transcendence.sh" ]
