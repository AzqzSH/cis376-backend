FROM node:18-alpine

ENV DATABASE_URL="file:./dev.db"

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./

COPY . .

RUN yarn

RUN npx prisma generate

RUN yarn build

EXPOSE 8000

CMD ["npm", "start"]