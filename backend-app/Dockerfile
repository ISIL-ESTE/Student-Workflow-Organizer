FROM node:18-alpine

RUN npm install --location=global nodemon

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8000
# required for docker desktop port mapping

CMD ["npm", "run", "dev"]
