FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Clean production installation
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "index.js"]