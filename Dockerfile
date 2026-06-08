FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npx playwright install chromium

COPY . .

EXPOSE 10000

CMD ["npm", "start"]