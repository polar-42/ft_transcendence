FROM python:3.10-alpine

RUN apk update && apk add postgresql-client
RUN apk add py-configobj
# RUN apk add libusb
RUN apk add py-pip
# RUN apk add musl-dev
# RUN apk add libffi-dev
# RUN apk add openssl-dev
# RUN apk add gcc
# RUN apk add linux-headers

RUN mkdir -p /var/site_files
RUN mkdir -p /var/log/gunicorn/

WORKDIR /usr/src/app

COPY conf/ ./conf
COPY ft_transcendence.sh .
COPY gunicornConf.py .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir pyotp qrcode "uvicorn[standard]" daphne gunicorn psycopg2-binary Django==4.2.6 requests channels==4.0.0 web3 Pillow

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=TRUE
ENV DJANGO_SETTINGS_MODULE=ft_transcendence.settings
ENV WATCHFILES_FORCE_POLLING=true
CMD [ "sh", "ft_transcendence.sh" ]
