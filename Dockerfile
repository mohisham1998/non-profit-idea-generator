# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files
COPY package.json ./
COPY patches ./patches

# Install dependencies
RUN pnpm install

# Accept build arguments for Vite environment variables
ARG VITE_APP_ID=nonprofit-ideas-generator
ARG VITE_OAUTH_PORTAL_URL=https://oauth.manus.app
ARG VITE_ANALYTICS_ENDPOINT=""

# Set as environment variables for the build
ENV VITE_APP_ID=${VITE_APP_ID}
ENV VITE_OAUTH_PORTAL_URL=${VITE_OAUTH_PORTAL_URL}
ENV VITE_ANALYTICS_ENDPOINT=${VITE_ANALYTICS_ENDPOINT}

# Copy source code
COPY . .

# Build the application with environment variables available
RUN echo "Building with VITE_APP_ID=${VITE_APP_ID} VITE_OAUTH_PORTAL_URL=${VITE_OAUTH_PORTAL_URL}" && pnpm run build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies (vite is needed at runtime for dev server)
RUN pnpm install

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy drizzle migration files
COPY --from=builder /app/drizzle ./drizzle

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
