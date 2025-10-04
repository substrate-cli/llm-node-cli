# llm-node-cli/Dockerfile
FROM node:20-alpine

LABEL org.opencontainers.image.source https://github.com/substrate-cli/llm-node-cli

# Install curl
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["node", "server.js"]
