FROM python:3.10-alpine

RUN apk update && apk add postgresql-client && apk add vim

WORKDIR /usr/src/app

COPY conf/ ./conf
COPY django.sh .

RUN pip install --upgrade pip
RUN pip install -r conf/requirements.txt

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

CMD [ "sh", "django.sh" ]
