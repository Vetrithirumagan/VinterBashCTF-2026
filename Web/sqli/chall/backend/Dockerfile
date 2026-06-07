FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy server code
COPY server.js .

# Expose port
EXPOSE 5000

# Start server - run node directly instead of through npm
CMD ["node", "server.js"]
