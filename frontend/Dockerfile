FROM node:22-alpine

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install seluruh dependency
RUN npm install

# Copy seluruh source code frontend
COPY . .

EXPOSE 5173

# Jalankan Vite server dengan flag --host agar bisa diakses luar container
CMD ["npm", "run", "dev", "--", "--host"]
