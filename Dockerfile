# Use Node.js 20 Alpine as the build image
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set build arguments with defaults
ARG TURSO_DATABASE_URL=""
ARG TURSO_AUTH_TOKEN=""
ARG YELP_API_KEY=""
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""

# Set environment variables from build arguments
ENV TURSO_DATABASE_URL=$TURSO_DATABASE_URL \
    TURSO_AUTH_TOKEN=$TURSO_AUTH_TOKEN \
    YELP_API_KEY=$YELP_API_KEY \
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts .

# Install ts-node and typescript
RUN npm install -g ts-node typescript

# Install production dependencies for server.ts
RUN npm install @types/node

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]