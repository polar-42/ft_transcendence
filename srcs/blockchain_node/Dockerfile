FROM alpine:3.18

RUN apk update
RUN apk add nodejs 
RUN apk add npm
RUN apk add vim

RUN mkdir -p /usr/share/app/node
RUN mkdir -p /var/blockchain

WORKDIR /usr/share/app/node

RUN mkdir contracts scripts test

COPY node.sh .
COPY hardhat.config.js .

EXPOSE 8545

CMD [ "sh", "node.sh" ]
