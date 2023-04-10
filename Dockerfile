FROM node:18-alpine

WORKDIR /app

EXPOSE 5173

COPY package.json .

RUN yarn

COPY . .

ENTRYPOINT [ "yarn" ]