FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Enable corepack and install dependencies
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

# Remove dev dependencies after build
RUN pnpm prune --prod

# Expose port
EXPOSE 3500

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3500

# Start the application using Node.js directly
CMD ["node", "build/index.js"]