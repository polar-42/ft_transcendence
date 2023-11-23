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

WORKDIR /usr/src/app

COPY conf/ ./conf
COPY django.sh .

RUN pip install --upgrade pip
RUN pip install -r conf/requirements.txt

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

CMD [ "sh", "django.sh" ]
