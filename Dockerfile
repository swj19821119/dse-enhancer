# Dockerfile for DSE Enhancer
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build app
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
