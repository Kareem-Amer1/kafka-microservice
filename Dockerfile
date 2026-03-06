# Start from the official Node.js image (Alpine = lightweight Linux)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of your source code
COPY src/ ./src/

# Tell Docker this container listens on port 3000
EXPOSE 3000

# Command to start the app
CMD ["node", "src/interfaces/http/server.js"]