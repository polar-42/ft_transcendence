FROM nginx:1.10.1-alpine

COPY pongJS/index.html /usr/share/nginx/html
COPY pongJS/pong.js /usr/share/nginx/html
COPY pongJS/style.css /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
