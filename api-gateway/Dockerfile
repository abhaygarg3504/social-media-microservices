# use the official node.js image with apline linux as the base image

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD [ "node" ,"src/server.js"]