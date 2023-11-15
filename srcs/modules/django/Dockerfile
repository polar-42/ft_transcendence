FROM python:3.10-alpine

RUN apk update && apk add postgresql-client

WORKDIR /usr/src/app

COPY requirements.txt .
COPY django.sh .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


EXPOSE 8000

CMD [ "sh", "django.sh" ]
