FROM node:22-alpine

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install seluruh dependency
RUN npm install

# Copy seluruh source code backend
COPY . .

EXPOSE 3000

# Jalankan dev server Fastify
CMD ["npm", "run", "dev"]
