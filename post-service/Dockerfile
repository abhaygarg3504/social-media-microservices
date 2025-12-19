# use the official node.js image with apline linux as the base image

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3002

CMD npx prisma migrate deploy && node src/server.js