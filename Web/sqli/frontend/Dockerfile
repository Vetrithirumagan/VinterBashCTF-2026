FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies including production ones
RUN npm install

# Copy source code
COPY public ./public
COPY src ./src

# Build the React app
RUN npm run build

# Copy server file with proxy middleware
COPY server.js .

# Expose port
EXPOSE 3000

# Start the Express server with proxy middleware
CMD ["node", "server.js"]
