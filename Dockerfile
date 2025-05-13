FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install tailwindcss @tailwindcss/postcss postcss autoprefixer

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0"]
