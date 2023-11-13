FROM alpine:3.18

RUN apk update
RUN apk add nodejs
RUN apk add npm
RUN apk add vim

RUN mkdir -p /usr/share/app/hardhat
RUN mkdir -p /var/blockchain

WORKDIR /usr/share/app/hardhat

RUN mkdir contracts scripts test

COPY scripts/getData.js scripts/
COPY hardhat.sh .
COPY hardhat.config.js .

EXPOSE 8545

CMD [ "sh", "hardhat.sh" ]
