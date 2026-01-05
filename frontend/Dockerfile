FROM node:20-slim

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite port
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
