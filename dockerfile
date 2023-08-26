FROM node:latest

WORKDIR /app

COPY . .

EXPOSE 3000
EXPOSE 3001

CMD [ "node", "server/index" ]