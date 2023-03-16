FROM node:16-alpine
WORKDIR /app

COPY ./dist/index.js .
COPY ./package.json .
RUN npm i

CMD ["node", "./index.js"]

