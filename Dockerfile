FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD sh -c 'if [ ! -f /app/ip.json ]; then echo "{ \"Server\": [] }" > /app/ip.json; fi && node index.js'



