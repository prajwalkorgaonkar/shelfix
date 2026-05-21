# Dockerfile for local testing (optional)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN npm install --prefix server
RUN npm install --prefix client

# Copy application code
COPY . .

# Build client
RUN npm run build --prefix client

# Expose ports
EXPOSE 5000 5173

# Start both services
CMD ["npm", "run", "dev"]
