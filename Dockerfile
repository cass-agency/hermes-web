FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=optional --no-audit

COPY . .

RUN npm run build

EXPOSE 8080

ENV PORT=8080 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "start"]
