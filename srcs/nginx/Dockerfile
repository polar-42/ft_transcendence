FROM nginx:1.25-alpine

RUN apk update
RUN apk add nodejs
RUN apk add npm

COPY testBootstrap /usr/share/nginx/html

RUN mkdir -p /usr/share/app/hardhat
RUN mkdir -p /var/blockchain

RUN mkdir scripts

COPY nginx.sh /usr/share/nginx/html
COPY hardhat.config.js /usr/share/nginx/html

EXPOSE 8080
EXPOSE 8545

CMD [ "sh", "/usr/share/nginx/html/nginx.sh" ]
