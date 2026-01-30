# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc ./

# Enable corepack and install ALL dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set build-time variables for SvelteKit static env
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG AUTH_SECRET
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV AUTH_SECRET=$AUTH_SECRET

# Build the application
RUN pnpm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3 at runtime install if needed
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc ./

# Install ONLY production dependencies
RUN corepack enable && pnpm install --prod --frozen-lockfile

# Copy build artifacts
COPY --from=builder /app/build ./build
COPY --from=builder /app/data ./data

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3500

EXPOSE 3500

# Start the application
CMD ["node", "build/index.js"]