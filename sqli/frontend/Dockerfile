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

# Install serve to run production build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the production build with proxy
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true
CMD ["serve", "-s", "build", "-l", "3000", "--cors"]
