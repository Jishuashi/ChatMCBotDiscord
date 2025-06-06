FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD sh -c 'test -f /app/ip.json || echo "{ \"Server\": [] }" > /app/ip.json && nodemon index.js'



