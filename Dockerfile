FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3500

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3500

# Start the application using Node.js directly
CMD ["node", "build/index.js"]